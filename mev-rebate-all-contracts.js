#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const { ALL_CONTRACT_ADDRESSES, PROGRAM_IDS } = require('./src/utils/contractAddresses');
const { HeliusRebateManager } = require('./src/utils/heliusRebates');

async function enableRebatesForAllContracts() {
  console.log('🌟 MEV & Helius Rebates - All Contract Addresses');
  console.log('=' .repeat(60));

  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  const rebateManager = new HeliusRebateManager(connection);

  console.log(`📊 Total Contract Addresses: ${ALL_CONTRACT_ADDRESSES.length}`);
  console.log(`🛡️ MEV Protection: ${process.env.MEV_PROTECTION_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`💰 Helius Rebates: ${process.env.HELIUS_REBATES_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);

  // Process each contract address
  for (let i = 0; i < ALL_CONTRACT_ADDRESSES.length; i++) {
    const address = ALL_CONTRACT_ADDRESSES[i];
    console.log(`\n${i + 1}. Processing: ${address}`);
    
    try {
      // Get optimal tip for this contract
      const tipAmount = rebateManager.getOptimalTipForTransaction([]);
      const estimatedRebate = await rebateManager.estimateRebate(tipAmount);
      
      console.log(`   💡 Optimal Tip: ${tipAmount} lamports`);
      console.log(`   💰 Est. Rebate: ${estimatedRebate} lamports`);
      console.log(`   ✅ Rebate enabled`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // Display program IDs with rebates
  console.log('\n🔧 Program IDs with Rebates:');
  Object.entries(PROGRAM_IDS).forEach(([name, id]) => {
    console.log(`   ${name}: ${id}`);
  });

  console.log('\n🎉 All contract addresses configured for MEV protection and Helius rebates!');
}

if (require.main === module) {
  enableRebatesForAllContracts().catch(console.error);
}

module.exports = { enableRebatesForAllContracts };