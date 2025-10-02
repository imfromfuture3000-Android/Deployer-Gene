const { validateRpcEndpoint, getValidatedRpcUrl } = require('./dist/utils/allowlist');

// Test RPC endpoints
const testEndpoints = [
  process.env.RPC_URL,
  'https://mainnet.helius-rpc.com/v0/?api-key=test',
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.quiknode.pro/abc123'
];

console.log('🔍 Validating RPC Endpoints...\n');

testEndpoints.forEach(url => {
  if (!url) return;
  
  try {
    const isValid = validateRpcEndpoint(url);
    console.log(`${isValid ? '✅' : '❌'} ${url}`);
    
    if (isValid) {
      getValidatedRpcUrl(url);
    }
  } catch (error) {
    console.log(`❌ ${url} - ${error.message}`);
  }
});

console.log('\n🛡️ Allowlist validation complete');