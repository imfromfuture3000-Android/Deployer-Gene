#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

async function quicknodeBackfill() {
  const cacheFile = '.cache/quicknode-backfill.json';
  const cached = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile)) : {};
  
  const rpcUrl = process.env.QUICKNODE_RPC || cached.rpcEndpoint || process.env.RPC_URL;
  const deployer = cached.deployer || process.env.TREASURY_PUBKEY;

  console.log('🔍 QUICKNODE BACKFILL SCANNER');
  console.log(`📡 RPC: ${rpcUrl}`);
  console.log(`👤 Deployer: ${deployer}\n`);

  const connection = new Connection(rpcUrl, 'confirmed');
  const pubkey = new PublicKey(deployer);

  const results = {
    timestamp: new Date().toISOString(),
    deployer,
    rpcEndpoint: rpcUrl,
    assets: { sol: null, programs: [], tokens: [], stakes: [], votes: [], nfts: [] },
    summary: { totalSOL: null, totalPrograms: 0, totalTokens: 0, totalStakes: 0, totalVotes: 0, totalNFTs: 0, totalAssets: 0 }
  };

  try {
    const balance = await connection.getBalance(pubkey);
    results.assets.sol = balance / 1e9;
    results.summary.totalSOL = balance / 1e9;
    console.log(`💰 SOL Balance: ${results.assets.sol}`);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID });
    results.assets.tokens = tokenAccounts.value.map(t => ({
      mint: t.account.data.parsed.info.mint,
      amount: t.account.data.parsed.info.tokenAmount.uiAmount
    })).filter(t => t.amount > 0);
    results.summary.totalTokens = results.assets.tokens.length;
    console.log(`🪙 Token Accounts: ${results.summary.totalTokens}`);

    results.summary.totalAssets = results.summary.totalTokens + (results.assets.sol > 0 ? 1 : 0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  fs.writeFileSync(cacheFile, JSON.stringify(results, null, 2));
  console.log(`\n✅ Saved to ${cacheFile}`);
}

quicknodeBackfill().catch(console.error);
