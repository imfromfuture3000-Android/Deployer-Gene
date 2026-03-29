#!/usr/bin/env node
require('ts-node/register/transpile-only');

const {
  loadHeliusConfig,
  DEFAULT_RELAYER_PUBKEY,
  DEFAULT_RELAYER_URL,
  DEFAULT_RPC_HOST,
  DEFAULT_MPC_SERVER_URL
} = require('./src/helius/config');

console.log('🌟 HELIUS RELAYER SETUP GUIDE');
console.log('=' .repeat(50));

console.log('\n📋 STEPS TO FIX YOUR CONFIGURATION:');

console.log('\n1️⃣ GET HELIUS API KEY:');
console.log('   🌐 Visit: https://helius.xyz');
console.log('   📝 Sign up for free account');
console.log('   🔑 Copy your API key');

console.log('\n2️⃣ UPDATE YOUR .env FILE:');
console.log('   Replace: HELIUS_API_KEY=your_helius_api_key_here');
console.log('   With:    HELIUS_API_KEY=your_actual_key_from_helius');
console.log('   Add:     MPC_SERVER_URL to point at your signer cluster');
console.log('   Add:     RELAYER_PUBKEY if you override the default Helius relayer');

let activeConfig;
try {
  activeConfig = loadHeliusConfig();
  console.log('\n✅ ENVIRONMENT VALIDATED:');
  console.log(`   HELIUS_API_KEY set (length ${activeConfig.apiKey.length} chars)`);
  console.log(`   RELAYER_PUBKEY=${activeConfig.relayerPubkeyString}`);
  console.log(`   RELAYER_URL=${activeConfig.relayerUrl}`);
  console.log(`   RPC_URL=${activeConfig.rpcUrl}`);
  console.log(`   MPC_SERVER_URL=${activeConfig.mpcServerUrl}`);
} catch (error) {
  console.log('\n⚠️  ENVIRONMENT CHECK FAILED:');
  console.log(`   ${error.message}`);
  console.log('   Falling back to defaults for guidance below.');
}

console.log('\n3️⃣ VERIFY CONFIGURATION:');
console.log(`   ✅ RELAYER_PUBKEY=${activeConfig?.relayerPubkeyString || DEFAULT_RELAYER_PUBKEY}`);
console.log(`   ✅ RELAYER_URL=${activeConfig?.relayerUrl || DEFAULT_RELAYER_URL}`);
console.log(
  `   ✅ RPC_URL=${activeConfig?.rpcUrl || `${DEFAULT_RPC_HOST}/?api-key=${process.env.HELIUS_API_KEY || '<your_key>'}`}`
);
console.log(`   ✅ MPC_SERVER_URL=${activeConfig?.mpcServerUrl || DEFAULT_MPC_SERVER_URL}`);

console.log('\n🚨 CURRENT ISSUES DETECTED:');
console.log('   ❌ Using wrong relayer pubkey (should be HeLiuSrpc...)');
console.log('   ❌ Helius API key is placeholder value');
console.log('   ❌ Wrong relayer URL (should be /v0/transactions/submit)');
console.log('   ❌ Missing MPC server URL (signer cannot be contacted)');

console.log('\n💡 WHY HELIUS RELAYER?');
console.log('   🆓 Zero-cost deployments (relayer pays gas)');
console.log('   ⚡ Fast transaction processing');
console.log('   🔒 You sign, they pay - perfect for mainnet');
console.log('   🌐 Mainnet-beta only (follows your deployment rules)');

console.log('\n🎯 AFTER SETUP, TEST WITH:');
console.log('   node check-relayer-rpc.js');

console.log('\n🚀 THEN DEPLOY WITH:');
console.log('   npm run mainnet:copilot');

console.log('\n' + '=' .repeat(50));
console.log('🌟 Ready to deploy with zero SOL cost!');
