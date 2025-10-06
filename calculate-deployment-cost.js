#!/usr/bin/env node
/**
 * Calculate SOL Deployment Cost
 */

const { Connection, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function calculateDeploymentCost() {
  console.log('💰 CALCULATING SOL DEPLOYMENT COST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  // Get current rent costs
  const mintRent = await connection.getMinimumBalanceForRentExemption(82); // Mint account size
  const tokenAccountRent = await connection.getMinimumBalanceForRentExemption(165); // Token account size
  
  // Get priority fees
  let priorityFee = 5000; // Default
  try {
    const fees = await connection.getRecentPrioritizationFees();
    if (fees.length > 0) {
      priorityFee = Math.ceil(fees.reduce((sum, fee) => sum + fee.prioritizationFee, 0) / fees.length);
    }
  } catch (e) {
    console.log('⚠️ Using default priority fee');
  }
  
  // Cost breakdown
  const costs = {
    createMint: mintRent + priorityFee,
    createTokenAccount: tokenAccountRent + priorityFee,
    mintTokens: priorityFee,
    setMetadata: priorityFee * 2, // Metadata is larger
    lockAuthorities: priorityFee,
    transferTokens: priorityFee,
    buffer: 0.01 * LAMPORTS_PER_SOL // 0.01 SOL buffer
  };
  
  const totalLamports = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  const totalSOL = totalLamports / LAMPORTS_PER_SOL;
  
  console.log('📊 DEPLOYMENT COST BREAKDOWN:');
  console.log(`🏗️ Create Mint: ${(costs.createMint / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
  console.log(`📋 Create Token Account: ${(costs.createTokenAccount / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
  console.log(`💰 Mint Tokens: ${(costs.mintTokens / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
  console.log(`🏷️ Set Metadata: ${(costs.setMetadata / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
  console.log(`🔒 Lock Authorities: ${(costs.lockAuthorities / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
  console.log(`📤 Transfer Tokens: ${(costs.transferTokens / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
  console.log(`🛡️ Safety Buffer: ${(costs.buffer / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
  
  console.log('\n💎 TOTAL DEPLOYMENT COST:');
  console.log(`🎯 Required SOL: ${totalSOL.toFixed(6)} SOL`);
  console.log(`💵 USD (≈$140/SOL): $${(totalSOL * 140).toFixed(2)}`);
  
  // Recommendations
  console.log('\n📋 RECOMMENDATIONS:');
  if (totalSOL < 0.01) {
    console.log('✅ Very low cost deployment');
  } else if (totalSOL < 0.05) {
    console.log('✅ Reasonable deployment cost');
  } else {
    console.log('⚠️ Higher cost due to network congestion');
  }
  
  console.log(`💡 Fund treasury with: ${(totalSOL * 1.2).toFixed(6)} SOL (20% extra)`);
  
  // Save cost analysis
  const costAnalysis = {
    timestamp: new Date().toISOString(),
    network: 'mainnet-beta',
    totalSOL: totalSOL,
    totalUSD: totalSOL * 140,
    breakdown: costs,
    priorityFee: priorityFee,
    recommendation: (totalSOL * 1.2).toFixed(6) + ' SOL'
  };
  
  require('fs').writeFileSync('.cache/deployment-cost.json', JSON.stringify(costAnalysis, null, 2));
  console.log('📋 Cost analysis saved to .cache/deployment-cost.json');
  
  return costAnalysis;
}

calculateDeploymentCost().catch(console.error);