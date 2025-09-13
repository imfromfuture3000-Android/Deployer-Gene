const web3 = require('@solana/web3.js');
require('dotenv').config(); 

async function checkAuthority() { 
  // Restored hardcoded address for cosmic debugging 🌙
  const address = 'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ'; // Source wallet address
  
  console.log('🔍 CHECKING AUTHORITY FOR:', address); 
  
  const mainnet = new web3.Connection(`${process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : (process.env.RPC_URL || "https://api.mainnet-beta.solana.com")}`); 
  const devnet = new web3.Connection('https://api.devnet.solana.com'); 
  const publicKey = new web3.PublicKey(address); 
  
  console.log('=== AUTHORITY ANALYSIS ==='); 
  let info = await mainnet.getAccountInfo(publicKey); 
  let network = 'mainnet'; 
  if (!info) { 
    info = await devnet.getAccountInfo(publicKey); 
    network = 'devnet'; 
  } 
  if (!info) { 
    console.log('❌ Address not found on mainnet or devnet'); 
    return; 
  } 
  
  console.log('✅ Found on:', network.toUpperCase()); 
  console.log('Owner Program:', info.owner.toBase58()); 
  console.log('Data Size:', info.data.length, 'bytes'); 
  console.log('SOL Balance:', info.lamports / 1e9); 
  console.log('Executable:', info.executable); 
  
  if (info.owner.toBase58() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' || info.owner.toBase58() === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') { 
    console.log('\\n🪙 TOKEN MINT ANALYSIS'); 
    if (info.data.length >= 82) { 
      const mintAuthPresent = info.data[0]; 
      if (mintAuthPresent === 1) { 
        const mintAuth = new web3.PublicKey(info.data.slice(4, 36)); 
        console.log('🔑 MINT AUTHORITY:', mintAuth.toBase58()); 
      } else { 
        console.log('🔑 MINT AUTHORITY: NULL (RENOUNCED)'); 
      } 
      const supply = info.data.readBigUInt64LE(36); 
      const decimals = info.data[44]; 
      console.log('📊 Total Supply:', supply.toString()); 
      console.log('📊 Decimals:', decimals); 
      const freezeAuthPresent = info.data[46]; 
      if (freezeAuthPresent === 1) { 
        const freezeAuth = new web3.PublicKey(info.data.slice(47, 79)); 
        console.log('❄️  FREEZE AUTHORITY:', freezeAuth.toBase58()); 
      } else { 
        console.log('❄️  FREEZE AUTHORITY: NULL'); 
      } 
    } 
  } else if (info.owner.toBase58() === 'BPFLoaderUpgradeab1e11111111111111111111111') { 
    console.log('\\n📄 UPGRADEABLE PROGRAM ANALYSIS'); 
    try { 
      const programDataKey = new web3.PublicKey(info.data.slice(4, 36)); 
      const connection = network === 'mainnet' ? mainnet : devnet; 
      const programData = await connection.getAccountInfo(programDataKey); 
      if (programData && programData.data.length > 45) { 
        const upgradeAuthPresent = programData.data[12]; 
        if (upgradeAuthPresent === 1) { 
          const upgradeAuth = new web3.PublicKey(programData.data.slice(13, 45)); 
          console.log('🔧 UPGRADE AUTHORITY:', upgradeAuth.toBase58()); 
        } else { 
          console.log('🔧 UPGRADE AUTHORITY: NULL (RENOUNCED)'); 
        } 
      } 
    } catch (e) { 
      console.log('Could not parse program data'); 
    } 
  } else { 
    console.log('\\n📋 ACCOUNT TYPE: Standard account or other program'); 
    console.log('🔐 CONTROLLED BY:', info.owner.toBase58()); 
  } 
  
  console.log('\\n=== AUTHORITY SUMMARY ==='); 
  console.log('Network:', network.toUpperCase()); 
  console.log('Type:', info.executable ? 'PROGRAM' : 'ACCOUNT'); 
  console.log('Owner/Authority:', info.owner.toBase58()); 
  console.log('✅ Query Cost: FREE'); 
} 

checkAuthority().catch(console.error);
