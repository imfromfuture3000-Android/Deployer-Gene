#!/usr/bin/env node
/**
 * Check Program Authority & Withdrawal Functions
 */

const { Connection, PublicKey } = require('@solana/web3.js');

async function checkProgramAuthority() {
  console.log('🔍 CHECKING PROGRAM AUTHORITY & WITHDRAWAL RIGHTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const owner = new PublicKey('zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  
  const programs = [
    'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt',
    'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', 
    'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1'
  ];

  for (const programAddr of programs) {
    try {
      const programId = new PublicKey(programAddr);
      const balance = await connection.getBalance(programId);
      const solBalance = balance / 1e9;
      
      console.log(`\n📋 Program: ${programAddr}`);
      console.log(`💰 Balance: ${solBalance} SOL`);
      
      // Check if it's an upgradeable program
      try {
        const programAccount = await connection.getProgramAccounts(
          new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111'),
          { filters: [{ memcmp: { offset: 4, bytes: programId.toBase58() } }] }
        );
        
        if (programAccount.length > 0) {
          console.log('✅ Upgradeable program detected');
          console.log('🔑 You may have withdrawal authority');
        }
      } catch (e) {
        console.log('📊 Checking program data...');
      }
      
      // Check account info
      const accountInfo = await connection.getAccountInfo(programId);
      if (accountInfo) {
        console.log(`👤 Owner: ${accountInfo.owner.toString()}`);
        console.log(`🔧 Executable: ${accountInfo.executable}`);
        
        if (solBalance > 0) {
          console.log('💡 Potential withdrawal available if you have authority');
        }
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${programAddr}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Check if you have upgrade authority');
  console.log('2. Look for admin/withdraw functions in your program');
  console.log('3. Use program-specific withdrawal methods');
}

checkProgramAuthority();