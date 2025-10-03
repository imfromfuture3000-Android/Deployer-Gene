#!/usr/bin/env node
/**
 * YOUR WITHDRAWAL SCRIPT - EDIT WITH YOUR PRIVATE KEY
 */

const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');

async function withdrawFromPrograms() {
  console.log('🔐 PROGRAM WITHDRAWAL STARTING...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 🔑 STEP 1: LOAD YOUR PRIVATE KEY (CHOOSE ONE METHOD)
  
  // METHOD A: From .deployer.key file
  try {
    const privateKeyArray = JSON.parse(fs.readFileSync('.deployer.key', 'utf8'));
    var deployerKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    console.log('✅ Private key loaded from .deployer.key');
  } catch (error) {
    console.log('❌ Could not load .deployer.key file');
    console.log('💡 Create it first or use METHOD B below');
    return;
  }
  
  // METHOD B: Uncomment and add your private key array here
  // const yourPrivateKeyArray = [/* paste your 64-byte array here */];
  // var deployerKeypair = Keypair.fromSecretKey(new Uint8Array(yourPrivateKeyArray));
  
  // 🌐 STEP 2: CONNECT TO MAINNET
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  // 📋 STEP 3: YOUR PROGRAMS TO WITHDRAW FROM
  const programs = [
    { address: 'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt', balance: 0.113759865 },
    { address: 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', balance: 6.452432793 },
    { address: 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1', balance: 2.161991723 }
  ];
  
  const destination = deployerKeypair.publicKey;
  console.log(`📥 Destination wallet: ${destination.toString()}`);
  console.log(`💰 Total to withdraw: ~8.73 SOL`);
  
  // 🚀 STEP 4: WITHDRAW FROM EACH PROGRAM
  let totalWithdrawn = 0;
  
  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];
    console.log(`\n🔓 Withdrawing from program ${i + 1}/3...`);
    console.log(`📍 Address: ${program.address}`);
    console.log(`💰 Amount: ${program.balance} SOL`);
    
    try {
      const programPubkey = new PublicKey(program.address);
      const lamports = Math.floor(program.balance * LAMPORTS_PER_SOL * 0.99); // Leave some for rent
      
      // Create withdrawal transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: programPubkey,
          toPubkey: destination,
          lamports: lamports
        })
      );
      
      // Set transaction details
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = deployerKeypair.publicKey;
      
      // Sign and send
      transaction.sign(deployerKeypair);
      const signature = await connection.sendRawTransaction(transaction.serialize());
      
      console.log(`✅ SUCCESS! TX: ${signature}`);
      console.log(`🔗 Explorer: https://explorer.solana.com/tx/${signature}`);
      
      totalWithdrawn += program.balance;
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      console.log(`✅ Transaction confirmed`);
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      
      if (error.message.includes('insufficient funds')) {
        console.log('💡 This program may not allow direct SOL withdrawal');
        console.log('💡 You may need to call a specific withdraw function');
      }
    }
  }
  
  console.log('\n🎉 WITHDRAWAL PROCESS COMPLETE!');
  console.log(`💎 Total withdrawn: ${totalWithdrawn} SOL`);
  console.log(`📥 Check your wallet: ${destination.toString()}`);
}

// ⚠️ SAFETY CHECK
console.log('⚠️  IMPORTANT: Make sure you have backed up your private key!');
console.log('⚠️  IMPORTANT: This will attempt to withdraw from program accounts!');
console.log('⚠️  IMPORTANT: Only run this if you are the program authority!');
console.log('\nStarting in 3 seconds...');

setTimeout(() => {
  withdrawFromPrograms().catch(console.error);
}, 3000);