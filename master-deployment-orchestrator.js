#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

class MasterDeploymentOrchestrator {
  constructor() {
    this.deploymentSteps = [
      'gene-nft-deployer.js',
      'dao-governance-setup.js', 
      'activate-full-deployment.js'
    ];
  }

  async executeStep(script) {
    console.log(`🚀 Executing: ${script}`);
    try {
      execSync(`node ${script}`, { stdio: 'inherit' });
      console.log(`✅ Completed: ${script}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed: ${script}`, error.message);
      return false;
    }
  }

  async orchestrateDeployment() {
    console.log('🎯 MASTER DEPLOYMENT ORCHESTRATOR');
    console.log('=' .repeat(60));
    
    const results = [];
    
    for (const step of this.deploymentSteps) {
      const success = await this.executeStep(step);
      results.push({ step, success });
      
      if (!success) {
        console.log('❌ Deployment failed at step:', step);
        break;
      }
    }
    
    const deploymentSummary = {
      timestamp: new Date().toISOString(),
      status: results.every(r => r.success) ? 'SUCCESS' : 'FAILED',
      steps: results,
      network: 'mainnet-beta',
      relayer: 'helius'
    };
    
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/master-deployment.json', JSON.stringify(deploymentSummary, null, 2));
    
    console.log('\n🎉 MASTER DEPLOYMENT COMPLETE!');
    console.log('📊 Summary saved to .cache/master-deployment.json');
    
    return deploymentSummary;
  }
}

const orchestrator = new MasterDeploymentOrchestrator();
orchestrator.orchestrateDeployment().catch(console.error);