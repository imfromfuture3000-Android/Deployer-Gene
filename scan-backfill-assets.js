#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

const DESTINATION = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';

async function scanBackfillAssets() {
  console.log('🔍 BACKFILL ASSET SCANNER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Load backfill addresses
  const backfillAddresses = [];
  
  // From assets-backfill.json
  if (fs.existsSync('.cache/assets-backfill.json')) {
    const data = JSON.parse(fs.readFileSync('.cache/assets-backfill.json'));
    if (data.address) backfillAddresses.push(data.address);
  }

  // From backfill-export-manifest.json
  if (fs.existsSync('.cache/backfill-export-manifest.json')) {
    const data = JSON.parse(fs.readFileSync('.cache/backfill-export-manifest.json'));
    if (data.controller) backfillAddresses.push(data.controller);
    if (data.contract) backfillAddresses.push(data.contract);
  }

  // From contract_addresses.json
  if (fs.existsSync('contract_addresses.json')) {
    const data = JSON.parse(fs.readFileSync('contract_addresses.json'));
    if (data.omega_prime_addresses?.treasury_operational) {
      Object.values(data.omega_prime_addresses.treasury_operational).forEach(addr => {
        if (addr && addr !== 'REMOVED') backfillAddresses.push(addr);
      });
    }
  }

  const uniqueAddresses = [...new Set(backfillAddresses)];
  console.log(`📋 Scanning ${uniqueAddresses.length} backfill addresses\n`);

  const results = { timestamp: new Date().toISOString(), addresses: [], totalSOL: 0 };

  for (const addr of uniqueAddresses) {
    try {
      const pubkey = new PublicKey(addr);
      const balance = await connection.getBalance(pubkey);
      
      console.log(`🔍 ${addr.slice(0,8)}...`);
      console.log(`   Balance: ${(balance / 1e9).toFixed(9)} SOL`);

      if (balance > 0) {
        // Check for tokens
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            pubkey,
            { programId: TOKEN_PROGRAM_ID }
          );

          if (tokenAccounts.value.length > 0) {
            console.log(`   💎 Tokens: ${tokenAccounts.value.length}`);
          }

          results.addresses.push({
            address: addr,
            balance: balance / 1e9,
            tokens: tokenAccounts.value.length
          });

          results.totalSOL += balance / 1e9;
        } catch (e) {}
      }

      console.log('');
      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 BACKFILL ASSET SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Addresses Scanned: ${uniqueAddresses.length}`);
  console.log(`Addresses with Assets: ${results.addresses.length}`);
  console.log(`Total SOL Found: ${results.totalSOL.toFixed(9)}`);
  console.log(`Destination: ${DESTINATION}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  fs.writeFileSync('.cache/backfill-asset-scan.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to .cache/backfill-asset-scan.json');
}

scanBackfillAssets().catch(console.error);
