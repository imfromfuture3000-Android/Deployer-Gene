#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class MultiProviderRecovery {
  constructor() {
    this.cacheDir = '.cache';
    this.providers = {
      helius: {
        name: 'Helius',
        endpoint: 'https://mainnet.helius-rpc.com/?api-key=',
        apiKey: process.env.HELIUS_API_KEY || 'demo'
      },
      moralis: {
        name: 'Moralis',
        endpoint: 'https://solana-gateway.moralis.io/account/mainnet/',
        apiKey: process.env.MORALIS_API_KEY || 'demo'
      },
      quicknode: {
        name: 'QuickNode',
        endpoint: process.env.QUICKNODE_RPC_URL || 'https://your-endpoint.solana-mainnet.quiknode.pro/token/',
        apiKey: process.env.QUICKNODE_API_KEY || 'demo'
      }
    };
  }

  async recoverTransactions() {
    console.log('🚨 MULTI-PROVIDER TRANSACTION RECOVERY');
    console.log('📧 Account: imfromfuture3000@gmail.com');
    console.log('🎯 Target: 680k transactions\n');

    const targetAddress = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
    const results = {};

    // Try each provider
    for (const [key, provider] of Object.entries(this.providers)) {
      console.log(`🔍 Trying ${provider.name}...`);
      
      try {
        const data = await this.tryProvider(key, provider, targetAddress);
        results[key] = {
          provider: provider.name,
          success: true,
          transactionCount: data.length,
          data: data.slice(0, 10) // Sample first 10
        };
        
        console.log(`✅ ${provider.name}: Found ${data.length} transactions`);
        
      } catch (error) {
        results[key] = {
          provider: provider.name,
          success: false,
          error: error.message
        };
        
        console.log(`❌ ${provider.name}: ${error.message}`);
      }
    }

    await this.saveResults(results);
    this.printSummary(results);
    
    return results;
  }

  async tryProvider(key, provider, address) {
    switch (key) {
      case 'helius':
        return await this.tryHelius(provider, address);
      case 'moralis':
        return await this.tryMoralis(provider, address);
      case 'quicknode':
        return await this.tryQuickNode(provider, address);
      default:
        throw new Error('Unknown provider');
    }
  }

  async tryHelius(provider, address) {
    const url = `${provider.endpoint}${provider.apiKey}`;
    
    const response = await fetch(url, {
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
    
    if (data.error) {
      throw new Error(data.error.message || 'Helius API error');
    }
    
    return data.result || [];
  }

  async tryMoralis(provider, address) {
    const url = `${provider.endpoint}${address}/transactions`;
    
    const response = await fetch(url, {
      headers: {
        'X-API-Key': provider.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.status}`);
    }

    const data = await response.json();
    return data.result || data || [];
  }

  async tryQuickNode(provider, address) {
    if (provider.endpoint.includes('your-endpoint')) {
      throw new Error('QuickNode endpoint not configured');
    }

    const response = await fetch(provider.endpoint, {
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
    
    if (data.error) {
      throw new Error(data.error.message || 'QuickNode API error');
    }
    
    return data.result || [];
  }

  async saveResults(results) {
    const outputFile = path.join(this.cacheDir, 'multi-provider-recovery.json');
    
    const recoveryData = {
      timestamp: new Date().toISOString(),
      account: 'imfromfuture3000@gmail.com',
      targetTransactions: 680000,
      results
    };

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(recoveryData, null, 2));
    console.log(`\n💾 Results saved to: ${outputFile}`);
  }

  printSummary(results) {
    console.log('\n📊 RECOVERY SUMMARY:');
    console.log('═'.repeat(50));
    
    for (const [key, result] of Object.entries(results)) {
      const status = result.success ? '✅' : '❌';
      const count = result.success ? result.transactionCount : 0;
      
      console.log(`${status} ${result.provider}: ${count} transactions`);
      
      if (!result.success) {
        console.log(`   Error: ${result.error}`);
      }
    }
    
    const totalFound = Object.values(results)
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.transactionCount, 0);
    
    console.log('═'.repeat(50));
    console.log(`🎯 Total Transactions Found: ${totalFound}`);
    console.log(`📈 Target: 680,000 transactions`);
    
    if (totalFound > 0) {
      console.log('\n💡 NEXT STEPS:');
      console.log('1. Configure working provider API keys');
      console.log('2. Run full extraction with working provider');
      console.log('3. Export to backup storage');
    }
  }
}

// Execute recovery
if (require.main === module) {
  const recovery = new MultiProviderRecovery();
  recovery.recoverTransactions().catch(console.error);
}

module.exports = MultiProviderRecovery;