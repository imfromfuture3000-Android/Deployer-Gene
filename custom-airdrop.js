#!/usr/bin/env node

const { Connection } = require('@solana/web3.js');
const { TokenAirdropManager } = require('./src/utils/airdropManager');

async function customAirdrop() {
  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  const airdropManager = new TokenAirdropManager(connection);

  // Custom investor addresses (add your addresses here)
  const customInvestors = [
    // Add investor wallet addresses here
    'INVESTOR_WALLET_1',
    'INVESTOR_WALLET_2',
    'INVESTOR_WALLET_3'
  ];

  const impulseAmount = parseInt(process.env.IMPULSE_AIRDROP_AMOUNT) || 10000;
  const omegaAmount = parseInt(process.env.OMEGA_AIRDROP_AMOUNT) || 5000;

  console.log('💫 Custom Investment Airdrop');
  console.log(`🎯 IMPULSE: ${impulseAmount} tokens per investor`);
  console.log(`🌟 OMEGA: ${omegaAmount} tokens per investor`);

  if (process.env.AIRDROP_ENABLED === 'true') {
    await airdropManager.airdropIMPULSE(customInvestors, impulseAmount * 1e9);
    await airdropManager.airdropOMEGA(customInvestors, omegaAmount * 1e9);
  }

  console.log('✅ Custom airdrop complete!');
}

if (require.main === module) {
  customAirdrop().catch(console.error);
}

module.exports = { customAirdrop };