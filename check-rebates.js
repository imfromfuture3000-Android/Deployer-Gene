#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');

const HELIUS_TIP_ACCOUNTS = [
  'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
  'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
  '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
  'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe'
];

async function checkRebates() {
  console.log('💰 CHECKING REBATE EARNINGS');
  console.log('=' .repeat(50));

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  const treasuryAddress = process.env.TREASURY_PUBKEY || 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6';
  
  try {
    // Check treasury balance
    const treasuryPubkey = new PublicKey(treasuryAddress);
    const treasuryBalance = await connection.getBalance(treasuryPubkey);
    
    console.log(`🏦 Treasury Address: ${treasuryAddress}`);
    console.log(`💎 Treasury Balance: ${treasuryBalance / 1e9} SOL`);
    
    // Check tip account activity
    console.log('\n🎯 TIP ACCOUNT STATUS:');
    let totalTipBalance = 0;
    
    for (const tipAccount of HELIUS_TIP_ACCOUNTS) {
      try {
        const tipPubkey = new PublicKey(tipAccount);
        const tipBalance = await connection.getBalance(tipPubkey);
        totalTipBalance += tipBalance;
        
        console.log(`   ${tipAccount}: ${tipBalance / 1e9} SOL`);
      } catch (error) {
        console.log(`   ${tipAccount}: ERROR`);
      }
    }
    
    console.log(`\n📊 REBATE SUMMARY:`);
    console.log(`   💰 Treasury Balance: ${treasuryBalance / 1e9} SOL`);
    console.log(`   🎯 Total Tip Balance: ${totalTipBalance / 1e9} SOL`);
    console.log(`   📈 Estimated Rebates: ${(totalTipBalance * 0.15) / 1e9} SOL`);
    
    // Check recent transactions
    const signatures = await connection.getSignaturesForAddress(treasuryPubkey, { limit: 5 });
    
    console.log(`\n📋 RECENT TRANSACTIONS (${signatures.length}):`);
    signatures.forEach((sig, i) => {
      console.log(`   ${i + 1}. ${sig.signature.substring(0, 20)}...`);
      console.log(`      Time: ${new Date(sig.blockTime * 1000).toISOString()}`);
    });
    
    if (treasuryBalance > 0 || totalTipBalance > 0) {
      console.log('\n✅ REBATES DETECTED! Treasury has received funds.');
    } else {
      console.log('\n⏳ No rebates detected yet. System is ready for incoming rebates.');
    }
    
  } catch (error) {
    console.error('❌ Error checking rebates:', error.message);
  }
}

if (require.main === module) {
  checkRebates().catch(console.error);
}

module.exports = { checkRebates };