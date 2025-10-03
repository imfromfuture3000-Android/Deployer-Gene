#!/usr/bin/env node
/**
 * Check Real Rebate Balances
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function checkRebates() {
  console.log('💰 CHECKING REAL REBATE BALANCES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  const rebateSources = {
    'MEV Rebates': 'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt',
    'Earnings Vault': 'F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR',
    'NFT Royalties': 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz',
    'Trading Fees': 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1'
  };

  let totalRebates = 0;

  for (const [name, address] of Object.entries(rebateSources)) {
    try {
      const pubkey = new PublicKey(address);
      const balance = await connection.getBalance(pubkey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      console.log(`📊 ${name}: ${solBalance} SOL`);
      console.log(`   Address: ${address}`);
      
      totalRebates += solBalance;
      
    } catch (error) {
      console.log(`❌ ${name}: Error checking balance`);
      console.log(`   Address: ${address}`);
    }
  }

  console.log('\n💎 REBATE SUMMARY:');
  console.log(`Total Available: ${totalRebates} SOL`);
  
  if (totalRebates > 0) {
    console.log('✅ Rebates available for withdrawal');
  } else {
    console.log('❌ No rebates currently available');
  }

  return totalRebates;
}

checkRebates();