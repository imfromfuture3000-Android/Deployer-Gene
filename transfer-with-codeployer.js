#!/usr/bin/env node
require('dotenv').config();
const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');

const DESTINATION = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';

async function transferWithCoDeployer() {
  console.log('🚀 CO-DEPLOYER TRANSFER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

  // Load co-deployer keypair
  const coDeployerData = JSON.parse(fs.readFileSync('.cache/deployer-keypair.json'));
  const coDeployer = Keypair.fromSecretKey(new Uint8Array(coDeployerData));

  console.log(`✍️  Co-Deployer: ${coDeployer.publicKey.toBase58()}`);
  console.log(`🎯 Destination: ${DESTINATION}\n`);

  const balance = await connection.getBalance(coDeployer.publicKey);
  console.log(`💰 Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL\n`);

  if (balance > 5000) {
    const transferAmount = balance - 5000;
    console.log(`🔄 Transferring ${(transferAmount / LAMPORTS_PER_SOL).toFixed(9)} SOL...\n`);

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: coDeployer.publicKey,
          toPubkey: new PublicKey(DESTINATION),
          lamports: transferAmount
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = coDeployer.publicKey;
      transaction.sign(coDeployer);

      const signature = await connection.sendRawTransaction(transaction.serialize());
      await connection.confirmTransaction(signature);

      console.log(`✅ TRANSFER COMPLETE!`);
      console.log(`🔗 Signature: ${signature}`);
      console.log(`🔗 Explorer: https://explorer.solana.com/tx/${signature}\n`);

      const results = {
        timestamp: new Date().toISOString(),
        from: coDeployer.publicKey.toBase58(),
        to: DESTINATION,
        amount: transferAmount / LAMPORTS_PER_SOL,
        signature,
        status: 'success'
      };

      fs.writeFileSync('.cache/codeployer-transfer.json', JSON.stringify(results, null, 2));

    } catch (error) {
      console.log(`❌ Transfer failed: ${error.message}\n`);
    }
  } else {
    console.log('⚠️  Insufficient balance for transfer\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

transferWithCoDeployer().catch(console.error);
