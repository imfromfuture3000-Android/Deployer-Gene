#!/usr/bin/env node

const { Connection } = require('@solana/web3.js');
const { InvestorLureBot } = require('./dist/src/utils/investorLureBot');

async function activateInvestorLureBot() {
  console.log('🎣 OMEGA PRIME INVESTOR LURE BOT');
  console.log('=' .repeat(60));

  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  const lureBot = new InvestorLureBot(connection);

  console.log(`🤖 Bot Address: ${process.env.BOT_1_PUBKEY}`);
  console.log(`🎯 Target: Attract investors to Omega Prime program`);
  console.log(`💰 Incentives: IMPULSE + OMEGA airdrops + 15% rebates`);

  if (process.env.AUTO_LURE_ENABLED === 'true') {
    console.log('🔄 Auto-lure mode enabled - continuous operation');
    await lureBot.autoLureLoop();
  } else {
    console.log('📢 Single lure broadcast');
    await lureBot.lureInvestors();
  }

  console.log('\n✅ Investor lure bot operation complete!');
}

if (require.main === module) {
  activateInvestorLureBot().catch(console.error);
}

module.exports = { activateInvestorLureBot };