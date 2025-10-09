#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

async function checkSolanaStatus() {
  console.log('🔍 CHECKING SOLANA NETWORK STATUS');
  console.log('==================================');

  const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
  
  try {
    // Check network health
    const healthResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth'
      })
    });
    
    const health = await healthResponse.json();
    console.log('✅ Network Health:', health.result || 'OK');

    // Check slot
    const slotResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSlot'
      })
    });
    
    const slot = await slotResponse.json();
    console.log('📊 Current Slot:', slot.result);

    // Check our key addresses
    const addresses = [
      'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', // Gene Mint
      '7V4aUYVwrYj7jFBbGWDAJhkfejf8ArKkPjyobLBTEw7U', // New Authority
      'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR'  // BOT1
    ];

    console.log('\n🔍 Checking Key Addresses:');
    
    for (const address of addresses) {
      const accountResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAccountInfo',
          params: [address, { encoding: 'base64' }]
        })
      });
      
      const account = await accountResponse.json();
      const exists = account.result !== null;
      console.log(`   ${address}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    }

    const status = {
      timestamp: new Date().toISOString(),
      network: 'mainnet-beta',
      rpcUrl,
      health: health.result || 'OK',
      slot: slot.result,
      addressChecks: addresses.length,
      status: 'ONLINE'
    };

    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/solana-status.json', JSON.stringify(status, null, 2));

    console.log('\n📊 Network Status: ONLINE');
    console.log(`   RPC: ${rpcUrl}`);
    console.log(`   Slot: ${slot.result}`);

  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

if (require.main === module) {
  checkSolanaStatus().catch(console.error);
}

module.exports = { checkSolanaStatus };