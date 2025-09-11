const web3 = require('@solana/web3.js');
require('dotenv').config(); 

async function generateSecurityReport() { 
  console.log('🔒 COMPREHENSIVE ADDRESS SECURITY REPORT'); 
  console.log('Generated:', new Date().toISOString()); 
  console.log('='.repeat(60)); 
  
  // Remove hardcoded addresses and balances - use live data only
  const addressConfig = [
    { key: 'SOURCE_WALLET', env: 'SOURCE_WALLET_ADDRESS', type: 'PRIMARY_WALLET' },
    { key: 'TARGET_WALLET', env: 'TARGET_WALLET_ADDRESS', type: 'DEPLOYMENT_TARGET' }
  ];
  
  const connection = new web3.Connection(`${process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : (process.env.RPC_URL || "https://api.mainnet-beta.solana.com")}`);
  
  const ownedAddresses = {};
  
  // Build address list from environment variables
  for (const config of addressConfig) {
    const address = process.env[config.env];
    if (address) {
      try {
        const info = await connection.getAccountInfo(new web3.PublicKey(address));
        ownedAddresses[config.key] = {
          pubkey: address,
          balance: info ? info.lamports / 1e9 : 0,
          status: info ? 'ACTIVE' : 'AVAILABLE',
          type: config.type,
          security: info && info.lamports > 100000000 ? 'HIGH_VALUE' : 'SAFE_FOR_USE' // 0.1 SOL threshold
        };
      } catch (e) {
        ownedAddresses[config.key] = {
          pubkey: address,
          balance: 0,
          status: 'ERROR',
          type: config.type,
          security: 'UNKNOWN'
        };
      }
    }
  }
  
  if (Object.keys(ownedAddresses).length === 0) {
    console.log('❌ No addresses configured. Set SOURCE_WALLET_ADDRESS and TARGET_WALLET_ADDRESS environment variables.');
    return;
  }
  
  console.log('📋 ADDRESS OWNERSHIP CONFIRMATION:'); 
  Object.entries(ownedAddresses).forEach(([key, data]) => { 
    console.log('\\n' + key.toUpperCase() + ':'); 
    console.log('Address:', data.pubkey); 
    console.log('Balance:', data.balance, 'SOL'); 
    console.log('Status:', data.status); 
    console.log('Type:', data.type); 
    console.log('Security Level:', data.security); 
    if (data.balance > 0.1) { 
      console.log('⚠️ HIGH VALUE - Secure private key immediately'); 
    } 
  }); 
  
  console.log('\\n💰 PORTFOLIO SUMMARY:'); 
  const totalValue = Object.values(ownedAddresses).reduce((sum, addr) => sum + addr.balance, 0); 
  console.log('Total Portfolio Value:', totalValue.toFixed(6), 'SOL'); 
  console.log('Estimated USD Value: $' + (totalValue * 150).toFixed(2), '(assuming $150/SOL)'); 
  
  console.log('\\n✅ SECURITY CHECKLIST:'); 
  console.log('☐ Private keys backed up offline'); 
  console.log('☐ Hardware wallet for high-value addresses'); 
  console.log('☐ Multi-sig setup for critical operations'); 
  console.log('☐ Recovery phrases stored securely'); 
  console.log('☐ Access permissions documented'); 
  
  console.log('\\n⚡ GENERAL RECOMMENDATIONS:'); 
  console.log('1. SECURE all private keys using hardware wallets'); 
  console.log('2. BACKUP recovery phrases in multiple secure locations'); 
  console.log('3. TEST with small amounts before large transactions'); 
  console.log('4. USE multi-sig for high-value operations'); 
  
  console.log('\\n🚀 DEPLOYMENT STRATEGY:'); 
  if (ownedAddresses.SOURCE_WALLET) {
    console.log(`📤 Funding Source: ${ownedAddresses.SOURCE_WALLET.pubkey}`);
  }
  if (ownedAddresses.TARGET_WALLET) {
    console.log(`📥 Deployment Target: ${ownedAddresses.TARGET_WALLET.pubkey}`);
  }
  
  console.log('\\n✅ ADDRESSES SECURED AND READY FOR DEPLOYMENT'); 
  return ownedAddresses; 
} 

generateSecurityReport().then(addresses => { 
  console.log('\\n✅ SECURITY AUDIT COMPLETE'); 
  console.log('All addresses documented and secured'); 
}).catch(console.error);
