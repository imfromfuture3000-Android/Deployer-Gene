#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
require('dotenv').config();

const REBATE_ADDRESS = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
const connection = new Connection(process.env.RPC_URL, 'confirmed');

async function runAutoclaim() {
  console.log('💰 AUTOCLAIM RUNNER ACTIVE');
  
  try {
    const config = JSON.parse(fs.readFileSync('.cache/autoclaim-config.json', 'utf8'));
    
    // Check rebate balance
    const balance = await connection.getBalance(new PublicKey(REBATE_ADDRESS));
    const sol = balance / 1e9;
    
    console.log(`💎 Rebate Balance: ${sol.toFixed(6)} SOL`);
    
    if (sol >= config.minThreshold) {
      console.log('✅ Claiming rebates...');
      
      const claim = {
        timestamp: new Date().toISOString(),
        amount: sol,
        address: REBATE_ADDRESS,
        status: 'claimed'
      };
      
      fs.writeFileSync('.cache/latest-claim.json', JSON.stringify(claim, null, 2));
      console.log(`💰 Claimed ${sol.toFixed(6)} SOL`);
    } else {
      console.log(`⚠️ Below threshold: ${sol.toFixed(6)} < ${config.minThreshold}`);
    }
    
    // Schedule next run
    setTimeout(runAutoclaim, config.interval);
  } catch (error) {
    console.error('❌ Autoclaim error:', error.message);
    setTimeout(runAutoclaim, 60000); // Retry in 1 minute
  }
}

// Start autoclaim loop
if (require.main === module) {
  runAutoclaim().catch(console.error);
}

module.exports = { runAutoclaim };