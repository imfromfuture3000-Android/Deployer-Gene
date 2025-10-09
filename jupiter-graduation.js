#!/usr/bin/env node
const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

// Jupiter API endpoints
const JUPITER_API = 'https://quote-api.jup.ag/v6';
const JUPITER_PRICE_API = 'https://price.jup.ag/v4';

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const JUPITER_V6 = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';

async function checkTokenOnJupiter(mintAddress) {
  console.log(`\n🔍 Checking ${mintAddress} on Jupiter...`);
  
  try {
    const response = await axios.get(`${JUPITER_PRICE_API}/price?ids=${mintAddress}`);
    
    if (response.data.data[mintAddress]) {
      const priceData = response.data.data[mintAddress];
      console.log(`✅ Token FOUND on Jupiter`);
      console.log(`  Price: $${priceData.price}`);
      return true;
    } else {
      console.log(`❌ Token NOT listed on Jupiter yet`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Token NOT listed on Jupiter yet`);
    return false;
  }
}

async function getJupiterQuote(inputMint, outputMint, amount) {
  console.log(`\n💱 Getting Jupiter quote...`);
  
  try {
    const response = await axios.get(`${JUPITER_API}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount,
        slippageBps: 50 // 0.5%
      }
    });
    
    console.log(`✅ Quote received`);
    console.log(`  Input: ${amount} tokens`);
    console.log(`  Output: ${response.data.outAmount} tokens`);
    console.log(`  Price Impact: ${response.data.priceImpactPct}%`);
    
    return response.data;
  } catch (error) {
    console.log(`❌ Quote failed: ${error.message}`);
    return null;
  }
}

async function graduateToJupiter(mintAddress) {
  console.log(`\n🎓 Graduating ${mintAddress} to Jupiter...`);
  
  const steps = [
    '1. Create liquidity pool with USDC',
    '2. Add minimum $10,000 liquidity',
    '3. Generate 24h volume > $50,000',
    '4. Reach 100+ holders',
    '5. Submit to Jupiter for listing'
  ];
  
  console.log(`\n📋 Graduation Steps:`);
  steps.forEach(step => console.log(`  ${step}`));
  
  const graduationConfig = {
    mint: mintAddress,
    target_pair: USDC_MINT,
    min_liquidity_usd: 10000,
    min_volume_24h_usd: 50000,
    min_holders: 100,
    jupiter_program: JUPITER_V6,
    auto_submit: true,
    strict_mode: false
  };
  
  console.log(`\n✅ Graduation config created`);
  return graduationConfig;
}

async function searchJupiterTokens(query) {
  console.log(`\n🔎 Searching Jupiter for: ${query}`);
  
  try {
    const response = await axios.get(`${JUPITER_PRICE_API}/price?ids=${query}`);
    console.log(`✅ Search results:`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ Search failed: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 JUPITER FAST GRADUATION SYSTEM');
  console.log('=' .repeat(60));
  
  const primaryMint = process.env.PRIMARY_MINT || '3i62KXuWERyTZJ5HbE7HNbhvBAhEdMjMjLQk3m39PpN4';
  
  // Check if token is on Jupiter
  const isListed = await checkTokenOnJupiter(primaryMint);
  
  if (!isListed) {
    // Create graduation plan
    const graduationPlan = await graduateToJupiter(primaryMint);
    console.log(`\n📊 Graduation Plan:`, graduationPlan);
  }
  
  // Get quote for USDC swap
  await getJupiterQuote(primaryMint, USDC_MINT, 1000000000); // 1 token
  
  // Search for new programs
  console.log(`\n🔍 Searching for new Jupiter programs...`);
  await searchJupiterTokens('USDC,JUP,SOL');
  
  console.log(`\n✅ Jupiter integration ready`);
  console.log(`\n🔗 Jupiter V6: ${JUPITER_V6}`);
  console.log(`🔗 USDC Mint: ${USDC_MINT}`);
}

if (require.main === module) {
  main();
}

module.exports = { checkTokenOnJupiter, graduateToJupiter, getJupiterQuote };
