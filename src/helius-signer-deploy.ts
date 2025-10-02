import { Connection, Keypair, PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { createInitializeMintInstruction, TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import * as dotenv from 'dotenv';
import { AmazonQQuantumInterface } from '../quantum-protocol';

dotenv.config();

interface HeliusDeployConfig {
  userSigner: PublicKey;
  feePayer: PublicKey;
  priorityFee: number;
  computeUnits: number;
  heliusEndpoint: string;
}

class HeliusSignerDeployer {
  private config: HeliusDeployConfig;
  private connection: Connection;
  private amazonQ: AmazonQQuantumInterface;

  constructor() {
    this.amazonQ = AmazonQQuantumInterface.getInstance();
    this.config = {
      userSigner: new PublicKey('58DYhzDEZk'), // Your signer address
      feePayer: new PublicKey('EXba4hb8WC'), // Helius fee payer
      priorityFee: 0, // 0.0000000 SOL as shown
      computeUnits: 207932, // From transaction details
      heliusEndpoint: process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com'
    };
    this.connection = new Connection(this.config.heliusEndpoint, 'confirmed');
  }

  async deployWithHeliusPriority(): Promise<string> {
    console.log('⚡ Helius Signer-Only Deployment Protocol Activated');
    console.log(`🔑 Signer: ${this.config.userSigner.toBase58()}`);
    console.log(`💰 Fee Payer: ${this.config.feePayer.toBase58()}`);
    console.log(`⚡ Priority Fee: ${this.config.priorityFee} SOL`);
    console.log(`🖥️ Compute Units: ${this.config.computeUnits}`);

    const mintKeypair = Keypair.generate();
    const tx = new Transaction();

    // Add compute budget instructions (Helius optimization)
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: this.config.computeUnits
      })
    );

    if (this.config.priorityFee > 0) {
      tx.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: this.config.priorityFee * 1000000
        })
      );
    }

    // Create mint account
    tx.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        9,
        this.config.userSigner,
        this.config.userSigner,
        TOKEN_2022_PROGRAM_ID
      )
    );

    // Set fee payer and get recent blockhash
    tx.feePayer = this.config.feePayer;
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;

    // Sign with user (signer-only, not payer)
    tx.partialSign(mintKeypair);

    console.log('✅ Transaction prepared with Helius priority structure');
    console.log(`🎯 Mint Address: ${mintKeypair.publicKey.toBase58()}`);
    
    return mintKeypair.publicKey.toBase58();
  }

  async mintToTreasury(mintAddress: string, amount: bigint): Promise<void> {
    const mint = new PublicKey(mintAddress);
    const treasuryAta = await getAssociatedTokenAddress(
      mint,
      this.config.userSigner,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const tx = new Transaction();
    
    // Helius compute optimization
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: this.config.computeUnits }),
      createAssociatedTokenAccountInstruction(
        this.config.feePayer, // Fee payer creates ATA
        treasuryAta,
        this.config.userSigner, // Owner
        mint,
        TOKEN_2022_PROGRAM_ID
      ),
      createMintToInstruction(
        mint,
        treasuryAta,
        this.config.userSigner, // Mint authority (signer)
        amount,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    tx.feePayer = this.config.feePayer;
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;

    console.log(`💰 Minting ${amount} tokens to treasury ATA: ${treasuryAta.toBase58()}`);
  }
}

export { HeliusSignerDeployer };