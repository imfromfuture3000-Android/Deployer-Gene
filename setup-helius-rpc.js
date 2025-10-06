#!/usr/bin/env node
/**
 * Setup Helius RPC
 */

async function setupHeliusRPC() {
  console.log('🌐 SETTING UP HELIUS RPC');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Common Helius endpoints
  const heliusEndpoints = {
    mainnet: 'https://mainnet.helius-rpc.com',
    devnet: 'https://devnet.helius-rpc.com',
    websocket: 'wss://mainnet.helius-rpc.com'
  };
  
  console.log('📋 HELIUS RPC ENDPOINTS:');
  Object.entries(heliusEndpoints).forEach(([network, endpoint]) => {
    console.log(`${network}: ${endpoint}`);
  });
  
  // Test without API key first
  console.log('\n🔍 Testing Helius RPC access...');
  
  try {
    const testResponse = await fetch('https://mainnet.helius-rpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth'
      })
    });
    
    const result = await testResponse.json();
    
    if (result.error && result.error.code === -32401) {
      console.log('⚠️ Helius requires API key');
      console.log('💡 Get free API key at: https://helius.xyz');
    } else if (result.result === 'ok') {
      console.log('✅ Helius RPC accessible');
    }
    
  } catch (error) {
    console.log(`❌ Helius test failed: ${error.message}`);
  }
  
  // Update .env with Helius configuration
  const fs = require('fs');
  let envContent = fs.readFileSync('.env', 'utf8');
  
  // Update Helius configuration
  if (envContent.includes('HELIUS_API_KEY=')) {
    console.log('✅ HELIUS_API_KEY already configured in .env');
  } else {
    envContent += '\n# Helius RPC Configuration\nHELIUS_API_KEY=your_helius_api_key_here\n';
    fs.writeFileSync('.env', envContent);
    console.log('✅ Added HELIUS_API_KEY to .env');
  }
  
  // Create Helius configuration
  const heliusConfig = {
    endpoints: heliusEndpoints,
    features: [
      'Enhanced RPC methods',
      'Webhooks',
      'NFT API',
      'DAS API',
      'Priority fees',
      'Transaction parsing'
    ],
    setup: {
      step1: 'Get API key from https://helius.xyz',
      step2: 'Set HELIUS_API_KEY in .env',
      step3: 'Use https://mainnet.helius-rpc.com/?api-key=YOUR_KEY'
    }
  };
  
  fs.writeFileSync('.cache/helius-setup.json', JSON.stringify(heliusConfig, null, 2));
  
  console.log('\n🎯 HELIUS SETUP COMPLETE');
  console.log('📋 Configuration saved to .cache/helius-setup.json');
  console.log('🔑 To activate: Set HELIUS_API_KEY in .env file');
  
  return heliusConfig;
}

setupHeliusRPC();