#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');

const HELIUS_TIP_ACCOUNTS = [
  'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
  'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
  '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
  'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe'
];

const MEV_PROTECTION_ACCOUNTS = [
  '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5', // Jupiter tip account
  'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe'  // MEV protection
];

async function checkRebateReceivers() {
  console.log('💰 CHECKING REBATE RECEIVERS - HELIUS & MEV');
  console.log('=' .repeat(60));

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  let totalRebates = 0;
  let totalMEVProtection = 0;

  console.log('🎯 HELIUS TIP ACCOUNTS:');
  for (const tipAccount of HELIUS_TIP_ACCOUNTS) {
    try {
      const pubkey = new PublicKey(tipAccount);
      const balance = await connection.getBalance(pubkey);
      const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 3 });
      
      console.log(`\n📍 ${tipAccount}`);
      console.log(`   💰 Balance: ${(balance / 1e9).toFixed(6)} SOL`);
      console.log(`   📊 Recent TXs: ${signatures.length}`);
      
      if (signatures.length > 0) {
        console.log(`   🕐 Last Activity: ${new Date(signatures[0].blockTime * 1000).toISOString()}`);
        console.log(`   ✅ Status: ACTIVE`);
      } else {
        console.log(`   ⏳ Status: NO RECENT ACTIVITY`);
      }
      
      totalRebates += balance;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🛡️ MEV PROTECTION ACCOUNTS:');
  for (const mevAccount of MEV_PROTECTION_ACCOUNTS) {
    try {
      const pubkey = new PublicKey(mevAccount);
      const balance = await connection.getBalance(pubkey);
      const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 3 });
      
      console.log(`\n🔒 ${mevAccount}`);
      console.log(`   💰 Balance: ${(balance / 1e9).toFixed(6)} SOL`);
      console.log(`   📊 Recent TXs: ${signatures.length}`);
      
      if (signatures.length > 0) {
        console.log(`   🕐 Last Activity: ${new Date(signatures[0].blockTime * 1000).toISOString()}`);
        console.log(`   🛡️ MEV Protection: ACTIVE`);
      }
      
      totalMEVProtection += balance;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // Check treasury receiver
  const treasuryAddress = process.env.TREASURY_PUBKEY || 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6';
  try {
    const treasuryPubkey = new PublicKey(treasuryAddress);
    const treasuryBalance = await connection.getBalance(treasuryPubkey);
    
    console.log('\n🏦 TREASURY RECEIVER:');
    console.log(`📍 ${treasuryAddress}`);
    console.log(`💰 Balance: ${(treasuryBalance / 1e9).toFixed(6)} SOL`);
    console.log(`📈 15% Cut Ready: ${((totalRebates * 0.15) / 1e9).toFixed(6)} SOL`);
    
  } catch (error) {
    console.log(`❌ Treasury Error: ${error.message}`);
  }

  console.log('\n📊 REBATE & MEV SUMMARY:');
  console.log(`   💰 Total Helius Rebates: ${(totalRebates / 1e9).toFixed(6)} SOL`);
  console.log(`   🛡️ Total MEV Protection: ${(totalMEVProtection / 1e9).toFixed(6)} SOL`);
  console.log(`   🏦 Treasury Cut (15%): ${((totalRebates * 0.15) / 1e9).toFixed(6)} SOL`);
  console.log(`   👥 User Rebates (85%): ${((totalRebates * 0.85) / 1e9).toFixed(6)} SOL`);
  console.log(`   🔒 Config Status: ${process.env.CONFIG_LOCKED === 'true' ? 'LOCKED' : 'UNLOCKED'}`);
}

if (require.main === module) {
  checkRebateReceivers().catch(console.error);
}

module.exports = { checkRebateReceivers };