#!/usr/bin/env node
/**
 * Configure Helius API from Dashboard
 */

const fs = require('fs');

function configureHeliusAPI() {
  console.log('🔑 CONFIGURING HELIUS API FROM DASHBOARD');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Helius endpoints from dashboard
  const heliusConfig = {
    plan: 'Free Plan',
    features: {
      basicAccess: true,
      solRebates: true,
      enhancedWebsocket: false, // Requires Business plan
      accessControl: true
    },
    endpoints: {
      mainnetRPC: 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY',
      devnetRPC: 'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
      websocket: 'wss://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY',
      parseTransactions: 'https://api.helius.xyz/v0/transactions/?api-key=YOUR_API_KEY',
      parseHistory: 'https://api.helius.xyz/v0/addresses/{address}/transactions/?api-key=YOUR_API_KEY'
    },
    rebates: {
      enabled: true,
      parameter: 'rebate-address=zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4',
      description: 'Automatic SOL rebates via post-trade backruns'
    }
  };
  
  console.log('📊 HELIUS PLAN: Free Plan');
  console.log('✅ Basic RPC access available');
  console.log('💰 SOL rebates enabled');
  console.log('⚠️ Enhanced features require upgrade');
  
  console.log('\n🌐 CONFIGURED ENDPOINTS:');
  console.log(`📡 Mainnet RPC: ${heliusConfig.endpoints.mainnetRPC.replace('YOUR_API_KEY', '***')}`);
  console.log(`🧪 Devnet RPC: ${heliusConfig.endpoints.devnetRPC.replace('YOUR_API_KEY', '***')}`);
  console.log(`🔌 WebSocket: ${heliusConfig.endpoints.websocket.replace('YOUR_API_KEY', '***')}`);
  
  console.log('\n💰 SOL REBATES CONFIGURATION:');
  console.log(`🎯 Rebate Address: zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4`);
  console.log(`📋 Parameter: ${heliusConfig.rebates.parameter}`);
  
  // Update .env with rebate configuration
  let envContent = fs.readFileSync('.env', 'utf8');
  
  if (!envContent.includes('REBATE_ADDRESS')) {
    envContent += '\n# Helius SOL Rebates\nREBATE_ADDRESS=zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4\n';
    fs.writeFileSync('.env', envContent);
    console.log('✅ Added REBATE_ADDRESS to .env');
  }
  
  // Save Helius configuration
  fs.writeFileSync('.cache/helius-dashboard-config.json', JSON.stringify(heliusConfig, null, 2));
  
  console.log('\n🎯 HELIUS API CONFIGURED');
  console.log('📋 Configuration saved to .cache/helius-dashboard-config.json');
  console.log('💡 Ready for deployment with SOL rebates enabled');
  
  return heliusConfig;
}

configureHeliusAPI();