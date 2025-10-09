#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

async function checkSolBalance() {
  console.log('💰 CHECKING SOL BALANCE');
  console.log('=======================');

  const systemProgram = '11111111111111111111111111111112';
  const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [systemProgram]
      })
    });

    const data = await response.json();
    const lamports = data.result?.value || 0;
    const sol = lamports / 1e9;

    console.log(`Address: ${systemProgram}`);
    console.log(`Balance: ${lamports} lamports`);
    console.log(`Balance: ${sol} SOL`);

    const balanceCheck = {
      timestamp: new Date().toISOString(),
      address: systemProgram,
      lamports,
      sol,
      available: sol > 0,
      status: sol > 0 ? 'FUNDED' : 'EMPTY'
    };

    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/sol-balance-check.json', JSON.stringify(balanceCheck, null, 2));

    console.log(`Status: ${balanceCheck.status}`);
    console.log(`Available: ${balanceCheck.available ? 'YES' : 'NO'}`);

    return balanceCheck;

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

if (require.main === module) {
  checkSolBalance().catch(console.error);
}

module.exports = { checkSolBalance };