#!/usr/bin/env node

/**
 * 🚀 RELAYER DEPLOYMENT - You sign, relayer pays
 */

const { Connection, Keypair, Transaction, SystemProgram, PublicKey } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, MINT_SIZE } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployWithRelayer() {
  console.log('🚀 RELAYER DEPLOYMENT - SIGNER ONLY MODE');
  console.log('='.repeat(60));
  
  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY || '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
  
  console.log(`\n💰 Relayer (payer): ${relayerPubkey.toBase58()}`);
  console.log('✅ Relayer pays all fees - you only sign');
  
  const cacheDir = path.join(process.cwd(), '.cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  
  // Load or create mint keypair
  const mintKeypairPath = path.join(cacheDir, 'mint-keypair.json');
  let mintKeypair;
  
  if (fs.existsSync(mintKeypairPath)) {
    const data = JSON.parse(fs.readFileSync(mintKeypairPath, 'utf-8'));
    mintKeypair = Keypair.fromSecretKey(Uint8Array.from(data));
    console.log(`\n📍 Using existing mint: ${mintKeypair.publicKey.toBase58()}`);
  } else {
    mintKeypair = Keypair.generate();
    fs.writeFileSync(mintKeypairPath, JSON.stringify(Array.from(mintKeypair.secretKey)));
    console.log(`\n📍 Generated new mint: ${mintKeypair.publicKey.toBase58()}`);
  }
  
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY || 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  
  // Get rent exemption amount
  const rentExempt = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  console.log(`\n💵 Rent: ${rentExempt / 1e9} SOL (relayer pays)`);
  
  // Build transaction
  const tx = new Transaction();
  
  // Create account (relayer pays)
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: relayerPubkey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: rentExempt,
      programId: TOKEN_2022_PROGRAM_ID
    })
  );
  
  // Initialize mint
  tx.add(
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      9,
      treasuryPubkey,
      treasuryPubkey,
      TOKEN_2022_PROGRAM_ID
    )
  );
  
  // Set relayer as fee payer
  tx.feePayer = relayerPubkey;
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  
  console.log('\n📝 Signing with mint keypair only...');
  tx.partialSign(mintKeypair);
  
  // Serialize for relayer
  const serialized = tx.serialize({ requireAllSignatures: false });
  const base64Tx = serialized.toString('base64');
  
  console.log('\n📤 Sending to relayer...');
  console.log(`   Relayer URL: ${process.env.RELAYER_URL || 'Not configured'}`);
  
  // Send to relayer
  const relayerUrl = process.env.RELAYER_URL;
  if (!relayerUrl || relayerUrl.includes('octane')) {
    console.log('\n⚠️  Relayer URL not configured or using default');
    console.log('💡 Transaction prepared but not sent');
    console.log(`\n📦 Serialized TX (base64):\n${base64Tx.substring(0, 100)}...`);
    console.log('\n✅ Transaction ready for relayer submission');
    
    fs.writeFileSync(path.join(cacheDir, 'mint.json'), JSON.stringify({ 
      mint: mintKeypair.publicKey.toBase58(),
      status: 'prepared',
      note: 'Configure RELAYER_URL to submit'
    }));
    
    return;
  }
  
  const response = await fetch(relayerUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(process.env.RELAYER_API_KEY && { 'Authorization': `Bearer ${process.env.RELAYER_API_KEY}` })
    },
    body: JSON.stringify({ transaction: base64Tx })
  });
  
  if (!response.ok) {
    throw new Error(`Relayer error: ${response.status} ${await response.text()}`);
  }
  
  const result = await response.json();
  const signature = result.signature || result.txid || result.result;
  
  console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
  console.log('='.repeat(60));
  console.log(`📍 Mint: ${mintKeypair.publicKey.toBase58()}`);
  console.log(`📝 TX: ${signature}`);
  console.log(`🔗 Explorer: https://explorer.solana.com/tx/${signature}`);
  console.log('\n💡 Relayer paid all fees - you only signed!');
  
  fs.writeFileSync(path.join(cacheDir, 'mint.json'), JSON.stringify({ 
    mint: mintKeypair.publicKey.toBase58(),
    signature,
    relayer: relayerPubkey.toBase58()
  }));
}

deployWithRelayer().catch(e => {
  console.error('\n❌ Failed:', e.message);
  process.exit(1);
});
