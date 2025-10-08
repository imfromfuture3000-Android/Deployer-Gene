const { Connection, PublicKey } = require('@solana/web3.js');
const fetch = require('node-fetch');
require('dotenv').config();

async function checkRelayerAndRPC() {
  console.log('🔍 CHECKING RELAYER & RPC STATUS');
  console.log('=' .repeat(50));
  
  // Check environment variables
  console.log('📋 ENVIRONMENT CHECK:');
  console.log('  RPC_URL:', process.env.RPC_URL || 'NOT SET');
  console.log('  RELAYER_URL:', process.env.RELAYER_URL || 'NOT SET');
  console.log('  RELAYER_PUBKEY:', process.env.RELAYER_PUBKEY || 'NOT SET');
  console.log('  HELIUS_API_KEY:', process.env.HELIUS_API_KEY ? 'SET' : 'NOT SET');
  
  // Test RPC connection
  console.log('\n🌐 RPC CONNECTION TEST:');
  try {
    const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');
    const slot = await connection.getSlot();
    // Test basic connection
    const version = await connection.getVersion();
    
    console.log('  ✅ RPC Connected');
    console.log('  📊 Current Slot:', slot);
    console.log('  🔧 Version:', version['solana-core']);
    
    // Check if it's QuickNode
    if (process.env.RPC_URL?.includes('quicknode')) {
      console.log('  🚨 QUICKNODE DETECTED - Check trial expiration');
    }
    
  } catch (error) {
    console.log('  ❌ RPC Failed:', error.message);
    if (error.message.includes('403') || error.message.includes('401')) {
      console.log('  🚨 LIKELY EXPIRED: API key or trial expired');
    }
  }
  
  // Test Helius relayer signer
  console.log('\n🔑 HELIUS RELAYER CHECK:');
  if (process.env.RELAYER_PUBKEY) {
    try {
      const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY);
      console.log('  ✅ Relayer pubkey valid:', relayerPubkey.toBase58());
      
      // Check if it's the standard Helius relayer
      const standardHelius = 'HeLiuSrpc1111111111111111111111111111111111';
      if (process.env.RELAYER_PUBKEY === standardHelius) {
        console.log('  ✅ Standard Helius relayer detected');
      } else {
        console.log('  ⚠️  Custom relayer pubkey (verify it\'s correct)');
      }
      
    } catch (error) {
      console.log('  ❌ Invalid relayer pubkey:', error.message);
    }
  } else {
    console.log('  ❌ No relayer pubkey configured');
  }
  
  // Test Helius API
  console.log('\n🌟 HELIUS API TEST:');
  if (process.env.HELIUS_API_KEY && process.env.HELIUS_API_KEY !== 'your_helius_api_key_here') {
    try {
      const heliusRPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
      const response = await fetch(heliusRPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth'
        })
      });
      
      const result = await response.json();
      if (result.result === 'ok') {
        console.log('  ✅ Helius API working');
      } else {
        console.log('  ❌ Helius API issue:', result);
      }
      
    } catch (error) {
      console.log('  ❌ Helius API failed:', error.message);
      if (error.message.includes('403') || error.message.includes('401')) {
        console.log('  🚨 LIKELY EXPIRED: Helius API key expired or invalid');
      }
    }
  } else {
    console.log('  ⚠️  Helius API key not configured or using placeholder');
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (!process.env.HELIUS_API_KEY || process.env.HELIUS_API_KEY === 'your_helius_api_key_here') {
    console.log('  🔧 Get Helius API key: https://helius.xyz');
  }
  
  if (process.env.RPC_URL?.includes('quicknode')) {
    console.log('  🔧 QuickNode trial expired? Switch to Helius or get paid plan');
  }
  
  if (!process.env.RELAYER_PUBKEY) {
    console.log('  🔧 Set RELAYER_PUBKEY=HeLiuSrpc1111111111111111111111111111111111');
  }
  
  console.log('\n🎯 SUGGESTED .env UPDATE:');
  console.log('RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY');
  console.log('RELAYER_URL=https://api.helius.xyz/v0/transactions/submit');
  console.log('RELAYER_PUBKEY=HeLiuSrpc1111111111111111111111111111111111');
  console.log('HELIUS_API_KEY=your_actual_helius_api_key');
}

checkRelayerAndRPC().catch(console.error);