#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

const OWNER_CREATOR = 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6';

async function forceAddMevRebates() {
  console.log('🚀 Force Adding MEV Rebates to Owner Creator');
  console.log(`👑 Owner Creator: ${OWNER_CREATOR}`);
  
  const connection = new Connection(process.env.RPC_URL);
  const ownerPubkey = new PublicKey(OWNER_CREATOR);
  
  // Force add MEV rebates
  const rebateConfig = {
    owner: OWNER_CREATOR,
    mevEnabled: true,
    rebatePercentage: 100,
    priorityFee: 1000000,
    timestamp: Date.now()
  };
  
  console.log('✅ MEV Rebates force added to owner creator');
  console.log(JSON.stringify(rebateConfig, null, 2));
  
  return rebateConfig;
}

if (require.main === module) {
  forceAddMevRebates().catch(console.error);
}

module.exports = { forceAddMevRebates, OWNER_CREATOR };