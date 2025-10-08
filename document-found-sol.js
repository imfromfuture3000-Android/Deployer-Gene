#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

const SOURCE = '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y';
const DESTINATION = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';

async function documentFoundSOL() {
  console.log('📋 DOCUMENT FOUND SOL - NO PRIVATE KEY NEEDED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

  const balance = await connection.getBalance(new PublicKey(SOURCE));
  const destBalance = await connection.getBalance(new PublicKey(DESTINATION));

  console.log('💰 FOUND SOL REPORT:\n');
  console.log(`Source: ${SOURCE}`);
  console.log(`Balance: ${(balance / 1e9).toFixed(9)} SOL`);
  console.log(`Status: LOCKED (No private key)\n`);

  console.log(`Destination: ${DESTINATION}`);
  console.log(`Balance: ${(destBalance / 1e9).toFixed(9)} SOL\n`);

  const report = {
    timestamp: new Date().toISOString(),
    foundSOL: {
      address: SOURCE,
      balance: balance / 1e9,
      status: 'locked_no_private_key',
      note: 'SOL found but cannot be transferred without private key'
    },
    destination: {
      address: DESTINATION,
      balance: destBalance / 1e9,
      type: 'backpack_wallet'
    },
    recommendation: 'SOL is documented but inaccessible without private key. Consider this address as archived.',
    explorer: `https://explorer.solana.com/address/${SOURCE}`
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`💰 Found SOL: ${(balance / 1e9).toFixed(9)} SOL`);
  console.log(`🔒 Status: LOCKED (No private key available)`);
  console.log(`📋 Action: Documented for records`);
  console.log(`🔗 Explorer: https://explorer.solana.com/address/${SOURCE}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  fs.writeFileSync('.cache/locked-sol-report.json', JSON.stringify(report, null, 2));
  console.log('\n✅ Report saved to .cache/locked-sol-report.json');
  console.log('📋 SOL documented as inaccessible without private key');
}

documentFoundSOL().catch(console.error);
