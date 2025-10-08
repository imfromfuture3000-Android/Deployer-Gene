#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

async function checkBackpack() {
  console.log('🎒 BACKPACK WALLET CHECKER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  const backpackAddress = 'ACTvefX5o1hXbE9JNYFRGJyWjv3FyBjVvvZ3HedBUxx';

  console.log(`📍 Address: ${backpackAddress}\n`);

  try {
    // Check SOL balance
    const balance = await connection.getBalance(new PublicKey(backpackAddress));
    console.log('💰 SOL BALANCE:');
    console.log(`   ${(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL\n`);

    // Check token accounts
    console.log('🪙 TOKEN ACCOUNTS:\n');
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(backpackAddress),
      { programId: TOKEN_PROGRAM_ID }
    );

    if (tokenAccounts.value.length > 0) {
      console.log(`Found ${tokenAccounts.value.length} token(s):\n`);
      
      tokenAccounts.value.forEach((account, i) => {
        const data = account.account.data.parsed.info;
        console.log(`${i + 1}. Token Account: ${account.pubkey.toBase58()}`);
        console.log(`   Mint: ${data.mint}`);
        console.log(`   Amount: ${data.tokenAmount.uiAmount}`);
        console.log(`   Decimals: ${data.tokenAmount.decimals}\n`);
      });
    } else {
      console.log('No token accounts found\n');
    }

    // Get account info
    const accountInfo = await connection.getAccountInfo(new PublicKey(backpackAddress));
    if (accountInfo) {
      console.log('📊 ACCOUNT INFO:');
      console.log(`   Owner: ${accountInfo.owner.toBase58()}`);
      console.log(`   Executable: ${accountInfo.executable}`);
      console.log(`   Rent Epoch: ${accountInfo.rentEpoch}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 EXPLORER LINKS:');
    console.log(`   Solana: https://explorer.solana.com/address/${backpackAddress}`);
    console.log(`   Solscan: https://solscan.io/account/${backpackAddress}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

checkBackpack().catch(console.error);
