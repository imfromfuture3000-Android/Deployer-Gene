#!/usr/bin/env node
/**
 * Check Helius RPC
 */

const { Connection } = require('@solana/web3.js');

async function checkHeliusRPC() {
  console.log('🌐 CHECKING HELIUS RPC');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const heliusApiKey = process.env.HELIUS_API_KEY;
  
  if (!heliusApiKey) {
    console.log('❌ HELIUS_API_KEY not found in environment');
    console.log('💡 Set with: export HELIUS_API_KEY="your_key_here"');
    return false;
  }
  
  const heliusRPC = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
  
  try {
    console.log('🔍 Testing Helius RPC connection...');
    const connection = new Connection(heliusRPC, 'confirmed');
    
    // Test basic connection
    const version = await connection.getVersion();
    console.log(`✅ Connected to Helius RPC`);
    console.log(`📊 Solana Version: ${version['solana-core']}`);
    
    // Test genesis hash
    const genesisHash = await connection.getGenesisHash();
    console.log(`🌐 Genesis Hash: ${genesisHash}`);
    
    // Test slot
    const slot = await connection.getSlot();
    console.log(`📈 Current Slot: ${slot}`);
    
    // Test performance
    const startTime = Date.now();
    await connection.getLatestBlockhash();
    const responseTime = Date.now() - startTime;
    console.log(`⚡ Response Time: ${responseTime}ms`);
    
    // Test rate limits
    console.log('\n🚀 Testing Helius Enhanced Features...');
    
    // Test enhanced methods (Helius specific)
    try {
      const result = await fetch(heliusRPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4',
            page: 1,
            limit: 10
          }
        })
      });
      
      if (result.ok) {
        console.log('✅ Helius Enhanced API: Working');
      } else {
        console.log('⚠️ Helius Enhanced API: Limited access');
      }
    } catch (e) {
      console.log('⚠️ Helius Enhanced API: Not available');
    }
    
    console.log('\n🎯 HELIUS RPC STATUS: READY');
    console.log(`🔗 Endpoint: ${heliusRPC.replace(heliusApiKey, '***')}`);
    
    return {
      status: 'connected',
      endpoint: heliusRPC,
      version: version['solana-core'],
      responseTime: responseTime,
      slot: slot
    };
    
  } catch (error) {
    console.log(`❌ Helius RPC Error: ${error.message}`);
    return false;
  }
}

checkHeliusRPC();