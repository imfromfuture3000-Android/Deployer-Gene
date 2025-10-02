#!/usr/bin/env node

const { Connection } = require('@solana/web3.js');
const { TokenAirdropManager } = require('./src/utils/airdropManager');

async function executeInitialAirdrop() {
  console.log('💫 INITIAL INVESTMENT AIRDROP - IMPULSE & OMEGA');
  console.log('=' .repeat(60));

  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  const airdropManager = new TokenAirdropManager(connection);

  // Initial investor addresses
  const initialInvestors = [
    process.env.BOT_1_PUBKEY,
    process.env.BOT_2_PUBKEY,
    process.env.BOT_3_PUBKEY,
    process.env.BOT_4_PUBKEY,
    process.env.BOT_5_PUBKEY,
    process.env.TREASURY_PUBKEY,
    process.env.COCREATOR_PUBKEY
  ].filter(Boolean);

  console.log(`🎯 Airdropping to ${initialInvestors.length} initial investors`);
  console.log('💰 Amounts:');
  console.log('   IMPULSE: 10,000 tokens per investor');
  console.log('   OMEGA: 5,000 tokens per investor');

  try {
    await airdropManager.initialInvestmentAirdrop(initialInvestors);
    
    console.log('\n📊 Airdrop Summary:');
    console.log(`   Total IMPULSE distributed: ${initialInvestors.length * 10000}`);
    console.log(`   Total OMEGA distributed: ${initialInvestors.length * 5000}`);
    console.log(`   Recipients: ${initialInvestors.length}`);
    
  } catch (error) {
    console.error('❌ Airdrop failed:', error.message);
  }

  console.log('\n🌟 Initial investment airdrop complete!');
}

if (require.main === module) {
  executeInitialAirdrop().catch(console.error);
}

module.exports = { executeInitialAirdrop };