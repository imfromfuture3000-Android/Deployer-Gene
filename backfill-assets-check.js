#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

const DEPLOYER = process.env.DEPLOYER_ADDRESS || 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
const RPC_URL = 'https://api.mainnet-beta.solana.com';

function rpcCall(method, params = []) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(RPC_URL, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result.result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function checkAssets() {
  console.log('🔍 BACKFILL ASSETS CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 Address:', DEPLOYER);

  const assets = {
    sol: 0,
    tokens: [],
    nfts: [],
    programs: []
  };

  try {
    // Check SOL balance
    const balance = await rpcCall('getBalance', [DEPLOYER]);
    assets.sol = balance / 1e9;
    console.log('💰 SOL Balance:', assets.sol.toFixed(4));

    // Check token accounts
    const tokenAccounts = await rpcCall('getTokenAccountsByOwner', [
      DEPLOYER,
      { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }
    ]);

    if (tokenAccounts?.value) {
      console.log('🪙 Token Accounts:', tokenAccounts.value.length);
      
      for (const account of tokenAccounts.value.slice(0, 10)) {
        const info = account.account.data.parsed.info;
        assets.tokens.push({
          mint: info.mint,
          amount: info.tokenAmount.uiAmount,
          decimals: info.tokenAmount.decimals
        });
      }
    }

    // Check for program accounts
    const programAccounts = await rpcCall('getProgramAccounts', [
      'BPFLoaderUpgradeab1e11111111111111111111111',
      {
        filters: [
          { memcmp: { offset: 13, bytes: DEPLOYER } }
        ]
      }
    ]);

    if (programAccounts) {
      assets.programs = programAccounts.map(acc => acc.pubkey);
      console.log('📦 Programs Owned:', assets.programs.length);
    }

    // Check recent transactions
    const signatures = await rpcCall('getSignaturesForAddress', [DEPLOYER, { limit: 5 }]);
    console.log('📝 Recent Transactions:', signatures?.length || 0);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Save results
  if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
  
  fs.writeFileSync('.cache/assets-backfill.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    address: DEPLOYER,
    assets,
    summary: {
      sol: assets.sol,
      tokenCount: assets.tokens.length,
      programCount: assets.programs.length
    }
  }, null, 2));

  console.log('✅ Assets saved to .cache/assets-backfill.json');
  
  return assets;
}

checkAssets();