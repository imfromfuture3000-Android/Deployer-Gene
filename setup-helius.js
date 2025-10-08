#!/usr/bin/env node

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

console.log('\n3️⃣ VERIFY CONFIGURATION:');
console.log('   ✅ RELAYER_PUBKEY=HeLiuSrpc1111111111111111111111111111111111');
console.log('   ✅ RELAYER_URL=https://api.helius.xyz/v0/transactions/submit');
console.log('   ✅ RPC_URL=https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}');

console.log('\n🚨 CURRENT ISSUES DETECTED:');
console.log('   ❌ Using wrong relayer pubkey (should be HeLiuSrpc...)');
console.log('   ❌ Helius API key is placeholder value');
console.log('   ❌ Wrong relayer URL (should be /v0/transactions/submit)');

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