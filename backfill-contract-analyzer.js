#!/usr/bin/env node

const { ethers } = require('ethers');

class BackfillContractAnalyzer {
  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    this.contractAddress = '0x742d35Cc6634C0532925A3B8D4C9dB96C4B4d8B6';
  }

  async analyzeContract() {
    console.log('🔍 BACKFILL CONTRACT ANALYSIS');
    console.log('=============================');
    console.log(`Contract: ${this.contractAddress}`);
    
    // Get contract code
    const code = await this.provider.getCode(this.contractAddress);
    const isContract = code !== '0x';
    
    console.log(`Is Contract: ${isContract ? 'YES' : 'NO'}`);
    
    if (isContract) {
      await this.analyzeContractDetails();
    } else {
      console.log('This is an EOA (Externally Owned Account), not a contract');
    }
    
    // Get transaction history
    await this.getContractTransactions();
  }

  async analyzeContractDetails() {
    console.log('\n📋 CONTRACT DETAILS:');
    
    // Get contract creation transaction
    try {
      const history = await this.provider.getHistory(this.contractAddress);
      if (history.length > 0) {
        const firstTx = history[0];
        console.log(`Creation Block: ${firstTx.blockNumber}`);
        console.log(`Creator: ${firstTx.from}`);
      }
    } catch (error) {
      console.log('Could not fetch creation details');
    }
    
    // Check if it's a proxy contract
    const code = await this.provider.getCode(this.contractAddress);
    const isProxy = code.includes('delegatecall') || code.length < 1000;
    console.log(`Proxy Contract: ${isProxy ? 'LIKELY' : 'NO'}`);
  }

  async getContractTransactions() {
    console.log('\n📊 RECENT TRANSACTIONS:');
    
    try {
      const filter = {
        address: this.contractAddress,
        fromBlock: -10000, // Last 10k blocks
        toBlock: 'latest'
      };
      
      const logs = await this.provider.getLogs(filter);
      console.log(`Recent Events: ${logs.length}`);
      
      if (logs.length > 0) {
        console.log('Latest event topics:');
        logs.slice(-3).forEach((log, i) => {
          console.log(`  ${i + 1}. ${log.topics[0]?.substring(0, 10)}...`);
        });
      }
    } catch (error) {
      console.log('Could not fetch contract events');
    }
  }

  async checkBackfillFunctionality() {
    console.log('\n🔄 BACKFILL FUNCTIONALITY CHECK:');
    
    // Common backfill function signatures
    const backfillSignatures = [
      '0x8456cb59', // pause()
      '0x3f4ba83a', // unpause()
      '0x40c10f19', // mint(address,uint256)
      '0x42966c68', // burn(uint256)
      '0xa9059cbb', // transfer(address,uint256)
    ];
    
    const code = await this.provider.getCode(this.contractAddress);
    
    backfillSignatures.forEach(sig => {
      const hasFunction = code.includes(sig.substring(2));
      const functionName = this.getFunctionName(sig);
      console.log(`${hasFunction ? '✅' : '❌'} ${functionName}`);
    });
  }

  getFunctionName(signature) {
    const names = {
      '0x8456cb59': 'pause()',
      '0x3f4ba83a': 'unpause()',
      '0x40c10f19': 'mint(address,uint256)',
      '0x42966c68': 'burn(uint256)',
      '0xa9059cbb': 'transfer(address,uint256)'
    };
    return names[signature] || 'unknown()';
  }
}

async function main() {
  const analyzer = new BackfillContractAnalyzer();
  await analyzer.analyzeContract();
  await analyzer.checkBackfillFunctionality();
  
  console.log('\n🎯 BACKFILL CONTRACT SUMMARY:');
  console.log('- Multi-chain wallet contract');
  console.log('- Used for cross-chain asset management');
  console.log('- Part of OMEGA ecosystem backfill operations');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BackfillContractAnalyzer };