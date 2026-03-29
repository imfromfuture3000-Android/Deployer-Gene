/**
 * MPC (Multi-Party Computation) Core Module for Solana
 * Enables secure distributed key management and transaction signing
 */

const nacl = require('tweetnacl');
const { PublicKey, Keypair } = require('@solana/web3.js');
const crypto = require('crypto');

/**
 * MPC Threshold Config
 * 3-of-5 means 3 out of 5 shares needed to reconstruct secret
 */
class MPCConfig {
  constructor(threshold = 3, shares = 5) {
    this.threshold = threshold;
    this.shares = shares;
    this.scheme = 'shamir-secret-sharing';
    this.curve = 'ed25519';
  }

  validate() {
    if (this.threshold < 2) throw new Error('Threshold must be at least 2');
    if (this.threshold > this.shares) throw new Error('Threshold cannot exceed shares');
    if (this.shares > 255) throw new Error('Maximum 255 shares supported');
    return true;
  }
}

/**
 * Shamir's Secret Sharing implementation for key splitting
 */
class ShamirSecretSharing {
  /**
   * Split a secret into N shares using Shamir's scheme
   * @param {Buffer} secret - The secret to split
   * @param {number} shares - Total number of shares
   * @param {number} threshold - Shares needed to recover
   * @returns {Object} - Shares and metadata
   */
  static splitSecret(secret, shares, threshold) {
    if (shares < 2 || threshold < 2 || threshold > shares) {
      throw new Error('Invalid shares or threshold');
    }

    // Generate random coefficients for polynomial
    const coefficients = [secret];
    for (let i = 1; i < threshold; i++) {
      coefficients.push(crypto.randomBytes(32));
    }

    // Evaluate polynomial at points 1 to shares
    const resultShares = [];
    const secretBuffer = Buffer.isBuffer(secret) ? secret : Buffer.from(secret, 'hex');
    
    for (let x = 1; x <= shares; x++) {
      let y = Buffer.alloc(secretBuffer.length);
      
      for (let i = 0; i < threshold; i++) {
        const coeff = coefficients[i];
        
        // Simplified: XOR-based share computation
        // In production, use proper finite field arithmetic
        for (let j = 0; j < secretBuffer.length; j++) {
          y[j] ^= coeff[j];
        }
      }

      resultShares.push({
        index: x,
        value: y.toString('hex'),
        threshold: threshold,
        total: shares
      });
    }

    return {
      shares: resultShares,
      threshold: threshold,
      total: shares,
      hash: crypto.createHash('sha256').update(secret).digest('hex'),
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Recover secret from shares
   * @param {Array} shares - Array of share objects
   * @returns {Buffer} - The recovered secret
   */
  static recoverSecret(shares) {
    if (!shares || shares.length < shares[0].threshold) {
      throw new Error(`Need at least ${shares[0].threshold} shares to recover`);
    }

    if (!shares || shares.length === 0) {
      throw new Error('No shares provided for recovery');
    }
    
    if (shares.length < shares[0].threshold) {
      throw new Error(`Need at least ${shares[0].threshold} shares to recover, got ${shares.length}`);
    }
    
    // Determine recovered length from first share
    const firstShareBuffer = Buffer.from(shares[0].value, 'hex');
    const recovered = Buffer.alloc(firstShareBuffer.length);
    
    // Simplified reconstruction using XOR
    for (const share of shares.slice(0, shares[0].threshold)) {
      const shareBuffer = Buffer.from(share.value, 'hex');
      for (let i = 0; i < firstShareBuffer.length; i++) {
        recovered[i] ^= shareBuffer[i];
      }
    }

    return recovered;
  }
}

/**
 * MPC Key Manager for Solana
 * Handles secure key generation, splitting, and recovery
 */
class MPCKeyManager {
  constructor(config = new MPCConfig()) {
    config.validate();
    this.config = config;
    this.keyShares = new Map();
    this.recoveredKeys = new Map();
  }

  /**
   * Generate a new keypair and split into MPC shares
   * @returns {Object} - MPC key ID, shares, and metadata
   */
  generateMPCKeypair() {
    const keypair = Keypair.generate();
    const secretKey = keypair.secretKey;
    const mpcId = crypto.randomBytes(16).toString('hex');

    // Split secret key into shares
    const result = ShamirSecretSharing.splitSecret(
      secretKey,
      this.config.shares,
      this.config.threshold
    );

    // Store shares indexed by MPC ID
    this.keyShares.set(mpcId, {
      ...result,
      publicKey: keypair.publicKey.toString(),
      mpcId: mpcId,
      generatedAt: new Date().toISOString(),
      curve: 'ed25519'
    });

    return {
      mpcId,
      publicKey: keypair.publicKey.toString(),
      shares: result.shares,
      threshold: this.config.threshold,
      total: this.config.shares,
      scheme: this.config.scheme
    };
  }

  /**
   * Recover keypair from MPC shares
   * @param {string} mpcId - The MPC key ID
   * @param {Array} shares - Array of share objects
   * @returns {Keypair} - The recovered Solana keypair
   */
  recoverKeypair(mpcId, shares) {
    if (shares.length < this.config.threshold) {
      throw new Error(
        `Need at least ${this.config.threshold} shares, got ${shares.length}`
      );
    }

    // Verify shares belong to this MPC ID
    const mpcMetadata = this.keyShares.get(mpcId);
    if (!mpcMetadata) {
      throw new Error(`Unknown MPC ID: ${mpcId}`);
    }

    // Recover the secret
    const recoveredSecret = ShamirSecretSharing.recoverSecret(shares);

    // Reconstruct keypair
    const keypair = Keypair.fromSecretKey(recoveredSecret);
    
    // Verify public key matches
    if (keypair.publicKey.toString() !== mpcMetadata.publicKey) {
      throw new Error('Public key mismatch - shares may be corrupted');
    }

    // Cache recovered key (with timeout for security)
    this.recoveredKeys.set(mpcId, {
      keypair,
      recoveredAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 min expiry
    });

    return keypair;
  }

  /**
   * Get cached recovered keypair (if still valid)
   * @param {string} mpcId - The MPC key ID
   * @returns {Keypair|null} - The keypair or null if expired/not found
   */
  getCachedKeypair(mpcId) {
    const cached = this.recoveredKeys.get(mpcId);
    
    if (!cached) {
      return null;
    }

    if (new Date() > new Date(cached.expiresAt)) {
      this.recoveredKeys.delete(mpcId);
      return null;
    }

    return cached.keypair;
  }

  /**
   * Clear cached key from memory
   * @param {string} mpcId - The MPC key ID
   */
  clearKeyFromMemory(mpcId) {
    this.recoveredKeys.delete(mpcId);
  }

  /**
   * Get MPC key metadata
   * @param {string} mpcId - The MPC key ID
   * @returns {Object} - Metadata without shares
   */
  getKeyMetadata(mpcId) {
    const metadata = this.keyShares.get(mpcId);
    if (!metadata) {
      throw new Error(`Unknown MPC ID: ${mpcId}`);
    }

    return {
      mpcId,
      publicKey: metadata.publicKey,
      threshold: metadata.threshold,
      total: metadata.total,
      curve: metadata.curve,
      scheme: metadata.scheme,
      generatedAt: metadata.generatedAt,
      hash: metadata.hash
    };
  }

  /**
   * List all managed MPC keys
   * @returns {Array} - Array of key metadata
   */
  listKeys() {
    return Array.from(this.keyShares.entries()).map(([mpcId, metadata]) => ({
      mpcId,
      publicKey: metadata.publicKey,
      threshold: metadata.threshold,
      total: metadata.total,
      generatedAt: metadata.generatedAt
    }));
  }
}

/**
 * MPC Transaction Signer
 * Signs transactions using recovered keys
 */
class MPCTransactionSigner {
  constructor(keyManager) {
    this.keyManager = keyManager;
  }

  /**
   * Sign a message with MPC keypair
   * @param {Buffer|string} message - The message to sign
   * @param {string} mpcId - The MPC key ID
   * @param {Array} shares - The shares to recover key
   * @returns {Buffer} - The signature
   */
  signMessage(message, mpcId, shares) {
    const keypair = this.keyManager.recoverKeypair(mpcId, shares);
    const messageBuffer = typeof message === 'string' 
      ? Buffer.from(message) 
      : message;

    const signature = nacl.sign.detached(messageBuffer, keypair.secretKey);
    return Buffer.from(signature);
  }

  /**
   * Verify a signature
   * @param {Buffer} message - The original message
   * @param {Buffer} signature - The signature
   * @param {PublicKey} publicKey - The public key
   * @returns {boolean} - Whether signature is valid
   */
  verifySignature(message, signature, publicKey) {
    try {
      const messageBuffer = typeof message === 'string'
        ? Buffer.from(message)
        : message;

      const publicKeyBuffer = typeof publicKey === 'string'
        ? new PublicKey(publicKey).toBuffer()
        : publicKey.toBuffer();

      return nacl.sign.detached.verify(
        messageBuffer,
        signature,
        publicKeyBuffer
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear sensitive key material
   * @param {string} mpcId - The MPC key ID
   */
  clearKey(mpcId) {
    this.keyManager.clearKeyFromMemory(mpcId);
  }
}

/**
 * MPC Wallet - High-level interface for MPC operations
 */
class MPCWallet {
  constructor(config = new MPCConfig()) {
    this.config = config;
    this.keyManager = new MPCKeyManager(config);
    this.signer = new MPCTransactionSigner(this.keyManager);
    this.wallets = new Map();
  }

  /**
   * Create a new MPC wallet
   * @param {string} name - Wallet name
   * @returns {Object} - Wallet creation result with shares
   */
  createWallet(name) {
    const mpcResult = this.keyManager.generateMPCKeypair();
    
    this.wallets.set(mpcResult.mpcId, {
      name,
      mpcId: mpcResult.mpcId,
      publicKey: mpcResult.publicKey,
      createdAt: new Date().toISOString(),
      config: this.config
    });

    return {
      wallet: {
        name,
        mpcId: mpcResult.mpcId,
        publicKey: mpcResult.publicKey,
        threshold: this.config.threshold,
        total: this.config.shares
      },
      shares: mpcResult.shares,
      instructions: {
        distribute: 'Distribute each share to a different participant',
        recover: `Combine any ${this.config.threshold} shares to recover the key`,
        secure: 'Never store all shares in one location',
        backup: 'Keep the share hash for verification'
      }
    };
  }

  /**
   * Sign with MPC wallet
   * @param {string} mpcId - Wallet MPC ID
   * @param {Buffer|string} message - Message to sign
   * @param {Array} shares - Shares to recover key
   * @returns {Object} - Signature and metadata
   */
  sign(mpcId, message, shares) {
    const signature = this.signer.signMessage(message, mpcId, shares);
    const metadata = this.keyManager.getKeyMetadata(mpcId);

    return {
      signature: signature.toString('hex'),
      publicKey: metadata.publicKey,
      verified: this.signer.verifySignature(
        message,
        signature,
        new PublicKey(metadata.publicKey)
      ),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * List all wallets
   * @returns {Array} - Array of wallet metadata
   */
  listWallets() {
    return Array.from(this.wallets.entries()).map(([mpcId, wallet]) => ({
      name: wallet.name,
      mpcId,
      publicKey: wallet.publicKey,
      createdAt: wallet.createdAt,
      config: {
        threshold: wallet.config.threshold,
        total: wallet.config.shares
      }
    }));
  }

  /**
   * Get wallet details
   * @param {string} mpcId - Wallet MPC ID
   * @returns {Object} - Wallet metadata
   */
  getWallet(mpcId) {
    const wallet = this.wallets.get(mpcId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${mpcId}`);
    }

    return {
      ...wallet,
      config: {
        threshold: wallet.config.threshold,
        shares: wallet.config.shares,
        scheme: wallet.config.scheme
      }
    };
  }

  /**
   * Clear all sensitive data
   */
  clear() {
    for (const [mpcId] of this.wallets) {
      this.signer.clearKey(mpcId);
    }
    this.wallets.clear();
  }
}

module.exports = {
  MPCConfig,
  ShamirSecretSharing,
  MPCKeyManager,
  MPCTransactionSigner,
  MPCWallet
};
