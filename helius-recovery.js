#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helius Recovery Configuration
const RECOVERY_CONFIG = {
  endpoint: 'https://api.helius.xyz/v0/addresses',
  rpcEndpoint: 'https://mainnet.helius-rpc.com/?api-key=' + (process.env.HELIUS_API_KEY || 'demo'),
  apiKey: process.env.HELIUS_API_KEY || 'demo',
  addresses: [
    'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4', // Treasury
    '23v2cDBzVnijTnNk3riHipDvctcgfCpeByiep47SMovm', // Main token
    'HeLiuSrpc1111111111111111111111111111111111'  // Relayer
  ],
  batchSize: 100
};

class HeliusTransactionRecovery {
  constructor() {
    this.allTransactions = [];
    this.cacheDir = '.cache';
    this.outputFile = path.join(this.cacheDir, 'helius-complete-recovery.json');
  }

  async recoverAllTransactions() {
    console.log('🚨 HELIUS COMPLETE RECOVERY INITIATED');
    console.log(`🔑 API Key: ${RECOVERY_CONFIG.apiKey.substring(0, 8)}...`);
    
    const results = {};
    
    for (const address of RECOVERY_CONFIG.addresses) {
      console.log(`\n📍 Processing address: ${address}`);
      
      try {
        // Get transaction history via Helius API
        const transactions = await this.getTransactionHistory(address);
        results[address] = {
          address,
          transactionCount: transactions.length,
          transactions
        };
        
        console.log(`✅ Found ${transactions.length} transactions for ${address}`);
        
      } catch (error) {
        console.error(`❌ Failed for ${address}:`, error.message);
        results[address] = { address, error: error.message, transactions: [] };
      }
    }
    
    await this.saveRecoveryResults(results);
    return results;
  }

  async getTransactionHistory(address) {
    const url = `${RECOVERY_CONFIG.endpoint}/${address}/transactions?api-key=${RECOVERY_CONFIG.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data || [];
      
    } catch (error) {
      // Fallback to RPC method
      console.log(`🔄 Fallback to RPC for ${address}`);
      return await this.getRPCTransactions(address);
    }
  }

  async getRPCTransactions(address) {
    const response = await fetch(RECOVERY_CONFIG.rpcEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [address, { limit: 1000 }]
      })
    });

    const data = await response.json();
    return data.result || [];
  }

  async saveRecoveryResults(results) {
    const recoveryData = {
      timestamp: new Date().toISOString(),
      source: 'helius-api',
      totalAddresses: RECOVERY_CONFIG.addresses.length,
      results
    };

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    fs.writeFileSync(this.outputFile, JSON.stringify(recoveryData, null, 2));
    console.log(`\n💾 Recovery data saved to: ${this.outputFile}`);
    
    // Summary
    const totalTx = Object.values(results).reduce((sum, r) => sum + (r.transactions?.length || 0), 0);
    console.log(`\n📊 RECOVERY SUMMARY:`);
    console.log(`   Total Transactions: ${totalTx}`);
    console.log(`   Addresses Processed: ${Object.keys(results).length}`);
  }
}

// Execute recovery
if (require.main === module) {
  const recovery = new HeliusTransactionRecovery();
  recovery.recoverAllTransactions().catch(console.error);
}

module.exports = HeliusTransactionRecovery;