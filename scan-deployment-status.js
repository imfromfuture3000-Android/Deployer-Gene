#!/usr/bin/env node

const fs = require('fs');
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

async function scanAllData() {
  console.log('🔍 SCANNING ALL DEPLOYMENT DATA');
  console.log('================================');
  
  const connection = new Connection(process.env.RPC_URL);
  const results = {
    environment: {},
    cache: {},
    contracts: {},
    nextSteps: []
  };

  // Scan environment
  results.environment = {
    rpcUrl: process.env.RPC_URL || 'NOT_SET',
    heliusKey: process.env.HELIUS_API_KEY ? 'SET' : 'NOT_SET',
    relayerUrl: process.env.RELAYER_URL || 'NOT_SET',
    treasuryPubkey: process.env.TREASURY_PUBKEY || 'NOT_SET'
  };

  // Scan cache files
  const cacheFiles = ['.cache/mint.json', '.cache/user_auth.json', '.cache/deployment-log.json'];
  for (const file of cacheFiles) {
    results.cache[file] = fs.existsSync(file) ? 'EXISTS' : 'MISSING';
  }

  // Check if mint exists
  if (fs.existsSync('.cache/mint.json')) {
    const mintData = JSON.parse(fs.readFileSync('.cache/mint.json', 'utf8'));
    const mintPubkey = new PublicKey(mintData.mint);
    try {
      const mintInfo = await connection.getAccountInfo(mintPubkey);
      results.contracts.mint = {
        address: mintData.mint,
        onChain: mintInfo ? 'EXISTS' : 'NOT_FOUND'
      };
    } catch (e) {
      results.contracts.mint = { address: mintData.mint, onChain: 'ERROR' };
    }
  }

  // Determine next steps
  if (results.environment.heliusKey === 'NOT_SET') {
    results.nextSteps.push('❌ Set HELIUS_API_KEY in .env');
  }
  
  if (results.cache['.cache/mint.json'] === 'MISSING') {
    results.nextSteps.push('🔬 Run: npm run mainnet:copilot → Create mint');
  } else if (results.contracts.mint?.onChain === 'EXISTS') {
    results.nextSteps.push('💰 Run: npm run mainnet:copilot → Mint initial supply');
    results.nextSteps.push('🔒 Run: npm run mainnet:copilot → Lock authorities');
  }

  if (results.nextSteps.length === 0) {
    results.nextSteps.push('✅ Ready for deployment! Run: npm run mainnet:copilot');
  }

  console.log(JSON.stringify(results, null, 2));
  return results;
}

if (require.main === module) {
  scanAllData().catch(console.error);
}

module.exports = { scanAllData };