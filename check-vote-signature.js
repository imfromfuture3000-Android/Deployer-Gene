#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');

const SIGNATURE = '5h6xBEauJ3PK6SWCZ1PGjBvj8vDdWG3KpwATGy1ARAXFSDwt8GFXM7W5Ncn16wmqokgpiKRLuS83KUxyZyv2sUYv';
const VOTE_PROGRAM = 'Vote111111111111111111111111111111111111111';

async function checkVoteSignature() {
  console.log('🗳️  VOTE SIGNATURE CHECKER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

  console.log(`📝 Signature: ${SIGNATURE}\n`);

  try {
    // Get transaction details
    console.log('🔍 Fetching transaction...\n');
    const tx = await connection.getTransaction(SIGNATURE, {
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      console.log('❌ Transaction not found\n');
      return;
    }

    console.log('✅ TRANSACTION FOUND\n');
    console.log('📊 DETAILS:\n');
    console.log(`Block Time: ${new Date(tx.blockTime * 1000).toISOString()}`);
    console.log(`Slot: ${tx.slot}`);
    console.log(`Fee: ${tx.meta.fee / 1e9} SOL\n`);

    // Get signers
    console.log('✍️  SIGNERS:\n');
    const message = tx.transaction.message;
    const accountKeys = message.staticAccountKeys || message.accountKeys;
    
    accountKeys.forEach((key, i) => {
      console.log(`${i + 1}. ${key.toBase58()}`);
    });

    console.log('\n🔑 PRIMARY SIGNER (Fee Payer):\n');
    const feePayer = accountKeys[0];
    console.log(`Address: ${feePayer.toBase58()}`);

    // Check if this is our Backpack wallet
    const backpackWallet = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';
    if (feePayer.toBase58() === backpackWallet) {
      console.log('✅ This is the Backpack wallet!\n');
    }

    // Get balance
    const balance = await connection.getBalance(feePayer);
    console.log(`Balance: ${(balance / 1e9).toFixed(9)} SOL\n`);

    // Check if vote-related
    const isVote = accountKeys.some(key => key.toBase58() === VOTE_PROGRAM);
    console.log(`🗳️  Vote Transaction: ${isVote ? 'YES' : 'NO'}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 EXPLORER LINKS:');
    console.log(`   https://explorer.solana.com/tx/${SIGNATURE}`);
    console.log(`   https://solscan.io/tx/${SIGNATURE}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const results = {
      signature: SIGNATURE,
      feePayer: feePayer.toBase58(),
      balance: balance / 1e9,
      blockTime: new Date(tx.blockTime * 1000).toISOString(),
      slot: tx.slot,
      fee: tx.meta.fee / 1e9,
      isVote,
      accounts: accountKeys.map(k => k.toBase58())
    };

    require('fs').writeFileSync('.cache/vote-signature-check.json', JSON.stringify(results, null, 2));
    console.log('\n✅ Results saved to .cache/vote-signature-check.json');

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

checkVoteSignature().catch(console.error);
