#!/usr/bin/env node

const { Connection, PublicKey, Transaction } = require('@solana/web3.js');
require('dotenv').config();

async function setupJupiterRelayer() {
  console.log('🔄 JUPITER RELAYER SETUP');
  
  const relayerConfig = {
    endpoint: process.env.RELAYER_URL || 'https://api.helius.xyz/v0/transactions/submit',
    pubkey: process.env.RELAYER_PUBKEY || 'HeLiuSrpc1111111111111111111111111111111111',
    jupiterProgram: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    usdcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  };
  
  console.log('✅ Relayer Configured:');
  console.log('   Endpoint:', relayerConfig.endpoint);
  console.log('   Jupiter Program:', relayerConfig.jupiterProgram);
  console.log('   USDC Mint:', relayerConfig.usdcMint);
  
  return relayerConfig;
}

async function submitToRelayer(transaction) {
  const config = await setupJupiterRelayer();
  
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction: transaction.serialize({ requireAllSignatures: false }).toString('base64'),
      skipPreflight: false
    })
  });
  
  return await response.json();
}

module.exports = { setupJupiterRelayer, submitToRelayer };