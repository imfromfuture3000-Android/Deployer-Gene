#!/usr/bin/env node
/**
 * Mainnet Relayer Deployment - Signer Only
 */

const { Connection, Transaction } = require('@solana/web3.js');

class MainnetRelayerDeploy {
  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com');
    this.relayerUrl = process.env.RELAYER_URL;
    this.relayerPubkey = process.env.RELAYER_PUBKEY;
  }

  async deployWithRelayer(instructions, signer) {
    console.log('🚀 MAINNET RELAYER DEPLOYMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 Network: MAINNET-BETA ONLY');
    console.log('💰 Fee Payer: RELAYER');
    console.log('✍️ Role: SIGNER ONLY');
    
    const transaction = new Transaction();
    instructions.forEach(ix => transaction.add(ix));
    
    // Set relayer as fee payer
    transaction.feePayer = this.relayerPubkey;
    
    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Sign with user (signer only)
    transaction.partialSign(signer);
    
    // Send to relayer
    const serialized = transaction.serialize({ requireAllSignatures: false });
    
    console.log('✅ Transaction signed by user');
    console.log('📤 Sending to relayer for fee payment');
    console.log(`🔗 Relayer: ${this.relayerUrl}`);
    
    return serialized;
  }
}

module.exports = { MainnetRelayerDeploy };