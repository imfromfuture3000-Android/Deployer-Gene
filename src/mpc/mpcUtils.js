/**
 * MPC Utilities - Helper functions for MPC operations
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Share Storage Manager - Securely store/retrieve MPC shares
 */
class ShareStorage {
  constructor(encryptionKey = process.env.MPC_STORAGE_KEY || 'demo-storage-key', dir = '.cache/mpc-shares') {
    this.encryptionKey = encryptionKey;
    this.dir = dir;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Encrypt a single share and return encrypted package
   * @param {Object} share
   * @returns {Object} encrypted package
   */
  encryptShare(share) {
    const data = JSON.stringify(share);
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encrypted: encrypted
    };
  }

  /**
   * Decrypt an encrypted share package
   * @param {Object} package
   * @returns {Object} decrypted share
   */
  decryptShare(pkg) {
    const iv = Buffer.from(pkg.iv, 'hex');
    const authTag = Buffer.from(pkg.authTag, 'hex');
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(pkg.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Save shares to encrypted file
   * @param {Array} shares - The shares to save
   * @param {string} filename - Where to save
   * @param {string} encryptionKey - Key for encryption
   */
  static saveShares(shares, filename, encryptionKey) {
    const data = JSON.stringify(shares, null, 2);
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    const fileData = {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encrypted: encrypted
    };

    fs.writeFileSync(filename, JSON.stringify(fileData, null, 2));
    return { success: true, file: filename };
  }

  /**
   * Load shares from encrypted file
   * @param {string} filename - File to load from
   * @param {string} encryptionKey - Decryption key
   * @returns {Array} - The decrypted shares
   */
  static loadShares(filename, encryptionKey) {
    const fileData = JSON.parse(fs.readFileSync(filename, 'utf8'));
    const iv = Buffer.from(fileData.iv, 'hex');
    const authTag = Buffer.from(fileData.authTag, 'hex');
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(fileData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}

/**
 * Share Distribution Manager
 * Handles distributing shares among participants
 */
class ShareDistributor {
  /**
   * Create distribution package
   * @param {Array} shares - The shares to distribute
   * @param {Array} participants - Participant info (name, email)
   * @returns {Object} - Distribution packages
   */
  static createDistributionPackages(shares, participants) {
    if (shares.length < participants.length) {
      throw new Error('Not enough shares for all participants');
    }

    const packages = participants.map((participant, index) => ({
      participantId: crypto.randomBytes(16).toString('hex'),
      name: participant.name,
      email: participant.email,
      share: shares[index],
      index: index + 1,
      total: shares.length,
      threshold: shares[0].threshold,
      createdAt: new Date().toISOString(),
      instructions: [
        '1. Store this share securely',
        '2. Do not share with others',
        `3. ${shares[0].threshold} shares needed to recover key`,
        '4. Keep for disaster recovery'
      ]
    }));

    return {
      packages,
      metadata: {
        totalParticipants: participants.length,
        sharesDistributed: shares.length,
        threshold: shares[0].threshold,
        createdAt: new Date().toISOString()
      }
    };
  }

  /**
   * Verify share integrity
   * @param {Object} share - The share to verify
   * @param {string} expectedHash - Expected hash
   * @returns {boolean} - Whether share is valid
   */
  static verifyShare(share, expectedHash) {
    const shareString = JSON.stringify(share);
    const hash = crypto.createHash('sha256').update(shareString).digest('hex');
    return hash === expectedHash;
  }
}

/**
 * Audit Logger - Track all MPC operations
 */
class AuditLogger {
  constructor(logDir = '.cache/mpc-audit') {
    this.logDir = logDir;
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.logs = [];
  }

  /**
   * Log an MPC operation
   * @param {Object} event - Event to log
   */
  log(event) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      mpcId: event.mpcId,
      action: event.action,
      status: event.status,
      details: event.details,
      user: event.user || 'unknown'
    };

    this.logs.push(entry);

    // Write to file
    const filename = path.join(
      this.logDir,
      `audit-${new Date().toISOString().split('T')[0]}.json`
    );

    let existing = [];
    if (fs.existsSync(filename)) {
      existing = JSON.parse(fs.readFileSync(filename, 'utf8'));
    }

    existing.push(entry);
    fs.writeFileSync(filename, JSON.stringify(existing, null, 2));

    return entry;
  }

  /**
   * Get audit logs
   * @param {string} mpcId - Filter by MPC ID
   * @returns {Array} - Audit logs
   */
  getLogs(mpcId = null) {
    if (mpcId) {
      return this.logs.filter(log => log.mpcId === mpcId);
    }
    return this.logs;
  }

  /**
   * Get audit summary
   * @returns {Object} - Summary statistics
   */
  getSummary() {
    return {
      totalEvents: this.logs.length,
      keyGenerations: this.logs.filter(l => l.action === 'generate').length,
      keyRecoveries: this.logs.filter(l => l.action === 'recover').length,
      signatures: this.logs.filter(l => l.action === 'sign').length,
      failures: this.logs.filter(l => l.status === 'failed').length
    };
  }
}

/**
 * Security Validator - Validate MPC operations
 */
class SecurityValidator {
  /**
   * Validate share format
   * @param {Object} share - Share to validate
   * @returns {Object} - Validation result
   */
  static validateShare(share) {
    const errors = [];

    if (!share.index || typeof share.index !== 'number') {
      errors.push('Missing or invalid share index');
    }

    if (!share.value || typeof share.value !== 'string') {
      errors.push('Missing or invalid share value');
    }

    if (!share.threshold || share.threshold < 2) {
      errors.push('Invalid threshold');
    }

    if (!share.total || share.total < share.threshold) {
      errors.push('Invalid total shares');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate recovery attempt
   * @param {Array} shares - Shares provided
   * @param {number} threshold - Required threshold
   * @returns {Object} - Validation result
   */
  static validateRecoveryAttempt(shares, threshold) {
    const validation = {
      shareCount: shares.length,
      threshold: threshold,
      sufficient: shares.length >= threshold,
      errors: []
    };

    if (shares.length < threshold) {
      validation.errors.push(
        `Need ${threshold} shares, only ${shares.length} provided`
      );
    }

    // Validate each share
    for (const share of shares) {
      const shareValidation = this.validateShare(share);
      if (!shareValidation.valid) {
        validation.errors.push(`Share ${share.index}: ${shareValidation.errors.join(', ')}`);
      }
    }

    return validation;
  }

  /**
   * Rate limiting check
   * @param {string} mpcId - The MPC ID
   * @param {number} maxAttemptsPerHour - Max attempts allowed
   * @returns {boolean} - Whether request is allowed
   */
  static checkRateLimit(mpcId, maxAttemptsPerHour = 10) {
    // In production, implement actual rate limiting
    // using Redis or similar
    return true;
  }
}

/**
 * Configuration Manager - Manage MPC configuration
 */
class ConfigManager {
  /**
   * Load MPC configuration
   * @param {string} configPath - Path to config file
   * @returns {Object} - Configuration
   */
  static loadConfig(configPath = '.mpc-config.json') {
    if (!fs.existsSync(configPath)) {
      return this.getDefaultConfig();
    }

    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  /**
   * Save MPC configuration
   * @param {Object} config - Configuration to save
   * @param {string} configPath - Path to save to
   */
  static saveConfig(config, configPath = '.mpc-config.json') {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Get default configuration
   * @returns {Object} - Default config
   */
  static getDefaultConfig() {
    return {
      scheme: 'shamir-secret-sharing',
      curve: 'ed25519',
      defaultThreshold: 3,
      defaultShares: 5,
      keyExpiryMinutes: 5,
      maxRecoveryAttempts: 10,
      encryptionAlgorithm: 'aes-256-gcm',
      storage: {
        type: 'filesystem',
        directory: '.cache/mpc-shares',
        encrypted: true
      },
      audit: {
        enabled: true,
        directory: '.cache/mpc-audit',
        retentionDays: 90
      }
    };
  }
}

module.exports = {
  ShareStorage,
  ShareDistributor,
  AuditLogger,
  SecurityValidator,
  ConfigManager
};
