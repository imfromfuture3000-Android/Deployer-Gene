#!/usr/bin/env node
/**
 * Automated Withdrawal System - Secure Implementation
 */

const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
// Use built-in base58 from @solana/web3.js
const { decode } = require('bs58');

async function automatedWithdrawal() {
  console.log('🤖 AUTOMATED WITHDRAWAL SYSTEM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Load private key from environment variable (SECURE METHOD)
  const privateKeyBase58 = process.env.DEPLOYER_PRIVATE_KEY;
  
  if (!privateKeyBase58) {
    console.log('❌ DEPLOYER_PRIVATE_KEY not found in environment');
    console.log('💡 Set it with: export DEPLOYER_PRIVATE_KEY="your_key_here"');
    return;
  }
  
  try {
    // Convert base58 to keypair
    const privateKeyBytes = decode(privateKeyBase58);
    const deployerKeypair = Keypair.fromSecretKey(privateKeyBytes);
    
    console.log(`✅ Loaded deployer: ${deployerKeypair.publicKey.toString()}`);
    
    // Connect to mainnet
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    
    // Programs to withdraw from
    const programs = [
      { address: 'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt', expected: 0.113759865 },
      { address: 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', expected: 6.452432793 },
      { address: 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1', expected: 2.161991723 }
    ];
    
    let totalWithdrawn = 0;
    const results = [];
    
    for (const program of programs) {
      console.log(`\n🔓 Processing: ${program.address}`);
      
      try {
        const programPubkey = new PublicKey(program.address);
        
        // Check actual balance
        const balance = await connection.getBalance(programPubkey);
        const solBalance = balance / LAMPORTS_PER_SOL;
        
        console.log(`💰 Current balance: ${solBalance} SOL`);
        
        if (solBalance > 0.001) { // Only withdraw if significant balance
          // Create withdrawal instruction
          const withdrawAmount = Math.floor(balance * 0.95); // Leave 5% for rent/fees
          
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: programPubkey,
              toPubkey: deployerKeypair.publicKey,
              lamports: withdrawAmount
            })
          );
          
          // Set transaction parameters
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = deployerKeypair.publicKey;
          
          // Sign and send
          transaction.sign(deployerKeypair);
          const signature = await connection.sendRawTransaction(transaction.serialize());
          
          console.log(`✅ Withdrawal sent: ${signature}`);
          console.log(`🔗 https://explorer.solana.com/tx/${signature}`);
          
          // Wait for confirmation
          await connection.confirmTransaction(signature);
          
          totalWithdrawn += (withdrawAmount / LAMPORTS_PER_SOL);
          results.push({
            program: program.address,
            amount: withdrawAmount / LAMPORTS_PER_SOL,
            signature: signature,
            status: 'success'
          });
          
        } else {
          console.log('⚠️ Balance too low to withdraw');
          results.push({
            program: program.address,
            amount: 0,
            status: 'insufficient_balance'
          });
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        results.push({
          program: program.address,
          amount: 0,
          error: error.message,
          status: 'failed'
        });
      }
    }
    
    console.log('\n🎉 AUTOMATED WITHDRAWAL COMPLETE');
    console.log(`💎 Total withdrawn: ${totalWithdrawn} SOL`);
    console.log(`📊 Successful: ${results.filter(r => r.status === 'success').length}/3`);
    
    // Save results
    require('fs').writeFileSync('.cache/withdrawal-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      totalWithdrawn,
      results
    }, null, 2));
    
    return results;
    
  } catch (error) {
    console.log(`❌ Fatal error: ${error.message}`);
    return null;
  }
}

// Run automated withdrawal
automatedWithdrawal();