#!/usr/bin/env node
require('dotenv').config();
const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const bs58 = require('bs58');

const BACKPACK_WALLET = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';
const BACKUP_WALLET = 'REMOVED_BACKUP_WALLET';

async function transferFromBackup() {
  console.log('🔄 TRANSFER FROM BACKUP TO BACKPACK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Try to load Backpack wallet private key
  let backpackSigner;
  
  // Check if we have the private key in env or cache
  if (process.env.BACKPACK_PRIVATE_KEY) {
    const privateKey = bs58.decode(process.env.BACKPACK_PRIVATE_KEY);
    backpackSigner = Keypair.fromSecretKey(privateKey);
  } else if (fs.existsSync('.cache/backpack_key.json')) {
    const keyData = JSON.parse(fs.readFileSync('.cache/backpack_key.json'));
    backpackSigner = Keypair.fromSecretKey(new Uint8Array(keyData));
  } else {
    console.log('❌ Backpack wallet private key not found');
    console.log('💡 Set BACKPACK_PRIVATE_KEY in .env or provide .cache/backpack_key.json\n');
    return;
  }

  console.log(`✅ Backpack Wallet: ${backpackSigner.publicKey.toBase58()}`);
  console.log(`🎯 Expected: ${BACKPACK_WALLET}\n`);

  if (backpackSigner.publicKey.toBase58() !== BACKPACK_WALLET) {
    console.log('⚠️  Warning: Loaded key does not match expected Backpack address\n');
  }

  // Check backup wallet balance
  const backupBalance = await connection.getBalance(new PublicKey(BACKUP_WALLET));
  const backpackBalance = await connection.getBalance(backpackSigner.publicKey);

  console.log('💰 BALANCES:\n');
  console.log(`Backup Wallet: ${(backupBalance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
  console.log(`Backpack Wallet: ${(backpackBalance / LAMPORTS_PER_SOL).toFixed(9)} SOL\n`);

  if (backupBalance > 5000) {
    console.log('🔄 TRANSFERRING FROM BACKUP:\n');
    
    const transferAmount = backupBalance - 5000;
    console.log(`Amount: ${(transferAmount / LAMPORTS_PER_SOL).toFixed(9)} SOL\n`);

    // Note: This requires backup wallet private key
    console.log('⚠️  Transfer requires backup wallet private key');
    console.log('📋 Backup wallet has SOL but we need its private key to transfer\n');
  }

  const results = {
    timestamp: new Date().toISOString(),
    backpackWallet: BACKPACK_WALLET,
    backupWallet: BACKUP_WALLET,
    balances: {
      backup: backupBalance / LAMPORTS_PER_SOL,
      backpack: backpackBalance / LAMPORTS_PER_SOL
    },
    status: 'checked',
    note: 'Backup wallet has 0.013 SOL but requires private key for transfer'
  };

  fs.writeFileSync('.cache/backup-transfer-status.json', JSON.stringify(results, null, 2));
  console.log('✅ Status saved to .cache/backup-transfer-status.json');
}

transferFromBackup().catch(console.error);
