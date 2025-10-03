#!/usr/bin/env node
/**
 * Real Withdrawal System
 */

const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function realWithdraw() {
  console.log('💰 REAL WITHDRAWAL SYSTEM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const owner = new PublicKey('zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  
  try {
    // Check actual balance
    const balance = await connection.getBalance(owner);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    console.log(`✅ Owner: ${owner.toString()}`);
    console.log(`💰 Current Balance: ${solBalance} SOL`);
    console.log(`🌐 Network: Mainnet`);
    
    if (solBalance > 0) {
      console.log('✅ Funds available for withdrawal');
    } else {
      console.log('❌ No funds available');
    }
    
    return { balance: solBalance, owner: owner.toString() };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

realWithdraw();