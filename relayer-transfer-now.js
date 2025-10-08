#!/usr/bin/env node
require('dotenv').config();
const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

async function relayerTransfer() {
  console.log('🔄 RELAYER TRANSFER SYSTEM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Load signer
  let signer;
  if (fs.existsSync('.cache/user_auth.json')) {
    const keyData = JSON.parse(fs.readFileSync('.cache/user_auth.json'));
    signer = Keypair.fromSecretKey(new Uint8Array(keyData));
  } else {
    console.log('❌ No signer found');
    return;
  }

  // Main and backup wallets
  const mainWallet = process.env.TREASURY_PUBKEY || 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6';
  const backupWallet = process.env.SECONDARY_WALLET || 'REMOVED_BACKUP_WALLET';
  
  console.log('📍 WALLET CONFIGURATION:\n');
  console.log(`✍️  Signer: ${signer.publicKey.toBase58()}`);
  console.log(`💰 Main Wallet: ${mainWallet}`);
  console.log(`🔄 Backup Wallet: ${backupWallet}\n`);

  // Check balances
  console.log('💰 CHECKING BALANCES:\n');
  
  const signerBalance = await connection.getBalance(signer.publicKey);
  const mainBalance = await connection.getBalance(new PublicKey(mainWallet));
  const backupBalance = await connection.getBalance(new PublicKey(backupWallet));

  console.log(`Signer: ${(signerBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
  console.log(`Main: ${(mainBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
  console.log(`Backup: ${(backupBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL\n`);

  const results = {
    timestamp: new Date().toISOString(),
    signer: signer.publicKey.toBase58(),
    mainWallet,
    backupWallet,
    balances: {
      signer: signerBalance / LAMPORTS_PER_SOL,
      main: mainBalance / LAMPORTS_PER_SOL,
      backup: backupBalance / LAMPORTS_PER_SOL
    },
    transfers: []
  };

  // Check if signer has balance to transfer
  if (signerBalance > 5000) {
    console.log('🔄 INITIATING TRANSFER:\n');
    
    const transferAmount = signerBalance - 5000; // Keep 5000 lamports for rent
    
    console.log(`📤 Transferring ${(transferAmount / LAMPORTS_PER_SOL).toFixed(4)} SOL to main wallet...`);
    
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: signer.publicKey,
          toPubkey: new PublicKey(mainWallet),
          lamports: transferAmount
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = signer.publicKey;

      transaction.sign(signer);

      const signature = await connection.sendRawTransaction(transaction.serialize());
      await connection.confirmTransaction(signature);

      console.log(`✅ Transfer complete!`);
      console.log(`🔗 Signature: ${signature}`);
      console.log(`🔗 Explorer: https://explorer.solana.com/tx/${signature}\n`);

      results.transfers.push({
        from: signer.publicKey.toBase58(),
        to: mainWallet,
        amount: transferAmount / LAMPORTS_PER_SOL,
        signature,
        status: 'success'
      });

    } catch (error) {
      console.log(`❌ Transfer failed: ${error.message}\n`);
      results.transfers.push({
        from: signer.publicKey.toBase58(),
        to: mainWallet,
        error: error.message,
        status: 'failed'
      });
    }
  } else {
    console.log('⚠️  Signer balance too low for transfer (< 0.000005 SOL)\n');
  }

  // Check token accounts
  console.log('🪙 CHECKING TOKEN ACCOUNTS:\n');
  
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      signer.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    if (tokenAccounts.value.length > 0) {
      console.log(`Found ${tokenAccounts.value.length} token account(s):\n`);
      
      for (const account of tokenAccounts.value) {
        const tokenData = account.account.data.parsed.info;
        console.log(`Token: ${tokenData.mint}`);
        console.log(`Amount: ${tokenData.tokenAmount.uiAmount}`);
        console.log(`Decimals: ${tokenData.tokenAmount.decimals}\n`);
      }
    } else {
      console.log('No token accounts found\n');
    }
  } catch (e) {
    console.log(`⚠️  Token check: ${e.message}\n`);
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TRANSFER SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Transfers Completed: ${results.transfers.filter(t => t.status === 'success').length}`);
  console.log(`❌ Transfers Failed: ${results.transfers.filter(t => t.status === 'failed').length}`);
  console.log(`💰 Main Wallet Balance: ${results.balances.main.toFixed(4)} SOL`);
  console.log(`🔄 Backup Wallet Balance: ${results.balances.backup.toFixed(4)} SOL`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  fs.writeFileSync('.cache/transfer-results.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to .cache/transfer-results.json');
}

relayerTransfer().catch(console.error);
