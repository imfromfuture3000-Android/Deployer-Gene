#!/usr/bin/env node
require('dotenv').config();
const { ethers } = require('ethers');

async function checkEVMWallet() {
  console.log('🔷 EVM WALLET CHECKER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const mainWallet = process.env.TREASURY_PUBKEY || 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
  
  console.log(`📍 Main Wallet: ${mainWallet}\n`);

  // Check multiple EVM chains
  const chains = [
    { name: 'Ethereum', rpc: 'https://eth.llamarpc.com', chainId: 1 },
    { name: 'Polygon', rpc: 'https://polygon-rpc.com', chainId: 137 },
    { name: 'BSC', rpc: 'https://bsc-dataseed.binance.org', chainId: 56 },
    { name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc', chainId: 42161 }
  ];

  const results = { wallet: mainWallet, chains: [] };

  for (const chain of chains) {
    try {
      console.log(`🔍 Checking ${chain.name}...`);
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      
      // Convert Solana address to EVM format (first 20 bytes as hex)
      const evmAddress = '0x' + Buffer.from(mainWallet, 'base64').slice(0, 20).toString('hex');
      
      const balance = await provider.getBalance(evmAddress);
      const balanceEth = ethers.formatEther(balance);

      console.log(`   Balance: ${balanceEth} ${chain.name === 'BSC' ? 'BNB' : chain.name === 'Polygon' ? 'MATIC' : 'ETH'}\n`);

      results.chains.push({
        name: chain.name,
        chainId: chain.chainId,
        address: evmAddress,
        balance: balanceEth
      });

    } catch (error) {
      console.log(`   ⚠️  ${error.message}\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  results.chains.forEach(c => {
    console.log(`${c.name}: ${c.balance}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  require('fs').writeFileSync('.cache/evm-wallet-check.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to .cache/evm-wallet-check.json');
}

checkEVMWallet().catch(console.error);
