#!/usr/bin/env node

const { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');

async function executeRealTransfer() {
  console.log('⚡ EXECUTING REAL MAINNET TRANSFER');
  console.log('==================================');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

  // Load private key
  const deployerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('.cache/user_auth.json', 'utf-8')))
  );

  const backfill = new PublicKey('8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y');
  const target = new PublicKey('4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a');

  console.log('📍 Addresses:');
  console.log(`   From: ${backfill.toBase58()}`);
  console.log(`   To: ${target.toBase58()}`);
  console.log(`   Signer: ${deployerKeypair.publicKey.toBase58()}`);

  // Get balance
  const balance = await connection.getBalance(backfill);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  
  console.log(`\n💰 Balance: ${balanceSOL} SOL`);

  // Transfer amount (leave rent)
  const rentExempt = 0.001 * LAMPORTS_PER_SOL;
  const transferAmount = balance - rentExempt;

  console.log(`📤 Transferring: ${transferAmount / LAMPORTS_PER_SOL} SOL`);

  // Create transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: backfill,
      toPubkey: target,
      lamports: transferAmount
    })
  );

  const { blockhash } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = deployerKeypair.publicKey;

  // Sign
  transaction.sign(deployerKeypair);

  console.log('\n🚀 Sending transaction...');

  try {
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature);

    console.log('\n✅ TRANSFER SUCCESSFUL!');
    console.log(`   TX Hash: ${signature}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${signature}`);

    // Log
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'real-mainnet-transfer',
      signature,
      from: backfill.toBase58(),
      to: target.toBase58(),
      amount: transferAmount / LAMPORTS_PER_SOL
    };

    let log = [];
    if (fs.existsSync('.cache/deployment-log.json')) {
      log = JSON.parse(fs.readFileSync('.cache/deployment-log.json', 'utf-8'));
    }
    log.push(logEntry);
    fs.writeFileSync('.cache/deployment-log.json', JSON.stringify(log, null, 2));

  } catch (error) {
    console.error('\n❌ Transfer failed:', error.message);
  }
}

executeRealTransfer().catch(console.error);