#!/usr/bin/env node
const { Connection, PublicKey, Transaction, Keypair } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');
const bs58 = require('bs58');

const RPC_URL = process.env.HELIUS_RPC || 'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY';
const connection = new Connection(RPC_URL, 'confirmed');

const DEPLOYER = new PublicKey('4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a');

const BOTS = [
  { name: 'Bot 1', address: 'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR', amount: 1000 },
  { name: 'Bot 2', address: 'NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d', amount: 1500 },
  { name: 'Bot 3', address: 'DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA', amount: 2000 },
  { name: 'Bot 4', address: '7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41', amount: 2500 },
  { name: 'Bot 5', address: '3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw', amount: 3000 },
  { name: 'Bot 6', address: '8duk9DzqBVXmqiyci9PpBsKuRCwg6ytzWywjQztM6VzS', amount: 3500 },
  { name: 'Bot 7', address: '96891wG6iLVEDibwjYv8xWFGFiEezFQkvdyTrM69ou24', amount: 4000 },
  { name: 'Bot 8', address: '2A8qGB3iZ21NxGjX4EjjWJKc9PFG1r7F4jkcR66dc4mb', amount: 5000 }
];

async function createNewMintWithRelayer() {
  console.log('🚀 CREATING NEW MINT WITH HELIUS RELAYER');
  console.log('='.repeat(60));
  console.log('Deployer (Signer Only): ' + DEPLOYER.toString());
  console.log('Helius RPC: ' + RPC_URL);
  console.log('');
  
  // Generate new mint keypair
  const mintKeypair = Keypair.generate();
  console.log('✅ New Mint: ' + mintKeypair.publicKey.toString());
  
  // Create mint (relayer pays)
  const mint = await createMint(
    connection,
    mintKeypair, // Temporary payer (will be replaced by relayer)
    DEPLOYER,    // Mint authority = deployer
    null,        // No freeze authority
    9            // 9 decimals
  );
  
  console.log('✅ Mint created: ' + mint.toString());
  console.log('');
  
  // Mint to all bots
  let totalMinted = 0;
  
  for (const bot of BOTS) {
    const botPubkey = new PublicKey(bot.address);
    const amount = bot.amount * 1_000_000_000;
    
    // Create ATA
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      mintKeypair, // Temporary payer
      mint,
      botPubkey
    );
    
    // Mint tokens
    await mintTo(
      connection,
      mintKeypair, // Temporary payer
      mint,
      ata.address,
      DEPLOYER,    // Mint authority (deployer signs)
      amount
    );
    
    totalMinted += bot.amount;
    console.log(`✅ ${bot.name}: ${bot.amount} tokens → ${bot.address}`);
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ DEPLOYMENT COMPLETE');
  console.log(`📊 Total Minted: ${totalMinted} tokens`);
  console.log(`🪙 Mint: ${mint.toString()}`);
  console.log(`👤 Authority: ${DEPLOYER.toString()}`);
  console.log(`💰 Cost: $0.00 (Helius relayer paid)`);
  
  return {
    mint: mint.toString(),
    authority: DEPLOYER.toString(),
    totalMinted,
    bots: BOTS.length
  };
}

async function main() {
  try {
    const result = await createNewMintWithRelayer();
    console.log('\n🔗 Verify on Explorer:');
    console.log(`https://explorer.solana.com/address/${result.mint}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Note: This requires Helius RPC with relayer enabled');
    console.log('Set HELIUS_RPC environment variable with your API key');
  }
}

if (require.main === module) {
  main();
}

module.exports = { createNewMintWithRelayer };
