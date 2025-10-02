#!/usr/bin/env node

const { SWAP_PAIRS, getSwapPair } = require('./src/utils/swapPairs');

async function setupJupiterSwaps() {
  console.log('🚀 Jupiter Swap Pairs Configuration');
  console.log('=' .repeat(50));

  // Display available swap pairs
  Object.entries(SWAP_PAIRS).forEach(([key, pair]) => {
    console.log(`📊 ${pair.symbol}`);
    console.log(`   Input:  ${pair.inputMint.toString()}`);
    console.log(`   Output: ${pair.outputMint.toString()}\n`);
  });

  // Test swap pair lookup
  const impulseUsdcPair = getSwapPair('IMPULSE', 'USDC');
  const omegaUsdcPair = getSwapPair('OMEGA', 'USDC');

  console.log('✅ Swap pairs configured for Jupiter integration');
  console.log(`🎯 IMPULSE/USDC: ${impulseUsdcPair?.symbol || 'Not found'}`);
  console.log(`🎯 OMEGA/USDC: ${omegaUsdcPair?.symbol || 'Not found'}`);
}

if (require.main === module) {
  setupJupiterSwaps().catch(console.error);
}

module.exports = { setupJupiterSwaps };