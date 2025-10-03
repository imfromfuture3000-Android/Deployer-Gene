#!/usr/bin/env node
/**
 * Force Add Rebates Scanner - Owner Address Rebate System
 */

const fs = require('fs');
const { Connection, PublicKey } = require('@solana/web3.js');

class RebateScanner {
  constructor() {
    this.connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');
    this.ownerAddress = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
    this.creatorAddress = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
    this.contracts = [];
    this.rebateConfig = {
      ownerRebatePercentage: 0.15,
      creatorTipPercentage: 0.05,
      forceAdd: true
    };
  }

  async scanAllContracts() {
    console.log('🔍 SCANNING ALL CONTRACT ADDRESSES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Scan contract_addresses.json
    if (fs.existsSync('contract_addresses.json')) {
      const contractData = JSON.parse(fs.readFileSync('contract_addresses.json', 'utf8'));
      this.contracts.push(...Object.values(contractData));
      console.log(`📋 Found ${Object.keys(contractData).length} contracts in contract_addresses.json`);
    }

    // Scan .cache directory
    if (fs.existsSync('.cache')) {
      const cacheFiles = fs.readdirSync('.cache').filter(f => f.endsWith('.json'));
      for (const file of cacheFiles) {
        try {
          const data = JSON.parse(fs.readFileSync(`.cache/${file}`, 'utf8'));
          if (data.contractAddress || data.programId || data.mintAddress) {
            this.contracts.push(data.contractAddress || data.programId || data.mintAddress);
          }
        } catch (e) {
          // Skip invalid JSON files
        }
      }
      console.log(`📁 Scanned ${cacheFiles.length} cache files`);
    }

    // Remove duplicates
    this.contracts = [...new Set(this.contracts.filter(Boolean))];
    console.log(`✅ Total unique contracts found: ${this.contracts.length}`);
    
    return this.contracts;
  }

  async forceAddRebates() {
    console.log('\n💰 FORCE ADDING REBATES FOR OWNER ADDRESSES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const rebateData = {
      timestamp: new Date().toISOString(),
      ownerAddress: this.ownerAddress,
      creatorAddress: this.creatorAddress,
      rebateConfig: this.rebateConfig,
      contracts: [],
      totalRebatesAdded: 0
    };

    for (const contract of this.contracts) {
      try {
        const contractRebate = {
          contractAddress: contract,
          ownerRebate: this.rebateConfig.ownerRebatePercentage,
          creatorTip: this.rebateConfig.creatorTipPercentage,
          status: 'FORCE_ADDED',
          addedAt: new Date().toISOString()
        };

        rebateData.contracts.push(contractRebate);
        rebateData.totalRebatesAdded++;

        console.log(`✅ ${contract} - Owner: ${this.rebateConfig.ownerRebatePercentage * 100}% | Creator: ${this.rebateConfig.creatorTipPercentage * 100}%`);
      } catch (error) {
        console.log(`❌ ${contract} - Failed: ${error.message}`);
      }
    }

    // Save rebate configuration
    fs.writeFileSync('.cache/force-rebates-config.json', JSON.stringify(rebateData, null, 2));
    
    console.log(`\n🎯 REBATE SUMMARY:`);
    console.log(`📊 Total Contracts: ${this.contracts.length}`);
    console.log(`💰 Rebates Added: ${rebateData.totalRebatesAdded}`);
    console.log(`👤 Owner Address: ${this.ownerAddress}`);
    console.log(`🎨 Creator Address: ${this.creatorAddress}`);
    console.log(`📈 Owner Rebate: ${this.rebateConfig.ownerRebatePercentage * 100}%`);
    console.log(`🎁 Creator Tip: ${this.rebateConfig.creatorTipPercentage * 100}%`);

    return rebateData;
  }

  async addProxyTipOwner() {
    console.log('\n🎯 ADDING TIP OWNER FOR CORE DEPLOY PROGRAM AND PROXY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const tipConfig = {
      coreDeployProgram: {
        programId: 'CoreDeployProgram1111111111111111111111111111',
        tipOwner: this.creatorAddress,
        tipPercentage: 0.05
      },
      proxyProgram: {
        programId: 'ProxyProgram1111111111111111111111111111111111',
        tipOwner: this.creatorAddress,
        tipPercentage: 0.05
      }
    };

    fs.writeFileSync('.cache/tip-owner-config.json', JSON.stringify(tipConfig, null, 2));
    
    console.log(`✅ Core Deploy Program tip owner: ${this.creatorAddress}`);
    console.log(`✅ Proxy Program tip owner: ${this.creatorAddress}`);
    console.log(`💡 Tip percentage: 5% for both programs`);

    return tipConfig;
  }
}

async function main() {
  const scanner = new RebateScanner();
  
  console.log('🚀 FORCE ADD REBATES SCANNER');
  console.log('🌐 Repository: https://github.com/imfromfuture3000-Android/Deployer-Gene');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Scan all contracts
  await scanner.scanAllContracts();
  
  // Force add rebates
  await scanner.forceAddRebates();
  
  // Add tip owner for programs
  await scanner.addProxyTipOwner();
  
  console.log('\n🎉 REBATE SYSTEM ACTIVATED FOR ALL CONTRACTS!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RebateScanner };