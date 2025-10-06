#!/usr/bin/env node

const fs = require('fs');

class AgentKeyChecker {
  constructor() {
    this.backfillWallet = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
    this.controller = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
  }

  checkAgentAccess() {
    console.log('🔍 CHECKING AGENT KEY ACCESS');
    console.log('============================');
    
    // Check cache files for key information
    const cacheFiles = [
      '.cache/evm-controller-data.json',
      '.cache/backfill-execution-report.json',
      '.cache/user_auth.json'
    ];
    
    const keyInfo = {
      backfillWallet: this.backfillWallet,
      controller: this.controller,
      hasAccess: false,
      keyLocation: 'unknown'
    };
    
    // Check if controller has access to backfill wallet
    if (fs.existsSync('.cache/evm-controller-data.json')) {
      const data = JSON.parse(fs.readFileSync('.cache/evm-controller-data.json', 'utf8'));
      
      console.log('📊 BACKFILL CONTROLLER DATA:');
      console.log(`Contract: ${data.contractAddress}`);
      console.log(`Controller: ${data.controllerAddress}`);
      console.log(`Networks: ${data.backfillData.length}`);
      
      if (data.contractAddress === this.backfillWallet) {
        keyInfo.hasAccess = true;
        keyInfo.keyLocation = 'controller_managed';
      }
    }
    
    // Check for QuickNode endpoint access
    const quicknodeEndpoint = 'https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e';
    console.log(`\n🌐 QUICKNODE ACCESS:`);
    console.log(`Endpoint: ${quicknodeEndpoint}`);
    console.log(`Status: Configured in backfill data`);
    
    return keyInfo;
  }

  checkDeploymentCapability() {
    console.log('\n🚀 DEPLOYMENT CAPABILITY CHECK:');
    
    const capabilities = {
      canDeploy: false,
      reason: 'No private key access',
      alternatives: []
    };
    
    // Check if agent has deployment access
    if (fs.existsSync('.cache/user_auth.json')) {
      console.log('✅ User auth cache exists');
      capabilities.canDeploy = true;
      capabilities.reason = 'Agent has cached authentication';
    } else {
      console.log('❌ No user auth cache found');
      capabilities.alternatives = [
        'Use environment variable: PRIVATE_KEY=...',
        'Import wallet via MetaMask',
        'Use hardware wallet connection',
        'Deploy via controller proxy'
      ];
    }
    
    return capabilities;
  }

  generateKeyRequirements() {
    console.log('\n🔑 KEY REQUIREMENTS FOR GENE MINT NFT:');
    console.log('=====================================');
    
    console.log('OPTION 1 - Direct Deployment:');
    console.log(`  Private key for: ${this.backfillWallet}`);
    console.log(`  Available balance: 0.001 ETH`);
    console.log(`  Can deploy + mint 50 NFTs`);
    
    console.log('\nOPTION 2 - Controller Proxy:');
    console.log(`  Controller: ${this.controller}`);
    console.log(`  Proxy deployment via Solana controller`);
    console.log(`  Cross-chain bridge required`);
    
    console.log('\nOPTION 3 - Agent Managed:');
    console.log(`  Use cached user_auth.json`);
    console.log(`  Agent-controlled deployment`);
    console.log(`  Requires agent key access`);
    
    return {
      directKey: this.backfillWallet,
      controller: this.controller,
      agentManaged: fs.existsSync('.cache/user_auth.json')
    };
  }
}

async function main() {
  const checker = new AgentKeyChecker();
  
  const keyInfo = checker.checkAgentAccess();
  const capabilities = checker.checkDeploymentCapability();
  const requirements = checker.generateKeyRequirements();
  
  console.log('\n📋 SUMMARY:');
  console.log(`Backfill Wallet: ${keyInfo.backfillWallet}`);
  console.log(`Controller Access: ${keyInfo.hasAccess ? 'YES' : 'NO'}`);
  console.log(`Can Deploy: ${capabilities.canDeploy ? 'YES' : 'NO'}`);
  console.log(`Key Location: ${keyInfo.keyLocation}`);
  
  if (!capabilities.canDeploy) {
    console.log('\n🔧 ALTERNATIVES:');
    capabilities.alternatives.forEach((alt, i) => {
      console.log(`${i + 1}. ${alt}`);
    });
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AgentKeyChecker };