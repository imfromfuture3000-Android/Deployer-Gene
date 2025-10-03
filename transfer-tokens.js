#!/usr/bin/env node
/**
 * Token Transfer to Program
 */

const { Connection, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

class TokenTransfer {
  constructor() {
    this.connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');
    this.mintAddress = new PublicKey('So11111111111111111111111111111111111111112'); // SOL mint as example
    this.treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY);
  }

  async transferToProgram(programId, amount) {
    try {
      console.log(`🚀 Transferring ${amount} tokens to program: ${programId}`);
      
      const programPubkey = new PublicKey(programId);
      
      // Get associated token accounts
      const sourceATA = await getAssociatedTokenAddress(this.mintAddress, this.treasuryPubkey);
      const destATA = await getAssociatedTokenAddress(this.mintAddress, programPubkey);
      
      console.log(`📤 From: ${sourceATA.toString()}`);
      console.log(`📥 To: ${destATA.toString()}`);
      
      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        sourceATA,
        destATA,
        this.treasuryPubkey,
        BigInt(amount * 1e9) // Convert to base units
      );

      console.log(`✅ Transfer instruction created for ${amount} tokens`);
      return transferInstruction;
      
    } catch (error) {
      console.error('❌ Transfer failed:', error.message);
      return null;
    }
  }

  async checkBalance(address) {
    const pubkey = new PublicKey(address);
    const ata = await getAssociatedTokenAddress(this.mintAddress, pubkey);
    const balance = await this.connection.getTokenAccountBalance(ata);
    console.log(`💰 Balance for ${address}: ${balance.value.uiAmount} tokens`);
    return balance.value.uiAmount;
  }
}

// Execute transfer
async function main() {
  const transfer = new TokenTransfer();
  
  console.log('🔄 TOKEN TRANSFER TO PROGRAM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Example program ID (replace with your actual program)
  const programId = 'YourProgramId1111111111111111111111111111111';
  const amount = 1000; // Amount to transfer
  
  await transfer.checkBalance(process.env.TREASURY_PUBKEY);
  const instruction = await transfer.transferToProgram(programId, amount);
  
  if (instruction) {
    console.log('✅ Transfer instruction ready for execution');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TokenTransfer };