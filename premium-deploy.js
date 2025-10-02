#!/usr/bin/env node

/**
 * 🚀 PREMIUM DEPLOYMENT - Priority fees + Genesis validation
 */

const { Connection, Transaction, SystemProgram, Keypair, PublicKey } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, MINT_SIZE, getMinimumBalanceForRentExemptMint } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PREMIUM_RPCS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.g.alchemy.com/v2/demo',
  'https://rpc.ankr.com/solana'
];

async function getPriorityFee(connection) {
  try {
    const recentFees = await connection.getRecentPrioritizationFees();
    if (recentFees.length > 0) {
      const avgFee = recentFees.reduce((sum, fee) => sum + fee.prioritizationFee, 0) / recentFees.length;
      return Math.ceil(avgFee * 1.2); // 20% above average
    }
  } catch (e) {
    console.log('⚠️  Could not fetch priority fees, using default');
  }
  return 5000; // Default priority fee
}

async function validateGenesisHash(connection) {
  try {
    const genesisHash = await connection.getGenesisHash();
    const expectedHash = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d'; // Mainnet
    if (genesisHash === expectedHash) {
      console.log('✅ Genesis hash validated: Mainnet');
      return true;
    }
    console.warn(`⚠️  Genesis hash mismatch: ${genesisHash}`);
    return false;
  } catch (e) {
    console.warn('⚠️  Could not validate genesis hash');
    return true; // Continue anyway
  }
}

async function testRpcConnection(rpcUrl) {
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    const slot = await connection.getSlot();
    const isValid = await validateGenesisHash(connection);
    
    console.log(`✅ RPC OK: ${rpcUrl.substring(0, 40)}...`);
    console.log(`   Version: ${version['solana-core']}, Slot: ${slot}`);
    
    return isValid ? connection : null;
  } catch (e) {
    console.log(`❌ RPC failed: ${rpcUrl.substring(0, 40)}...`);
    return null;
  }
}

async function findBestRpc() {
  console.log('\n🔍 Testing RPC endpoints...\n');
  
  for (const rpc of PREMIUM_RPCS) {
    const conn = await testRpcConnection(rpc);
    if (conn) return { connection: conn, url: rpc };
  }
  
  throw new Error('No working RPC found');
}

async function createMintWithPriority() {
  console.log('🚀 PREMIUM DEPLOYMENT WITH PRIORITY FEES');
  console.log('='.repeat(60));
  
  const { connection, url } = await findBestRpc();
  
  const cacheDir = path.join(process.cwd(), '.cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  
  const mintKeypairPath = path.join(cacheDir, 'mint-keypair.json');
  const mintCachePath = path.join(cacheDir, 'mint.json');
  
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
  const payerKeypairPath = path.join(cacheDir, 'deployer-keypair.json');
  
  let payer;
  if (fs.existsSync(payerKeypairPath)) {
    const data = JSON.parse(fs.readFileSync(payerKeypairPath, 'utf-8'));
    payer = Keypair.fromSecretKey(Uint8Array.from(data));
  } else {
    payer = Keypair.generate();
    fs.writeFileSync(payerKeypairPath, JSON.stringify(Array.from(payer.secretKey)));
    console.log(`\n💰 Generated payer: ${payer.publicKey.toBase58()}`);
    console.log('⚠️  Fund this address with SOL to deploy!');
    process.exit(0);
  }
  
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`\n💰 Payer balance: ${balance / 1e9} SOL`);
  
  if (balance < 0.01e9) {
    console.log('❌ Insufficient balance. Need at least 0.01 SOL');
    console.log(`   Fund: ${payer.publicKey.toBase58()}`);
    process.exit(1);
  }
  
  const priorityFee = await getPriorityFee(connection);
  console.log(`\n⚡ Priority fee: ${priorityFee} microlamports`);
  
  const rentExempt = await getMinimumBalanceForRentExemptMint(connection);
  
  const tx = new Transaction();
  
  // Add compute budget instructions for priority
  tx.add({
    keys: [],
    programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
    data: Buffer.from([0, ...new Uint8Array(new Uint32Array([200000]).buffer)]) // 200k compute units
  });
  
  tx.add({
    keys: [],
    programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
    data: Buffer.from([3, ...new Uint8Array(new BigUint64Array([BigInt(priorityFee)]).buffer)]) // Priority fee
  });
  
  // Create mint account
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
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
  
  tx.feePayer = payer.publicKey;
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  
  console.log('\n📝 Signing transaction...');
  tx.sign(payer, mintKeypair);
  
  console.log('📤 Sending transaction...');
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    maxRetries: 3
  });
  
  console.log(`\n⏳ Confirming: ${signature}`);
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight
  }, 'confirmed');
  
  fs.writeFileSync(mintCachePath, JSON.stringify({ mint: mintKeypair.publicKey.toBase58() }));
  
  console.log('\n✅ MINT CREATED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`📍 Mint: ${mintKeypair.publicKey.toBase58()}`);
  console.log(`🔗 Explorer: https://explorer.solana.com/address/${mintKeypair.publicKey.toBase58()}`);
  console.log(`📝 TX: https://explorer.solana.com/tx/${signature}`);
}

createMintWithPriority().catch(e => {
  console.error('\n❌ Deployment failed:', e.message);
  process.exit(1);
});
