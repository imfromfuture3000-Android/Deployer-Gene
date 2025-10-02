#!/usr/bin/env node

/**
 * 🚀 DEVNET DEPLOYMENT - Instant testing with airdrop
 */

const { Connection, Keypair, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, MINT_SIZE, getMinimumBalanceForRentExemptMint } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

async function deployDevnet() {
  console.log('🚀 DEVNET DEPLOYMENT - INSTANT TESTING');
  console.log('='.repeat(60));
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  const cacheDir = path.join(process.cwd(), '.cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  
  const payerPath = path.join(cacheDir, 'devnet-payer.json');
  let payer;
  
  if (fs.existsSync(payerPath)) {
    payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, 'utf-8'))));
  } else {
    payer = Keypair.generate();
    fs.writeFileSync(payerPath, JSON.stringify(Array.from(payer.secretKey)));
  }
  
  console.log(`\n💰 Payer: ${payer.publicKey.toBase58()}`);
  
  // Airdrop SOL
  console.log('💧 Requesting airdrop...');
  const airdropSig = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropSig);
  
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`✅ Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  
  // Generate mint
  const mintKeypair = Keypair.generate();
  console.log(`\n📍 Mint: ${mintKeypair.publicKey.toBase58()}`);
  
  const treasuryPubkey = payer.publicKey; // Use payer as treasury for testing
  const rentExempt = await getMinimumBalanceForRentExemptMint(connection);
  
  const tx = new Transaction();
  
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: rentExempt,
      programId: TOKEN_2022_PROGRAM_ID
    })
  );
  
  tx.add(
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      9,
      treasuryPubkey,
      treasuryPubkey,
      TOKEN_2022_PROGRAM_ID
    )
  );
  
  tx.feePayer = payer.publicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  
  console.log('\n📝 Signing...');
  tx.sign(payer, mintKeypair);
  
  console.log('📤 Sending...');
  const sig = await connection.sendRawTransaction(tx.serialize());
  
  console.log('⏳ Confirming...');
  await connection.confirmTransaction(sig);
  
  fs.writeFileSync(path.join(cacheDir, 'devnet-mint.json'), JSON.stringify({
    mint: mintKeypair.publicKey.toBase58(),
    network: 'devnet',
    signature: sig
  }));
  
  console.log('\n✅ DEVNET DEPLOYMENT SUCCESSFUL!');
  console.log('='.repeat(60));
  console.log(`📍 Mint: ${mintKeypair.publicKey.toBase58()}`);
  console.log(`🔗 Explorer: https://explorer.solana.com/address/${mintKeypair.publicKey.toBase58()}?cluster=devnet`);
  console.log(`📝 TX: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  console.log('\n💡 This is a DEVNET deployment for testing');
  console.log('💡 For MAINNET, fund: 6fKgdNkR23ockagCAP4QbxrRdwvvVRDVCLYhG4WbwxKu');
}

deployDevnet().catch(e => {
  console.error('\n❌ Failed:', e.message);
  process.exit(1);
});
