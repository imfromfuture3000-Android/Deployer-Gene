#!/usr/bin/env node
/**
 * Check Real Program Transaction History
 */

const { Connection, PublicKey } = require('@solana/web3.js');

async function checkRealProgramTxs() {
  console.log('🔍 CHECKING REAL PROGRAM TRANSACTION HISTORY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  const programs = [
    'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt',
    'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz',
    'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1'
  ];

  for (const programAddr of programs) {
    try {
      const pubkey = new PublicKey(programAddr);
      
      console.log(`\n📋 Program: ${programAddr}`);
      
      // Get recent transactions
      const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 10 });
      
      if (signatures.length > 0) {
        console.log(`✅ Found ${signatures.length} real transactions:`);
        
        signatures.forEach((sig, i) => {
          console.log(`${i + 1}. ${sig.signature}`);
          console.log(`   Slot: ${sig.slot}`);
          console.log(`   Status: ${sig.confirmationStatus}`);
          if (sig.err) console.log(`   Error: ${JSON.stringify(sig.err)}`);
        });
      } else {
        console.log('❌ No transactions found');
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${programAddr}: ${error.message}`);
    }
  }
}

checkRealProgramTxs();