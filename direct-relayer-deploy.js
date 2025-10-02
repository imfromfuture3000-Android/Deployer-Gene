#!/usr/bin/env node

/**
 * 🚀 DIRECT RELAYER - Submit via sendTransaction (relayer pays)
 */

const { Connection, Keypair, Transaction, SystemProgram, PublicKey, sendAndConfirmTransaction } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, MINT_SIZE } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function directRelayerDeploy() {
  console.log('🚀 DIRECT RELAYER DEPLOYMENT');
  console.log('='.repeat(60));
  
  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Use relayer as payer
  const relayerKeypairPath = path.join(process.cwd(), '.cache', 'relayer-keypair.json');
  let relayerKeypair;
  
  if (fs.existsSync(relayerKeypairPath)) {
    const data = JSON.parse(fs.readFileSync(relayerKeypairPath, 'utf-8'));
    relayerKeypair = Keypair.fromSecretKey(Uint8Array.from(data));
  } else {
    relayerKeypair = Keypair.generate();
    fs.mkdirSync(path.dirname(relayerKeypairPath), { recursive: true });
    fs.writeFileSync(relayerKeypairPath, JSON.stringify(Array.from(relayerKeypair.secretKey)));
    console.log(`\n💰 Generated relayer: ${relayerKeypair.publicKey.toBase58()}`);
    console.log('⚠️  Fund this address to act as relayer/payer');
    
    const balance = await connection.getBalance(relayerKeypair.publicKey);
    if (balance === 0) {
      console.log('\n❌ Relayer has 0 SOL. Fund it first!');
      process.exit(0);
    }
  }
  
  const balance = await connection.getBalance(relayerKeypair.publicKey);
  console.log(`\n💰 Relayer: ${relayerKeypair.publicKey.toBase58()}`);
  console.log(`💵 Balance: ${balance / 1e9} SOL`);
  
  if (balance < 0.01e9) {
    console.log('\n❌ Insufficient balance. Need 0.01+ SOL');
    process.exit(1);
  }
  
  // Load mint keypair (signer)
  const mintKeypairPath = path.join(process.cwd(), '.cache', 'mint-keypair.json');
  let mintKeypair;
  
  if (fs.existsSync(mintKeypairPath)) {
    const data = JSON.parse(fs.readFileSync(mintKeypairPath, 'utf-8'));
    mintKeypair = Keypair.fromSecretKey(Uint8Array.from(data));
  } else {
    mintKeypair = Keypair.generate();
    fs.writeFileSync(mintKeypairPath, JSON.stringify(Array.from(mintKeypair.secretKey)));
  }
  
  console.log(`📍 Mint: ${mintKeypair.publicKey.toBase58()}`);
  
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY || 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  const rentExempt = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  
  const tx = new Transaction();
  
  // Create account (relayer pays)
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: relayerKeypair.publicKey,
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
  
  console.log('\n📝 Signing...');
  console.log('   Relayer signs as payer');
  console.log('   Mint signs as new account');
  
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [relayerKeypair, mintKeypair],
    { commitment: 'confirmed' }
  );
  
  console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
  console.log('='.repeat(60));
  console.log(`📍 Mint: ${mintKeypair.publicKey.toBase58()}`);
  console.log(`📝 TX: ${signature}`);
  console.log(`🔗 Explorer: https://explorer.solana.com/tx/${signature}`);
  console.log(`\n💰 Relayer paid: ~${rentExempt / 1e9} SOL + fees`);
  
  fs.writeFileSync(path.join(process.cwd(), '.cache', 'mint.json'), JSON.stringify({ 
    mint: mintKeypair.publicKey.toBase58(),
    signature,
    relayer: relayerKeypair.publicKey.toBase58(),
    network: 'mainnet'
  }));
}

directRelayerDeploy().catch(e => {
  console.error('\n❌ Failed:', e.message);
  process.exit(1);
});
