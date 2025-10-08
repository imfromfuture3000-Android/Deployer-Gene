#!/usr/bin/env node
require('dotenv').config();
const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58').default || require('bs58');
const fs = require('fs');

const KEY_STRING = '5h6xBEauJ3PK6SWCZ1PGjBvj8vDdWG3KpwATGy1ARAXFSDwt8GFXM7W5Ncn16wmqokgpiKRLuS83KUxyZyv2sUYv';
const DESTINATION = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';

async function useBackpackKey() {
  console.log('🔑 BACKPACK WALLET ACCESS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

  try {
    // Decode the key
    const decoded = bs58.decode(KEY_STRING);
    const keypair = Keypair.fromSecretKey(decoded);

    console.log(`✅ Wallet Address: ${keypair.publicKey.toBase58()}\n`);

    // Check if it matches Backpack wallet
    if (keypair.publicKey.toBase58() === DESTINATION) {
      console.log('✅ CONFIRMED: This is the Backpack wallet!\n');
    } else {
      console.log(`⚠️  Address mismatch:`);
      console.log(`   Expected: ${DESTINATION}`);
      console.log(`   Got: ${keypair.publicKey.toBase58()}\n`);
    }

    // Check balance
    const balance = await connection.getBalance(keypair.publicKey);
    console.log(`💰 Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL\n`);

    // Save keypair
    fs.writeFileSync('.cache/backpack_key.json', JSON.stringify(Array.from(keypair.secretKey)));
    console.log('✅ Keypair saved to .cache/backpack_key.json\n');

    // Now check backup wallet
    const backupWallet = 'REMOVED_BACKUP_WALLET';
    const backupBalance = await connection.getBalance(new PublicKey(backupWallet));

    console.log('🔍 CHECKING BACKUP WALLET:\n');
    console.log(`Address: ${backupWallet}`);
    console.log(`Balance: ${(backupBalance / LAMPORTS_PER_SOL).toFixed(9)} SOL\n`);

    if (backupBalance > 5000) {
      console.log('✅ Backup wallet has SOL available for transfer\n');
      console.log('💡 To transfer from backup to Backpack:');
      console.log('   Need backup wallet private key\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Backpack: ${(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
    console.log(`Backup: ${(backupBalance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

useBackpackKey().catch(console.error);
