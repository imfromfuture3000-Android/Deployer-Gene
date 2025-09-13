const web3 = require('@solana/web3.js');
require('dotenv').config(); 

async function checkAddress() { 
  // Restored hardcoded address for cosmic debugging 🌙
  const address = 'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp'; // Query/check address
  
  console.log('Checking address:', address); 
  
  const devnet = new web3.Connection('https://api.devnet.solana.com', 'confirmed'); 
  const mainnet = new web3.Connection(`${process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : (process.env.RPC_URL || "https://api.mainnet-beta.solana.com")}`, 'confirmed'); 
  
  console.log('Checking DEVNET...'); 
  try { 
    const devnetInfo = await devnet.getAccountInfo(new web3.PublicKey(address)); 
    if (devnetInfo) { 
      console.log('✅ EXISTS ON DEVNET'); 
      console.log('Owner:', devnetInfo.owner.toBase58()); 
      console.log('Data length:', devnetInfo.data.length); 
    } else { 
      console.log('❌ NOT FOUND ON DEVNET'); 
    } 
  } catch (e) { 
    console.log('❌ DEVNET ERROR:', e.message); 
  } 
  
  console.log('Checking MAINNET...'); 
  try { 
    const mainnetInfo = await mainnet.getAccountInfo(new web3.PublicKey(address)); 
    if (mainnetInfo) { 
      console.log('✅ EXISTS ON MAINNET'); 
      console.log('Owner:', mainnetInfo.owner.toBase58()); 
      console.log('Data length:', mainnetInfo.data.length); 
    } else { 
      console.log('❌ NOT FOUND ON MAINNET'); 
    } 
  } catch (e) { 
    console.log('❌ MAINNET ERROR:', e.message); 
  } 
} 

checkAddress().catch(console.error);
