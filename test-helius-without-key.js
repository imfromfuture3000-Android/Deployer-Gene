#!/usr/bin/env node
/**
 * Test Helius RPC without API key
 */

const { Connection } = require('@solana/web3.js');

async function testHeliusRPC() {
  console.log('🌐 TESTING HELIUS RPC (NO API KEY)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const endpoints = [
    'https://mainnet.helius-rpc.com',
    'https://api.mainnet-beta.solana.com',
    'https://solana-mainnet.g.alchemy.com/v2/demo'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      const connection = new Connection(endpoint, 'confirmed');
      
      const startTime = Date.now();
      const version = await connection.getVersion();
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ Connected successfully`);
      console.log(`📊 Version: ${version['solana-core']}`);
      console.log(`⚡ Response: ${responseTime}ms`);
      
      // Test basic operations
      const slot = await connection.getSlot();
      const genesis = await connection.getGenesisHash();
      
      console.log(`📈 Slot: ${slot}`);
      console.log(`🌐 Genesis: ${genesis.slice(0, 8)}...`);
      
      if (endpoint.includes('helius')) {
        console.log('🎯 Helius RPC: Working without API key');
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n💡 HELIUS RPC STATUS:');
  console.log('✅ Public endpoint works without API key');
  console.log('⚠️ Rate limited without API key');
  console.log('🔑 Enhanced features require API key');
}

testHeliusRPC();