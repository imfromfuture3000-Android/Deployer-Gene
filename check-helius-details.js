#!/usr/bin/env node
/**
 * Check Helius Details
 */

const fs = require('fs');

function checkHeliusDetails() {
  console.log('🔍 CHECKING HELIUS DETAILS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Load Helius configuration
  const heliusConfig = JSON.parse(fs.readFileSync('.cache/helius-dashboard-config.json', 'utf8'));
  
  console.log('📊 HELIUS ACCOUNT DETAILS:');
  console.log(`🎯 Plan: ${heliusConfig.plan}`);
  console.log(`✅ Basic Access: ${heliusConfig.features.basicAccess ? 'Enabled' : 'Disabled'}`);
  console.log(`💰 SOL Rebates: ${heliusConfig.features.solRebates ? 'Enabled' : 'Disabled'}`);
  console.log(`🔌 Enhanced WebSocket: ${heliusConfig.features.enhancedWebsocket ? 'Enabled' : 'Business Plan Required'}`);
  console.log(`🛡️ Access Control: ${heliusConfig.features.accessControl ? 'Available' : 'Not Available'}`);
  
  console.log('\n🌐 AVAILABLE ENDPOINTS:');
  Object.entries(heliusConfig.endpoints).forEach(([name, endpoint]) => {
    const displayName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`📡 ${displayName}: ${endpoint.replace('YOUR_API_KEY', '***')}`);
  });
  
  console.log('\n💰 REBATE CONFIGURATION:');
  console.log(`🎯 Status: ${heliusConfig.rebates.enabled ? 'Active' : 'Inactive'}`);
  console.log(`📋 Parameter: ${heliusConfig.rebates.parameter}`);
  console.log(`📝 Description: ${heliusConfig.rebates.description}`);
  
  // Check environment configuration
  console.log('\n🔧 ENVIRONMENT CONFIGURATION:');
  const envContent = fs.readFileSync('.env', 'utf8');
  
  const envVars = [
    'HELIUS_API_KEY',
    'REBATE_ADDRESS',
    'TREASURY_PUBKEY'
  ];
  
  envVars.forEach(envVar => {
    const match = envContent.match(new RegExp(`${envVar}=(.+)`));
    if (match && match[1] && match[1] !== 'your_helius_api_key_here') {
      console.log(`✅ ${envVar}: Configured`);
    } else {
      console.log(`❌ ${envVar}: Not configured`);
    }
  });
  
  // Helius features breakdown
  console.log('\n🚀 HELIUS FEATURES AVAILABLE:');
  const features = [
    '📡 Standard RPC methods',
    '💰 Automatic SOL rebates',
    '🔍 Transaction parsing API',
    '📊 Address transaction history',
    '🛡️ Access control rules',
    '🔌 WebSocket connections',
    '⚡ Priority fee optimization'
  ];
  
  features.forEach(feature => console.log(feature));
  
  console.log('\n⚠️ LIMITATIONS (Free Plan):');
  const limitations = [
    '📈 Rate limits apply',
    '🔌 Enhanced WebSocket unavailable',
    '📊 Limited historical data',
    '🎯 Basic support only'
  ];
  
  limitations.forEach(limitation => console.log(limitation));
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. Set actual HELIUS_API_KEY in .env');
  console.log('2. Use rebate parameter in sendTransaction calls');
  console.log('3. Monitor rebate earnings in treasury');
  console.log('4. Consider upgrade for enhanced features');
  
  return heliusConfig;
}

checkHeliusDetails();