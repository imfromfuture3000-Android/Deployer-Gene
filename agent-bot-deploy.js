const { mintToAgentBots } = require('./dist/src/agentBotMint');
require('dotenv').config();

const AGENT_BOT_CONFIG = {
  bots: [
    process.env.BOT_1_PUBKEY,
    process.env.BOT_2_PUBKEY,
    process.env.BOT_3_PUBKEY,
    process.env.BOT_4_PUBKEY,
    process.env.BOT_5_PUBKEY
  ].filter(Boolean),
  initialAmount: "10000",     // 10K OMEGA base allocation
  investmentAmount: "50000"   // 50K investment impulse tokens
};

async function deployAgentBots() {
  console.log('🤖 AGENT BOT MINT DEPLOYMENT');
  console.log(`Bots: ${AGENT_BOT_CONFIG.bots.length}`);
  console.log(`Per bot: ${AGENT_BOT_CONFIG.initialAmount} + ${AGENT_BOT_CONFIG.investmentAmount} tokens`);
  
  if (!process.env.MINT_ADDRESS) {
    console.error('❌ MINT_ADDRESS required');
    return;
  }
  
  await mintToAgentBots(process.env.MINT_ADDRESS, AGENT_BOT_CONFIG);
  console.log('✅ Agent bot deployment complete');
}

deployAgentBots().catch(console.error);