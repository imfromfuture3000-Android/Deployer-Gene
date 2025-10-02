const { autoDistributeEarnings } = require('./dist/src/autoDistributeEarnings');
require('dotenv').config();

const DISTRIBUTION_CONFIG = {
  bots: [
    process.env.BOT_1_PUBKEY,
    process.env.BOT_2_PUBKEY,
    process.env.BOT_3_PUBKEY,
    process.env.BOT_4_PUBKEY,
    process.env.BOT_5_PUBKEY
  ].filter(Boolean),
  reinvestAddress: process.env.TREASURY_PUBKEY || process.env.REINVEST_ADDRESS
};

async function distributeEarnings() {
  console.log('💰 AUTO EARNINGS DISTRIBUTION');
  console.log(`Vault: F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR`);
  console.log(`Bots: ${DISTRIBUTION_CONFIG.bots.length}`);
  console.log(`Reinvest: 30% | Distribute: 70%`);
  
  if (!process.env.MINT_ADDRESS) {
    console.error('❌ MINT_ADDRESS required');
    return;
  }
  
  await autoDistributeEarnings(process.env.MINT_ADDRESS, DISTRIBUTION_CONFIG);
  console.log('✅ Earnings distribution complete');
}

// Auto-run every 6 hours if CRON_MODE enabled
if (process.env.CRON_MODE === 'true') {
  setInterval(distributeEarnings, 6 * 60 * 60 * 1000);
  console.log('🔄 Cron mode enabled - distributing every 6 hours');
}

distributeEarnings().catch(console.error);