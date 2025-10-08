#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const BACKFILL_ADDRESS = '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y';

async function getBackfillTokens() {
  console.log('💎 BACKFILL TOKEN DETAILS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

  console.log(`📍 Address: ${BACKFILL_ADDRESS}\n`);

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    new PublicKey(BACKFILL_ADDRESS),
    { programId: TOKEN_PROGRAM_ID }
  );

  console.log(`💎 Total Token Accounts: ${tokenAccounts.value.length}\n`);

  const tokens = [];

  tokenAccounts.value.forEach((account, i) => {
    const data = account.account.data.parsed.info;
    const amount = data.tokenAmount.uiAmount;
    
    if (amount > 0) {
      console.log(`${i + 1}. ${data.mint.slice(0,8)}...`);
      console.log(`   Amount: ${amount}`);
      console.log(`   Decimals: ${data.tokenAmount.decimals}`);
      console.log(`   Account: ${account.pubkey.toBase58().slice(0,8)}...\n`);
      
      tokens.push({
        mint: data.mint,
        amount,
        decimals: data.tokenAmount.decimals,
        tokenAccount: account.pubkey.toBase58()
      });
    }
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Accounts: ${tokenAccounts.value.length}`);
  console.log(`Accounts with Balance: ${tokens.length}`);
  console.log(`SOL Balance: 0.111274966`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const results = {
    timestamp: new Date().toISOString(),
    address: BACKFILL_ADDRESS,
    solBalance: 0.111274966,
    totalTokenAccounts: tokenAccounts.value.length,
    tokensWithBalance: tokens.length,
    tokens
  };

  require('fs').writeFileSync('.cache/backfill-tokens.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Token details saved to .cache/backfill-tokens.json');
}

getBackfillTokens().catch(console.error);
