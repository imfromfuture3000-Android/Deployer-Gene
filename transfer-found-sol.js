#!/usr/bin/env node
require('dotenv').config();
const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');

const SOURCE = '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y';
const DESTINATION = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';
const AMOUNT = 0.111274966;

async function transferFoundSOL() {
  console.log('💰 TRANSFER FOUND SOL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

  console.log(`📤 From: ${SOURCE}`);
  console.log(`📥 To: ${DESTINATION}`);
  console.log(`💰 Amount: ${AMOUNT} SOL\n`);

  console.log('⚠️  TRANSFER REQUIRES:');
  console.log('   Private key for source address: 8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y');
  console.log('   This is the relayer_address from treasury_operational\n');

  console.log('✅ FOUND SOL: 0.111274966 SOL');
  console.log('🎯 Ready to transfer to Backpack wallet\n');

  const results = {
    timestamp: new Date().toISOString(),
    source: SOURCE,
    destination: DESTINATION,
    amount: AMOUNT,
    status: 'requires_private_key',
    note: 'Source wallet has SOL but needs private key to transfer'
  };

  fs.writeFileSync('.cache/found-sol-transfer.json', JSON.stringify(results, null, 2));
  console.log('✅ Transfer details saved to .cache/found-sol-transfer.json');
}

transferFoundSOL().catch(console.error);
