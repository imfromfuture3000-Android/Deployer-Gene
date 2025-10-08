#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helius Recovery Configuration
const RECOVERY_CONFIG = {
  endpoint: process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=' + process.env.HELIUS_API_KEY,
  apiKey: process.env.HELIUS_API_KEY,
  email: 'imfromfuture3000@gmail.com',
  deployer: 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4',
  batchSize: 100,
  maxRetries: 3
};

class HeliusRecovery {
  constructor() {
    this.transactions = [];
    this.totalRecovered = 0;
    this.cacheDir = '.cache';
    this.outputFile = path.join(this.cacheDir, 'helius-transactions.json');
  }

  async recoverTransactions() {
    console.log('🚨 HELIUS TRANSACTION RECOVERY INITIATED');
    console.log(`📧 Account: ${RECOVERY_CONFIG.email}`);
    console.log(`🎯 Target: 680k transactions`);
    console.log(`🔑 Using Helius API`);
    
    try {
      // Get signature list for deployer
      const signatures = await this.getSignatureList();
      console.log(`📝 Found ${signatures.length} signatures`);
      
      // Batch process transactions
      await this.batchProcessTransactions(signatures);
      
      // Save recovered data
      await this.saveRecoveredData();
      
      console.log(`✅ RECOVERY COMPLETE: ${this.totalRecovered} transactions`);
      
    } catch (error) {
      console.error('❌ Recovery failed:', error.message);
      await this.savePartialData();
    }
  }

  async getSignatureList() {
    let allSignatures = [];
    let before = null;
    
    while (true) {
      const params = [RECOVERY_CONFIG.deployer, { limit: 1000 }];
      if (before) params[1].before = before;
      
      const response = await fetch(RECOVERY_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params
        })
      });

      const data = await response.json();
      const signatures = data.result || [];
      
      if (signatures.length === 0) break;
      
      allSignatures.push(...signatures.map(s => s.signature));
      before = signatures[signatures.length - 1].signature;
      
      console.log(`📝 Collected ${allSignatures.length} signatures`);
      
      if (allSignatures.length >= 680000) break;
    }
    
    return allSignatures;
  }

  async batchProcessTransactions(signatures) {
    const batches = this.createBatches(signatures, RECOVERY_CONFIG.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      console.log(`📦 Processing batch ${i + 1}/${batches.length}`);
      
      try {
        const batchData = await this.processBatch(batches[i]);
        this.transactions.push(...batchData);
        this.totalRecovered += batchData.length;
        
        // Save progress every 10 batches
        if (i % 10 === 0) {
          await this.saveProgress();
        }
        
      } catch (error) {
        console.error(`❌ Batch ${i + 1} failed:`, error.message);
      }
    }
  }

  async processBatch(signatures) {
    const response = await fetch(RECOVERY_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getMultipleTransactions',
        params: [signatures, { encoding: 'json', maxSupportedTransactionVersion: 0 }]
      })
    });

    const data = await response.json();
    return (data.result || []).filter(tx => tx !== null);
  }

  createBatches(array, size) {
    const batches = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  async saveRecoveredData() {
    const recoveryData = {
      timestamp: new Date().toISOString(),
      account: RECOVERY_CONFIG.email,
      deployer: RECOVERY_CONFIG.deployer,
      totalTransactions: this.totalRecovered,
      endpoint: 'helius-api',
      status: 'COMPLETE',
      transactions: this.transactions
    };

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    fs.writeFileSync(this.outputFile, JSON.stringify(recoveryData, null, 2));
    console.log(`💾 Data saved to: ${this.outputFile}`);
  }

  async saveProgress() {
    const progressData = {
      timestamp: new Date().toISOString(),
      recovered: this.totalRecovered,
      status: 'IN_PROGRESS',
      transactions: this.transactions
    };

    const progressFile = path.join(this.cacheDir, 'recovery-progress.json');
    fs.writeFileSync(progressFile, JSON.stringify(progressData, null, 2));
  }

  async savePartialData() {
    const partialData = {
      timestamp: new Date().toISOString(),
      account: RECOVERY_CONFIG.email,
      recovered: this.totalRecovered,
      status: 'PARTIAL',
      transactions: this.transactions
    };

    const partialFile = path.join(this.cacheDir, 'helius-partial.json');
    fs.writeFileSync(partialFile, JSON.stringify(partialData, null, 2));
    console.log(`💾 Partial data saved to: ${partialFile}`);
  }
}

// Execute recovery
if (require.main === module) {
  const recovery = new HeliusRecovery();
  recovery.recoverTransactions().catch(console.error);
}

module.exports = HeliusRecovery;