#!/usr/bin/env node

const { Connection } = require('@solana/web3.js');
const { OmegaRebateDistributor } = require('./src/utils/rebateDistributor');
const { ALL_CONTRACT_ADDRESSES, OMEGA_CORE_PROGRAMS } = require('./src/utils/rebateDistributor');

async function announceMainnetRebates() {
  console.log('🚀 OMEGA PRIME DEPLOYER - MAINNET REBATE ANNOUNCEMENT');
  console.log('=' .repeat(70));
  
  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  const distributor = new OmegaRebateDistributor(connection);

  await distributor.announceMainnetRebates();

  console.log('\n📋 CONTRACT FUNCTIONS WITH REBATES:');
  console.log('🤖 Bot3 Contract Deployer Functions:');
  const bot3Functions = [
    'deploy_proxy_contract',
    'upgrade_contract_logic', 
    'create_governance_token',
    'setup_multisig_wallet',
    'deploy_custom_program'
  ];
  bot3Functions.forEach(fn => console.log(`   ✅ ${fn}`));

  console.log('\n🎯 MEV Hunter Functions:');
  const mevFunctions = [
    'detect_arbitrage_opportunity',
    'execute_sandwich_attack',
    'front_run_large_orders',
    'back_run_profit_extraction',
    'cross_dex_arbitrage'
  ];
  mevFunctions.forEach(fn => console.log(`   ⚡ ${fn}`));

  console.log('\n💎 REBATE BENEFITS:');
  console.log('   🔹 15% treasury cut on all rebates');
  console.log('   🔹 85% returned to users');
  console.log('   🔹 Auto-distribution enabled');
  console.log('   🔹 MEV protection included');
  console.log('   🔹 All DEX integrations covered');

  console.log('\n🌐 MAINNET ANNOUNCEMENT COMPLETE!');
  console.log('📡 All Omega Prime contracts now earn rebates automatically');
}

if (require.main === module) {
  announceMainnetRebates().catch(console.error);
}

module.exports = { announceMainnetRebates };