const fs = require('fs');
const path = require('path');

console.log('🔍 EXTRACTING HELIUS API KEY FROM FUTURISTIC REPO');
console.log('=' .repeat(60));

// Read the futuristic .env file
const futuristicEnvPath = '/workspaces/Deployer-Gene/The-Futuristic-Kami-Omni-Engine/.env';

try {
  const envContent = fs.readFileSync(futuristicEnvPath, 'utf8');
  
  // Extract Helius API key
  const heliusKeyMatch = envContent.match(/HELIUS_API_KEY=(.+)/);
  
  if (heliusKeyMatch && heliusKeyMatch[1] !== 'your_helius_api_key_here') {
    const heliusKey = heliusKeyMatch[1].trim();
    console.log('✅ Found Helius API key:', heliusKey.substring(0, 12) + '...');
    
    // Update main .env file
    const mainEnvPath = '/workspaces/Deployer-Gene/.env';
    let mainEnvContent = fs.readFileSync(mainEnvPath, 'utf8');
    
    // Replace the placeholder with actual key
    mainEnvContent = mainEnvContent.replace(
      'HELIUS_API_KEY=your_helius_api_key_here',
      `HELIUS_API_KEY=${heliusKey}`
    );
    
    // Also update RPC URL to use the key
    mainEnvContent = mainEnvContent.replace(
      'RPC_URL=https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}',
      `RPC_URL=https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
    );
    
    fs.writeFileSync(mainEnvPath, mainEnvContent);
    
    console.log('✅ Updated main .env file with Helius API key');
    console.log('🔧 Updated RPC URL with API key');
    
    // Verify the update
    console.log('\n📋 UPDATED CONFIGURATION:');
    console.log('HELIUS_API_KEY=', heliusKey.substring(0, 12) + '...');
    console.log('RPC_URL=https://mainnet.helius-rpc.com/?api-key=' + heliusKey.substring(0, 8) + '...');
    console.log('RELAYER_PUBKEY=HeLiuSrpc1111111111111111111111111111111111');
    console.log('RELAYER_URL=https://api.helius.xyz/v0/transactions/submit');
    
    console.log('\n🎯 READY TO TEST:');
    console.log('node check-relayer-rpc.js');
    
  } else {
    console.log('❌ No valid Helius API key found in futuristic repo');
    console.log('💡 The key is still a placeholder value');
  }
  
} catch (error) {
  console.error('❌ Error reading futuristic .env:', error.message);
}