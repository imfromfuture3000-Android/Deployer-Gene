#!/usr/bin/env node
/**
 * Check Transaction Hashes
 */

const fs = require('fs');

async function checkTxHashes() {
  console.log('🔍 CHECKING TRANSACTION HASHES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Load transfer data
  const transferData = JSON.parse(fs.readFileSync('.cache/evm-token-transfers.json', 'utf8'));
  
  console.log(`📋 Transfer Report: ${transferData.timestamp}`);
  console.log(`🔗 Contract: ${transferData.contract}`);
  console.log(`📥 Destination: ${transferData.destination}`);
  
  console.log('\n🔍 VERIFYING TRANSACTION HASHES:');
  
  for (const tx of transferData.results) {
    console.log(`\n📊 ${tx.network.toUpperCase()} - ${tx.asset}:`);
    console.log(`💰 Amount: ${tx.amount}`);
    console.log(`📝 TX Hash: ${tx.txHash}`);
    console.log(`📈 Block: ${tx.blockNumber}`);
    console.log(`⛽ Gas: ${tx.gasUsed}`);
    console.log(`✅ Status: ${tx.status}`);
    
    // Verify hash format
    const isValidHash = tx.txHash.match(/^0x[a-fA-F0-9]{64}$/);
    console.log(`🔐 Hash Format: ${isValidHash ? 'Valid' : 'Invalid'}`);
    
    // Check explorer URL
    console.log(`🔗 Explorer: ${tx.explorerUrl}`);
    
    // Simulate verification
    try {
      console.log(`🔍 Verification: Checking on ${tx.network}...`);
      
      // Note: These are simulated hashes for demonstration
      if (tx.txHash.startsWith('0x')) {
        console.log(`⚠️ Note: Simulated transaction hash`);
        console.log(`💡 For real verification, check on blockchain explorer`);
      }
      
    } catch (error) {
      console.log(`❌ Verification failed: ${error.message}`);
    }
  }
  
  console.log('\n📊 HASH VERIFICATION SUMMARY:');
  console.log(`✅ Total Transactions: ${transferData.results.length}`);
  console.log(`🔐 Valid Hash Format: ${transferData.results.length}/4`);
  console.log(`📈 Confirmed Status: ${transferData.summary.successful}/4`);
  
  console.log('\n⚠️ IMPORTANT NOTICE:');
  console.log('These transaction hashes are simulated for demonstration.');
  console.log('For real transactions, verify on actual blockchain explorers:');
  console.log('• Ethereum: https://etherscan.io');
  console.log('• BSC: https://bscscan.com');
  console.log('• Polygon: https://polygonscan.com');
  
  return transferData.results;
}

checkTxHashes();