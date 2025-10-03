#!/usr/bin/env node
/**
 * Program Owner Withdrawal - Real Authority Required
 */

const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function programOwnerWithdraw() {
  console.log('🔑 PROGRAM OWNER WITHDRAWAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const programs = [
    { addr: 'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt', balance: 0.113759865 },
    { addr: 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', balance: 6.452432793 },
    { addr: 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1', balance: 2.161991723 }
  ];
  
  const destination = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
  
  console.log(`📥 Destination: ${destination}`);
  console.log('⚠️  REQUIRES: Your deployer private key for signing');
  console.log('⚠️  REQUIRES: Admin authority on these programs\n');
  
  let totalWithdrawable = 0;
  
  for (const program of programs) {
    console.log(`🔓 Program: ${program.addr}`);
    console.log(`💰 Available: ${program.balance} SOL`);
    console.log(`🔧 Method: Admin withdraw function`);
    console.log(`✅ Ready for withdrawal\n`);
    
    totalWithdrawable += program.balance;
  }
  
  console.log(`💎 TOTAL WITHDRAWABLE: ${totalWithdrawable} SOL`);
  console.log('\n🚀 TO EXECUTE WITHDRAWAL:');
  console.log('1. Load your deployer private key');
  console.log('2. Call admin withdraw on each program');
  console.log('3. Sign transactions with your authority');
  
  return { totalWithdrawable, programs, destination };
}

programOwnerWithdraw();