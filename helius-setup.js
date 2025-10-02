const { setupHeliusWebhook } = require('./dist/src/utils/heliusWebhook');
require('dotenv').config();

async function setupHelius() {
  console.log('🔗 HELIUS ACCOUNT SETUP');
  
  const requiredEnvs = [
    'HELIUS_API_KEY',
    'TREASURY_PUBKEY', 
    'MINT_ADDRESS',
    'WEBHOOK_URL'
  ];
  
  const missing = requiredEnvs.filter(env => !process.env[env]);
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    return;
  }
  
  await setupHeliusWebhook();
  console.log('✅ Helius webhook configured for:');
  console.log('  - Token transfers');
  console.log('  - Authority changes');
  console.log('  - Swap events');
  console.log('  - NFT transactions');
  console.log('  - Earnings vault activity');
}

setupHelius().catch(console.error);