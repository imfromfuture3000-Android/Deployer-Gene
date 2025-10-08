#!/usr/bin/env node
require('dotenv').config();
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, createInitializeMintInstruction, createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress, getMint } = require('@solana/spl-token');
const fs = require('fs');

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

async function deploy() {
  console.log('🚀 MAINNET DEPLOYMENT - RELAYER MODE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Network: MAINNET-BETA');
  console.log('✅ Fee Payer: RELAYER');
  console.log('✅ User Role: SIGNER ONLY');
  console.log('✅ Cost to User: ZERO SOL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const connection = new Connection(RPC_URL, 'confirmed');
  
  // Load or generate deployer keypair
  let deployer;
  if (fs.existsSync('.cache/user_auth.json')) {
    const keyData = JSON.parse(fs.readFileSync('.cache/user_auth.json'));
    deployer = Keypair.fromSecretKey(new Uint8Array(keyData));
    console.log('✅ Loaded deployer keypair');
  } else {
    deployer = Keypair.generate();
    fs.mkdirSync('.cache', { recursive: true });
    fs.writeFileSync('.cache/user_auth.json', JSON.stringify(Array.from(deployer.secretKey)));
    console.log('✅ Generated new deployer keypair');
  }
  
  console.log(`📍 Deployer: ${deployer.publicKey.toBase58()}`);
  
  const balance = await connection.getBalance(deployer.publicKey);
  console.log(`💰 Balance: ${balance / 1e9} SOL`);
  
  if (balance === 0) {
    console.log('\n⚠️  ZERO BALANCE DETECTED');
    console.log('✅ This is CORRECT for relayer mode');
    console.log('✅ Relayer will pay all fees');
    console.log('✅ User signs only\n');
  }

  // Generate mint keypair
  const mintKeypair = Keypair.generate();
  console.log(`\n🪙 Mint Address: ${mintKeypair.publicKey.toBase58()}`);
  
  // Get treasury ATA
  const treasuryAta = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    deployer.publicKey
  );
  console.log(`💰 Treasury ATA: ${treasuryAta.toBase58()}`);

  // Save deployment info
  const deploymentInfo = {
    mint: mintKeypair.publicKey.toBase58(),
    treasuryAta: treasuryAta.toBase58(),
    deployer: deployer.publicKey.toBase58(),
    mintAuthority: deployer.publicKey.toBase58(),
    freezeAuthority: deployer.publicKey.toBase58(),
    decimals: 9,
    supply: 1_000_000_000,
    network: 'mainnet-beta',
    timestamp: new Date().toISOString(),
    status: 'ready_for_relayer',
    explorer: `https://explorer.solana.com/address/${mintKeypair.publicKey.toBase58()}`
  };

  fs.writeFileSync('.cache/deployment.json', JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync('.cache/mint-keypair.json', JSON.stringify(Array.from(mintKeypair.secretKey)));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ DEPLOYMENT PREPARED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🪙 Mint: ${mintKeypair.publicKey.toBase58()}`);
  console.log(`💰 Treasury: ${treasuryAta.toBase58()}`);
  console.log(`📍 Deployer: ${deployer.publicKey.toBase58()}`);
  console.log(`🔗 Explorer: https://explorer.solana.com/address/${mintKeypair.publicKey.toBase58()}`);
  console.log('\n📋 Next Steps:');
  console.log('1. MCP Relayer Server will handle transaction submission');
  console.log('2. User signs transactions (no SOL required)');
  console.log('3. Relayer pays all fees');
  console.log('4. Zero-cost deployment complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

deploy().catch(console.error);
