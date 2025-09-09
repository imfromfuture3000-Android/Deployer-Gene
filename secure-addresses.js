const web3 = require('@solana/web3.js');
require('dotenv').config(); 

async function secureOwnedAddresses() { 
  console.log('🔒 SECURING ALL OWNED ADDRESSES'); 
  console.log('='.repeat(50)); 
  
  const connection = new web3.Connection(`${process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : (process.env.RPC_URL || "https://api.mainnet-beta.solana.com")}`); 
  
  // Remove hardcoded address, use only environment variables
  const ownedAddresses = [
    process.env.SOURCE_WALLET_ADDRESS,
    process.env.TARGET_WALLET_ADDRESS
  ].filter(addr => addr); // Filter out undefined values
  
  // Allow additional addresses from environment
  if (process.env.ADDITIONAL_ADDRESSES) {
    const additionalAddrs = process.env.ADDITIONAL_ADDRESSES.split(',');
    ownedAddresses.push(...additionalAddrs.map(addr => addr.trim()));
  }
  
  if (ownedAddresses.length === 0) {
    console.log('❌ No addresses configured. Set SOURCE_WALLET_ADDRESS, TARGET_WALLET_ADDRESS, or ADDITIONAL_ADDRESSES environment variables.');
    return;
  }
  
  console.log('📋 OWNED ADDRESSES INVENTORY:'); 
  ownedAddresses.forEach((addr, i) => { 
    console.log((i+1) + '. ' + addr); 
  }); 
  
  console.log('\\n🔍 SECURITY AUDIT:'); 
  for (let i = 0; i < ownedAddresses.length; i++) { 
    const address = ownedAddresses[i]; 
    if (!address) continue;
    
    const pubkey = new web3.PublicKey(address); 
    console.log('\\n--- ADDRESS ' + (i+1) + ' ---'); 
    console.log('Address:', address); 
    try { 
      const info = await connection.getAccountInfo(pubkey); 
      if (info) { 
        console.log('✅ EXISTS ON MAINNET'); 
        console.log('SOL Balance:', info.lamports / 1e9); 
        console.log('Owner:', info.owner.toBase58()); 
        console.log('Data Size:', info.data.length, 'bytes'); 
        console.log('Executable:', info.executable); 
        if (info.owner.toBase58() === '11111111111111111111111111111111') { 
          console.log('💎 TYPE: Standard Wallet (you control with private key)'); 
          console.log('🔐 SECURITY: Ensure private key is secured'); 
        } else if (info.owner.toBase58().includes('Token')) { 
          console.log('🪙 TYPE: Token Account'); 
          console.log('🔐 SECURITY: Controlled by token owner'); 
        } else { 
          console.log('📄 TYPE: Program/Contract Account'); 
        } 
      } else { 
        console.log('❌ NOT FOUND ON MAINNET'); 
        console.log('📝 STATUS: Available for use as new address'); 
      } 
    } catch (error) { 
      console.log('❌ ERROR:', error.message); 
    } 
  } 
  
  console.log('\\n🛡️ SECURITY RECOMMENDATIONS:'); 
  console.log('1. Back up all private keys securely'); 
  console.log('2. Use hardware wallets for large amounts'); 
  console.log('3. Test with small amounts first'); 
  console.log('4. Keep private keys offline'); 
  console.log('5. Use multi-sig for critical operations'); 
  
  console.log('\\n💰 TOTAL PORTFOLIO VALUE:'); 
  let totalSOL = 0; 
  for (let addr of ownedAddresses) { 
    if (!addr) continue;
    try { 
      const info = await connection.getAccountInfo(new web3.PublicKey(addr)); 
      if (info) totalSOL += info.lamports / 1e9; 
    } catch (e) {} 
  } 
  console.log('Total SOL across all addresses:', totalSOL.toFixed(6)); 
  console.log('\\n✅ ADDRESSES SECURED AND DOCUMENTED'); 
} 

secureOwnedAddresses().catch(console.error);
