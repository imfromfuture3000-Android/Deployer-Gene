#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

console.log('🚀 JUPITER USD DEPLOYMENT READY');
console.log('================================');

const deploymentConfig = {
  timestamp: new Date().toISOString(),
  jupiter: {
    program: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    usdcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    apiEndpoint: 'https://quote-api.jup.ag/v6'
  },
  relayer: {
    url: process.env.RELAYER_URL || 'https://api.helius.xyz/v0/transactions/submit',
    pubkey: process.env.RELAYER_PUBKEY || 'HeLiuSrpc1111111111111111111111111111111111',
    zeroCost: true
  },
  deployment: {
    network: 'mainnet-beta',
    mode: 'signer-only',
    ready: true
  }
};

// Save config
if (!fs.existsSync('.cache')) {
  fs.mkdirSync('.cache');
}

fs.writeFileSync('.cache/jupiter-deploy-config.json', JSON.stringify(deploymentConfig, null, 2));

console.log('✅ Configuration Saved:');
console.log('   Jupiter Program:', deploymentConfig.jupiter.program);
console.log('   USDC Mint:', deploymentConfig.jupiter.usdcMint);
console.log('   Relayer:', deploymentConfig.relayer.zeroCost ? 'ZERO-COST' : 'STANDARD');
console.log('   Network:', deploymentConfig.deployment.network);

console.log('\n🎯 READY FOR DEPLOYMENT');
console.log('   Run: npm run mainnet:bot-orchestrate');
console.log('   Or: node jupiter-usd-deploy.js');

module.exports = deploymentConfig;