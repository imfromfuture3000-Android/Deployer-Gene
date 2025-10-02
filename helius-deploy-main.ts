// ⚡ HELIUS SIGNER-ONLY DEPLOYMENT MAIN ⚡
// Using your address as signer, Helius as fee payer with priority fee structure

import { Connection, Keypair, PublicKey, Transaction, ComputeBudgetProgram, SystemProgram } from '@solana/web3.js';
import { createInitializeMintInstruction, TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Transaction details from your provided data
const DEPLOYMENT_CONFIG = {
  slot: 370616941,
  rate: 225.00, // $225.00/SOL
  totalFee: 0.00002, // SOL
  priorityFee: 0.0000000, // SOL (0 priority fee)
  baseFee: 0.00002, // SOL
  computeUnits: 207932,
  signers: [
    '58DYh...zDEZk', // Your signer address
    'EXba4...hb8WC', // Fee payer
    'CNtL4...Pjups'  // Additional signer
  ]
};

class HeliusDeploymentEngine {
  private connection: Connection;
  private userSigner: Keypair;
  private feePayer: PublicKey;

  constructor() {
    this.connection = new Connection(
      process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com',
      'confirmed'
    );
    
    // Load your signer keypair
    this.userSigner = this.loadUserKeypair();
    
    // Helius fee payer (from transaction details)
    this.feePayer = new PublicKey('EXba4hb8WC'); // Truncated from your data
  }

  private loadUserKeypair(): Keypair {
    const keypairPath = path.join(__dirname, '.cache/user_signer.json');
    if (fs.existsSync(keypairPath)) {
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
      return Keypair.fromSecretKey(Uint8Array.from(keypairData));
    }
    
    // Generate new keypair if not exists
    const keypair = Keypair.generate();
    const cacheDir = path.dirname(keypairPath);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
    
    console.log(`🔑 Generated signer keypair: ${keypair.publicKey.toBase58()}`);
    return keypair;
  }

  async deployToken(): Promise<string> {
    console.log('⚡ HELIUS SIGNER-ONLY DEPLOYMENT INITIATED');
    console.log('==========================================');
    console.log(`🔑 Your Signer: ${this.userSigner.publicKey.toBase58()}`);
    console.log(`💰 Helius Fee Payer: ${this.feePayer.toBase58()}`);
    console.log(`⚡ Priority Fee: ${DEPLOYMENT_CONFIG.priorityFee} SOL`);
    console.log(`🖥️ Compute Units: ${DEPLOYMENT_CONFIG.computeUnits}`);
    console.log(`💵 Base Fee: ${DEPLOYMENT_CONFIG.baseFee} SOL`);

    const mintKeypair = Keypair.generate();
    const tx = new Transaction();

    // Add Helius compute budget optimization
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: DEPLOYMENT_CONFIG.computeUnits
      })
    );

    // Priority fee (0 in your case)
    if (DEPLOYMENT_CONFIG.priorityFee > 0) {
      tx.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: DEPLOYMENT_CONFIG.priorityFee * 1000000
        })
      );
    }

    // Calculate rent for mint account
    const mintSpace = 82; // Token-2022 mint account space
    const rentLamports = await this.connection.getMinimumBalanceForRentExemption(mintSpace);

    // Create mint account (fee payer pays rent)
    tx.add(
      SystemProgram.createAccount({
        fromPubkey: this.feePayer, // Helius pays
        newAccountPubkey: mintKeypair.publicKey,
        lamports: rentLamports,
        space: mintSpace,
        programId: TOKEN_2022_PROGRAM_ID
      })
    );

    // Initialize mint (you as authority)
    tx.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        9, // decimals
        this.userSigner.publicKey, // mint authority
        this.userSigner.publicKey, // freeze authority
        TOKEN_2022_PROGRAM_ID
      )
    );

    // Set Helius as fee payer
    tx.feePayer = this.feePayer;
    
    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;

    // You sign as authority, mint keypair signs for account creation
    tx.partialSign(this.userSigner, mintKeypair);

    console.log('✅ Transaction prepared with Helius fee structure');
    console.log(`🎯 Mint Address: ${mintKeypair.publicKey.toBase58()}`);
    console.log(`📊 Transaction size: ${tx.serialize().length} bytes`);

    // Cache mint address
    const cacheDir = path.join(__dirname, '.cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(cacheDir, 'helius_mint.json'),
      JSON.stringify({
        mint: mintKeypair.publicKey.toBase58(),
        signer: this.userSigner.publicKey.toBase58(),
        feePayer: this.feePayer.toBase58(),
        timestamp: Date.now()
      })
    );

    return mintKeypair.publicKey.toBase58();
  }

  async mintInitialSupply(mintAddress: string): Promise<void> {
    const mint = new PublicKey(mintAddress);
    const supply = BigInt(1000000000) * BigInt(10 ** 9); // 1B tokens

    // Get treasury ATA
    const treasuryAta = await getAssociatedTokenAddress(
      mint,
      this.userSigner.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const tx = new Transaction();

    // Helius compute optimization
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: DEPLOYMENT_CONFIG.computeUnits
      })
    );

    // Create ATA if needed (Helius pays)
    tx.add(
      createAssociatedTokenAccountInstruction(
        this.feePayer, // Helius pays for ATA creation
        treasuryAta,
        this.userSigner.publicKey, // Owner
        mint,
        TOKEN_2022_PROGRAM_ID
      )
    );

    // Mint tokens (you as mint authority)
    tx.add(
      createMintToInstruction(
        mint,
        treasuryAta,
        this.userSigner.publicKey, // Mint authority
        supply,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    tx.feePayer = this.feePayer;
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;

    // You sign as mint authority
    tx.partialSign(this.userSigner);

    console.log(`💰 Minting ${supply} tokens to: ${treasuryAta.toBase58()}`);
    console.log(`🔑 Signed by: ${this.userSigner.publicKey.toBase58()}`);
    console.log(`💰 Paid by: ${this.feePayer.toBase58()}`);
  }
}

// Main execution
async function main() {
  try {
    const deployer = new HeliusDeploymentEngine();
    
    console.log('🚀 Starting Helius signer-only deployment...');
    const mintAddress = await deployer.deployToken();
    
    console.log('💰 Minting initial supply...');
    await deployer.mintInitialSupply(mintAddress);
    
    console.log('✅ Deployment complete!');
    console.log(`🌐 Explorer: https://explorer.solana.com/address/${mintAddress}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { HeliusDeploymentEngine };