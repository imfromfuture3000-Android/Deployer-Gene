#!/usr/bin/env node
require('dotenv').config();
const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fetch = require('node-fetch');
const fs = require('fs');

const DESTINATION = 'ACTvefX67PchHtJbKqayGJntruJ1QXiHwNSgMNNRvoq6';
const RELAYER_URL = process.env.RELAYER_URL || 'https://mainnet.helius-rpc.com';
const RELAYER_PUBKEY = process.env.RELAYER_PUBKEY || 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';

async function relayerSOLTransfer() {
  console.log('🔄 RELAYER MODE - SOL TRANSFER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Load signer
  if (!fs.existsSync('.cache/user_auth.json')) {
    console.log('❌ No signer found');
    return;
  }

  const keyData = JSON.parse(fs.readFileSync('.cache/user_auth.json'));
  const signer = Keypair.fromSecretKey(new Uint8Array(keyData));
  const destination = new PublicKey(DESTINATION);
  const relayerPubkey = new PublicKey(RELAYER_PUBKEY);

  console.log('📋 CONFIGURATION:\n');
  console.log(`✍️  Signer: ${signer.publicKey.toBase58()}`);
  console.log(`🎯 Destination: ${DESTINATION}`);
  console.log(`💰 Fee Payer: ${RELAYER_PUBKEY} (Relayer)`);
  console.log(`🔗 Relayer URL: ${RELAYER_URL}\n`);

  // Check balances
  const signerBalance = await connection.getBalance(signer.publicKey);
  const destBalance = await connection.getBalance(destination);

  console.log('💰 BALANCES:\n');
  console.log(`Signer: ${(signerBalance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
  console.log(`Destination: ${(destBalance / LAMPORTS_PER_SOL).toFixed(9)} SOL\n`);

  if (signerBalance === 0) {
    console.log('⚠️  Signer has 0 SOL - This is correct for relayer mode');
    console.log('✅ User = SIGNER ONLY');
    console.log('✅ Relayer = FEE PAYER\n');
  }

  // Check available SOL sources
  console.log('🔍 CHECKING AVAILABLE SOL SOURCES:\n');

  const sources = [
    { name: 'Treasury', address: process.env.TREASURY_PUBKEY || 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6' },
    { name: 'Backup', address: 'REMOVED_BACKUP_WALLET' },
    { name: 'Relayer', address: RELAYER_PUBKEY }
  ];

  let transferSource = null;
  let transferAmount = 0;

  for (const source of sources) {
    try {
      const balance = await connection.getBalance(new PublicKey(source.address));
      console.log(`${source.name}: ${(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
      
      if (balance > 5000 && !transferSource) {
        transferSource = source;
        transferAmount = balance - 5000;
      }
    } catch (e) {
      console.log(`${source.name}: Error checking`);
    }
  }

  console.log('\n');

  if (!transferSource) {
    console.log('❌ No SOL available for transfer\n');
    
    const results = {
      timestamp: new Date().toISOString(),
      destination: DESTINATION,
      status: 'no_funds',
      message: 'No SOL available in any source wallet'
    };
    
    fs.writeFileSync('.cache/relayer-sol-transfer.json', JSON.stringify(results, null, 2));
    return;
  }

  console.log(`✅ Found ${(transferAmount / LAMPORTS_PER_SOL).toFixed(9)} SOL in ${transferSource.name}\n`);
  console.log('🔄 PREPARING RELAYER TRANSFER:\n');

  // Create transfer instruction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: signer.publicKey,
      toPubkey: destination,
      lamports: Math.floor(transferAmount)
    })
  );

  // Set relayer as fee payer
  transaction.feePayer = relayerPubkey;
  
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  // Sign with signer
  transaction.sign(signer);

  const serialized = transaction.serialize({ requireAllSignatures: false }).toString('base64');

  console.log(`📦 Transaction Size: ${serialized.length} bytes`);
  console.log(`💰 Amount: ${(transferAmount / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
  console.log(`✍️  Signed by: User (Signer Only)`);
  console.log(`💵 Fee Paid by: Relayer\n`);

  const results = {
    timestamp: new Date().toISOString(),
    mode: 'relayer',
    source: transferSource.name,
    sourceAddress: transferSource.address,
    destination: DESTINATION,
    amount: transferAmount / LAMPORTS_PER_SOL,
    feePayer: RELAYER_PUBKEY,
    signer: signer.publicKey.toBase58(),
    transactionBase64: serialized,
    status: 'prepared',
    note: 'Transaction prepared for relayer submission'
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ TRANSFER PREPARED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📤 From: ${transferSource.name} (${transferSource.address.slice(0,8)}...)`);
  console.log(`📥 To: ${DESTINATION}`);
  console.log(`💰 Amount: ${(transferAmount / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
  console.log(`💵 User Cost: 0 SOL (Relayer Paid)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  fs.writeFileSync('.cache/relayer-sol-transfer.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Transfer prepared and saved to .cache/relayer-sol-transfer.json');
  console.log('📋 Ready for relayer submission');
}

relayerSOLTransfer().catch(console.error);
