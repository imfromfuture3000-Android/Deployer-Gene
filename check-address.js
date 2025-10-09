#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

async function checkAddress(address) {
  console.log('🔍 CHECKING SOLANA ADDRESS');
  console.log('==========================');
  console.log(`Address: ${address}`);

  const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [address, { encoding: 'base64' }]
      })
    });

    const data = await response.json();
    const exists = data.result !== null;

    console.log(`Status: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    
    if (exists) {
      const account = data.result;
      console.log(`Owner: ${account.owner}`);
      console.log(`Lamports: ${account.lamports}`);
      console.log(`Executable: ${account.executable}`);
      console.log(`Explorer: https://explorer.solana.com/address/${address}`);
    }

    const result = {
      address,
      exists,
      timestamp: new Date().toISOString(),
      explorer: `https://explorer.solana.com/address/${address}`
    };

    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/address-check.json', JSON.stringify(result, null, 2));

    return result;

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

const targetAddress = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1';
checkAddress(targetAddress).catch(console.error);