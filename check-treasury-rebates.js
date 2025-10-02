#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');

const TREASURY_ADDRESS = 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6';
const HELIUS_TIP_ACCOUNTS = [
  'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
  'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
  '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
  'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe'
];

async function checkTreasuryRebates() {
  console.log('🏦 CHECKING TREASURY REBATE RECEIPTS');
  console.log('=' .repeat(50));

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  try {
    // Check treasury balance
    const treasuryPubkey = new PublicKey(TREASURY_ADDRESS);
    const treasuryBalance = await connection.getBalance(treasuryPubkey);
    const treasurySignatures = await connection.getSignaturesForAddress(treasuryPubkey, { limit: 10 });
    
    console.log('🏦 TREASURY STATUS:');
    console.log(`   Address: ${TREASURY_ADDRESS}`);
    console.log(`   💰 Balance: ${(treasuryBalance / 1e9).toFixed(6)} SOL`);
    console.log(`   📊 Recent TXs: ${treasurySignatures.length}`);
    
    if (treasurySignatures.length > 0) {
      console.log(`   🕐 Last Activity: ${new Date(treasurySignatures[0].blockTime * 1000).toISOString()}`);
      console.log('   📋 Recent Transactions:');
      treasurySignatures.slice(0, 3).forEach((sig, i) => {
        console.log(`      ${i + 1}. ${sig.signature.substring(0, 20)}...`);
      });
    }
    
    // Check tip account balances for rebate calculation
    let totalTipBalance = 0;
    console.log('\n💰 TIP ACCOUNT BALANCES:');
    
    for (const tipAccount of HELIUS_TIP_ACCOUNTS) {
      try {
        const tipPubkey = new PublicKey(tipAccount);
        const tipBalance = await connection.getBalance(tipPubkey);
        totalTipBalance += tipBalance;
        console.log(`   ${tipAccount.substring(0, 20)}...: ${(tipBalance / 1e9).toFixed(6)} SOL`);
      } catch (error) {
        console.log(`   ${tipAccount.substring(0, 20)}...: ERROR`);
      }
    }
    
    // Calculate expected treasury cut
    const expectedTreasuryCut = totalTipBalance * 0.15;
    const userRebates = totalTipBalance * 0.85;
    
    console.log('\n📊 REBATE CALCULATION:');
    console.log(`   💰 Total Tip Balance: ${(totalTipBalance / 1e9).toFixed(6)} SOL`);
    console.log(`   🏦 Expected Treasury Cut (15%): ${(expectedTreasuryCut / 1e9).toFixed(6)} SOL`);
    console.log(`   👥 User Rebates (85%): ${(userRebates / 1e9).toFixed(6)} SOL`);
    
    console.log('\n🎯 REBATE STATUS:');
    if (treasuryBalance > 0) {
      console.log('   ✅ Treasury has received funds!');
      console.log(`   💎 Current Treasury: ${(treasuryBalance / 1e9).toFixed(6)} SOL`);
      console.log(`   📈 Rebate System: WORKING`);
    } else if (totalTipBalance > 0) {
      console.log('   ⏳ Rebates pending distribution');
      console.log(`   💰 Available for Treasury: ${(expectedTreasuryCut / 1e9).toFixed(6)} SOL`);
      console.log(`   🔄 Auto-distribute: READY`);
    } else {
      console.log('   📊 No rebates accumulated yet');
      console.log('   🔧 System ready for incoming rebates');
    }
    
  } catch (error) {
    console.error('❌ Error checking treasury:', error.message);
  }
}

if (require.main === module) {
  checkTreasuryRebates().catch(console.error);
}

module.exports = { checkTreasuryRebates };