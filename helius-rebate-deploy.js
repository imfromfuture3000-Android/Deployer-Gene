#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const { ContractDeployer } = require('./src/utils/contractDeployment');

async function deployWithHeliusRebates() {
  console.log('🌟 OMEGA PRIME DEPLOYER - Helius Rebates Integration');
  console.log('=' .repeat(60));

  // Initialize connection
  const connection = new Connection(
    process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
    'confirmed'
  );

  // Import all contract addresses from repo
  const { ALL_CONTRACT_ADDRESSES } = require('./src/utils/contractAddresses');
  const contractAddresses = ALL_CONTRACT_ADDRESSES;

  console.log(`📋 Contracts to deploy with rebates: ${contractAddresses.length}`);
  
  for (const address of contractAddresses) {
    try {
      const deployer = new ContractDeployer({
        programId: new PublicKey(address),
        feePayer: new PublicKey(process.env.TREASURY_PUBKEY),
        connection,
        enableRebates: process.env.HELIUS_REBATES_ENABLED === 'true',
        enableMevProtection: process.env.MEV_PROTECTION_ENABLED === 'true'
      });

      console.log(`\n🚀 Deploying: ${address}`);
      const summary = deployer.getDeploymentSummary();
      console.log('📊 Deployment Summary:', JSON.stringify(summary, null, 2));
      
      // Mock deployment for demonstration
      const signature = await deployer.deployWithRebates([]);
      console.log(`✅ Deployed with signature: ${signature}`);
      
    } catch (error) {
      console.error(`❌ Failed to deploy ${address}:`, error.message);
    }
  }

  console.log('\n🎉 Helius rebate deployment complete!');
}

if (require.main === module) {
  deployWithHeliusRebates().catch(console.error);
}

module.exports = { deployWithHeliusRebates };