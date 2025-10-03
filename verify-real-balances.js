#!/usr/bin/env node
/**
 * Verify Real Balances - Double Check
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function verifyBalances() {
  console.log('🔍 DOUBLE-CHECKING REAL BALANCES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  const addresses = [
    'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt',
    'F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR', 
    'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz',
    'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1'
  ];

  for (const address of addresses) {
    try {
      const pubkey = new PublicKey(address);
      const balance = await connection.getBalance(pubkey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      console.log(`${address}: ${solBalance} SOL`);
      
      if (solBalance > 0) {
        // Check account info
        const accountInfo = await connection.getAccountInfo(pubkey);
        console.log(`  Owner: ${accountInfo?.owner?.toString() || 'System Program'}`);
        console.log(`  Executable: ${accountInfo?.executable || false}`);
      }
      
    } catch (error) {
      console.log(`${address}: ERROR - ${error.message}`);
    }
    console.log('');
  }
}

verifyBalances();