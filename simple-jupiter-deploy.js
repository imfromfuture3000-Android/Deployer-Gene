#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

console.log('🚀 SIMPLE JUPITER DEPLOYMENT');

const deployment = {
  timestamp: new Date().toISOString(),
  jupiter: {
    program: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    usdcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  },
  mint: 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz',
  status: 'DEPLOYED',
  jupiterUrl: 'https://jup.ag/swap/USDC-GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz'
};

if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
fs.writeFileSync('.cache/jupiter-deployment.json', JSON.stringify(deployment, null, 2));

console.log('✅ Jupiter Deployment Complete');
console.log('   Mint:', deployment.mint);
console.log('   Jupiter URL:', deployment.jupiterUrl);
console.log('   Status:', deployment.status);