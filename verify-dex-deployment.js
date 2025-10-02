#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');

const DEX_PROXY_PROGRAM = '6MWVTis8rmmk6Vt9zmAJJbmb3VuLpzoQ1aHH4N6wQEGh';
const BOT_1_ADDRESS = 'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function verifyDexDeployment() {
  console.log('🔍 VERIFYING DEX PROXY DEPLOYMENT');
  console.log('=' .repeat(60));

  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  try {
    // Verify DEX Proxy Program
    console.log('🔧 Verifying DEX Proxy Program...');
    const proxyPubkey = new PublicKey(DEX_PROXY_PROGRAM);
    const proxyAccount = await connection.getAccountInfo(proxyPubkey);
    
    if (proxyAccount) {
      console.log(`✅ DEX Proxy Program: ${DEX_PROXY_PROGRAM}`);
      console.log(`   Owner: ${proxyAccount.owner.toString()}`);
      console.log(`   Executable: ${proxyAccount.executable}`);
      console.log(`   Data Length: ${proxyAccount.data.length} bytes`);
    } else {
      console.log(`❌ DEX Proxy Program not found: ${DEX_PROXY_PROGRAM}`);
    }

    // Verify Bot 1 Address
    console.log('\n🤖 Verifying Bot 1 Address...');
    const bot1Pubkey = new PublicKey(BOT_1_ADDRESS);
    const bot1Account = await connection.getAccountInfo(bot1Pubkey);
    
    if (bot1Account) {
      console.log(`✅ Bot 1 Address: ${BOT_1_ADDRESS}`);
      console.log(`   Balance: ${bot1Account.lamports / 1e9} SOL`);
      console.log(`   Owner: ${bot1Account.owner.toString()}`);
    } else {
      console.log(`⚠️  Bot 1 Address has no account data: ${BOT_1_ADDRESS}`);
    }

    // Verify USDC Mint
    console.log('\n🪙 Verifying USDC Mint...');
    const usdcPubkey = new PublicKey(USDC_MINT);
    const usdcAccount = await connection.getAccountInfo(usdcPubkey);
    
    if (usdcAccount) {
      console.log(`✅ USDC Mint: ${USDC_MINT}`);
      console.log(`   Owner: ${usdcAccount.owner.toString()}`);
      console.log(`   Data Length: ${usdcAccount.data.length} bytes`);
    } else {
      console.log(`❌ USDC Mint not found: ${USDC_MINT}`);
    }

    // Check recent transactions for Bot 1
    console.log('\n📋 Checking Bot 1 Recent Activity...');
    const signatures = await connection.getSignaturesForAddress(bot1Pubkey, { limit: 3 });
    
    if (signatures.length > 0) {
      console.log(`📊 Found ${signatures.length} recent transactions:`);
      signatures.forEach((sig, i) => {
        console.log(`   ${i + 1}. ${sig.signature.substring(0, 20)}...`);
        console.log(`      Time: ${new Date(sig.blockTime * 1000).toISOString()}`);
        console.log(`      Status: ${sig.err ? 'Failed' : 'Success'}`);
      });
    } else {
      console.log('📊 No recent transactions found for Bot 1');
    }

    console.log('\n🎯 VERIFICATION SUMMARY:');
    console.log(`   DEX Proxy: ${proxyAccount ? '✅ VERIFIED' : '❌ NOT FOUND'}`);
    console.log(`   Bot 1: ${bot1Account ? '✅ VERIFIED' : '⚠️  NO DATA'}`);
    console.log(`   USDC Mint: ${usdcAccount ? '✅ VERIFIED' : '❌ NOT FOUND'}`);
    console.log(`   Recent Activity: ${signatures.length > 0 ? '✅ ACTIVE' : '📊 NONE'}`);

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

if (require.main === module) {
  verifyDexDeployment().catch(console.error);
}

module.exports = { verifyDexDeployment };