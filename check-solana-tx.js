#!/usr/bin/env node
/**
 * Check Transactions on Solana
 */

const { Connection } = require('@solana/web3.js');
const fs = require('fs');

class SolanaChecker {
  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com');
  }

  async checkTransactions() {
    console.log('🔍 CHECKING TRANSACTIONS ON SOLANA MAINNET');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const deploymentLog = JSON.parse(fs.readFileSync('.cache/bot-nft-deployment.json', 'utf8'));
    
    for (const deployment of deploymentLog.deployments) {
      console.log(`\n🔍 Checking ${deployment.botName}...`);
      console.log(`TX Hash: ${deployment.txHash}`);
      
      try {
        const txInfo = await this.connection.getTransaction(deployment.txHash);
        
        if (txInfo) {
          console.log(`✅ Transaction found on Solana`);
          console.log(`   Slot: ${txInfo.slot}`);
          console.log(`   Block Time: ${new Date(txInfo.blockTime * 1000).toISOString()}`);
        } else {
          console.log(`❌ Transaction not found on Solana`);
          console.log(`   Note: This may be a simulated deployment`);
        }
      } catch (error) {
        console.log(`❌ Error checking transaction: ${error.message}`);
        console.log(`   Note: Transaction may not exist on mainnet`);
      }
      
      console.log(`🔗 Explorer: ${deployment.explorerUrl}`);
    }
    
    console.log('\n💡 NOTE: These appear to be simulated deployment hashes');
    console.log('   For real deployments, use actual Solana transactions');
  }
}

async function main() {
  const checker = new SolanaChecker();
  await checker.checkTransactions();
}

main().catch(console.error);