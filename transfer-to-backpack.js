#!/usr/bin/env node
require('dotenv').config();
const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

const DESTINATION = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';

async function transferToBackpack() {
  console.log('🎒 TRANSFER TO BACKPACK WALLET');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Load signer
  if (!fs.existsSync('.cache/user_auth.json')) {
    console.log('❌ No signer keypair found');
    return;
  }

  const keyData = JSON.parse(fs.readFileSync('.cache/user_auth.json'));
  const signer = Keypair.fromSecretKey(new Uint8Array(keyData));
  const destination = new PublicKey(DESTINATION);

  console.log(`✍️  From: ${signer.publicKey.toBase58()}`);
  console.log(`🎯 To: ${DESTINATION}\n`);

  // Check balances
  const signerBalance = await connection.getBalance(signer.publicKey);
  const destBalance = await connection.getBalance(destination);

  console.log('💰 BALANCES:\n');
  console.log(`Signer: ${(signerBalance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
  console.log(`Destination: ${(destBalance / LAMPORTS_PER_SOL).toFixed(9)} SOL\n`);

  const results = {
    timestamp: new Date().toISOString(),
    from: signer.publicKey.toBase58(),
    to: DESTINATION,
    transfers: []
  };

  // Transfer SOL if available
  if (signerBalance > 5000) {
    console.log('🔄 TRANSFERRING SOL:\n');
    
    const transferAmount = signerBalance - 5000;
    console.log(`Amount: ${(transferAmount / LAMPORTS_PER_SOL).toFixed(9)} SOL`);

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: signer.publicKey,
          toPubkey: destination,
          lamports: transferAmount
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = signer.publicKey;
      transaction.sign(signer);

      const signature = await connection.sendRawTransaction(transaction.serialize());
      await connection.confirmTransaction(signature);

      console.log(`✅ SOL Transfer Complete`);
      console.log(`🔗 Signature: ${signature}`);
      console.log(`🔗 Explorer: https://explorer.solana.com/tx/${signature}\n`);

      results.transfers.push({
        type: 'SOL',
        amount: transferAmount / LAMPORTS_PER_SOL,
        signature,
        status: 'success'
      });

    } catch (error) {
      console.log(`❌ Transfer failed: ${error.message}\n`);
      results.transfers.push({ type: 'SOL', error: error.message, status: 'failed' });
    }
  } else {
    console.log('⚠️  Insufficient SOL balance for transfer\n');
  }

  // Check for tokens
  console.log('🪙 CHECKING TOKENS:\n');
  
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      signer.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    if (tokenAccounts.value.length > 0) {
      console.log(`Found ${tokenAccounts.value.length} token account(s)\n`);
      
      for (const account of tokenAccounts.value) {
        const tokenData = account.account.data.parsed.info;
        const amount = tokenData.tokenAmount.uiAmount;
        
        if (amount > 0) {
          console.log(`Token: ${tokenData.mint}`);
          console.log(`Amount: ${amount}\n`);
        }
      }
    } else {
      console.log('No tokens found\n');
    }
  } catch (e) {
    console.log(`⚠️  ${e.message}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Successful: ${results.transfers.filter(t => t.status === 'success').length}`);
  console.log(`❌ Failed: ${results.transfers.filter(t => t.status === 'failed').length}`);
  console.log(`🎯 Destination: ${DESTINATION}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  fs.writeFileSync('.cache/backpack-transfer.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to .cache/backpack-transfer.json');
}

transferToBackpack().catch(console.error);
