const web3 = require('@solana/web3.js');
require('dotenv').config(); 

async function detailedQuery() { 
  console.log('🔍 DETAILED MAINNET CONTRACT STATE QUERY'); 
  
  // Use environment variable for address instead of hardcoded value
  const address = process.env.QUERY_ADDRESS || process.env.TARGET_WALLET_ADDRESS;
  
  if (!address) {
    console.log('❌ No address specified. Set QUERY_ADDRESS or TARGET_WALLET_ADDRESS environment variable.');
    return;
  }
  
  const connection = new web3.Connection(`${process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : (process.env.RPC_URL || "https://api.mainnet-beta.solana.com")}`); 
  
  const publicKey = new web3.PublicKey(address); 
  const info = await connection.getAccountInfo(publicKey); 
  
  if (!info) {
    console.log('❌ Address not found on mainnet');
    return;
  }
  
  console.log('=== FULL STATE ANALYSIS ==='); 
  console.log('Address:', address); 
  console.log('Owner:', info.owner.toBase58()); 
  console.log('Data Size:', info.data.length, 'bytes'); 
  console.log('SOL Balance:', info.lamports / 1e9); 
  console.log('Executable:', info.executable); 
  console.log('Rent Epoch:', info.rentEpoch); 
  console.log('Raw Data (hex):', info.data.toString('hex').substring(0, 100) + '...'); 
  console.log('=== TRANSACTION HISTORY ==='); 
  
  const sigs = await connection.getSignaturesForAddress(publicKey, {limit: 3}); 
  sigs.forEach((sig, i) => { 
    console.log(i+1 + '. ' + sig.signature.substring(0, 20) + '...'); 
    console.log('   Slot:', sig.slot); 
    console.log('   Status:', sig.err ? 'Failed' : 'Success'); 
  }); 
  console.log('✅ QUERY COMPLETE - NO COST'); 
} 

detailedQuery().catch(console.error);
