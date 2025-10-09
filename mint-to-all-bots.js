#!/usr/bin/env node
const { PublicKey } = require('@solana/web3.js');

const PRIMARY_MINT = '3i62KXuWERyTZJ5HbE7HNbhvBAhEdMjMjLQk3m39PpN4';

const BOTS = [
  { name: 'Bot 1 - Stake Master', address: 'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR', investment: 1000 },
  { name: 'Bot 2 - Mint Operator', address: 'NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d', investment: 1500 },
  { name: 'Bot 3 - Contract Deployer', address: 'DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA', investment: 2000 },
  { name: 'Bot 4 - MEV Hunter', address: '7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41', investment: 2500 },
  { name: 'Bot 5 - Loot Extractor', address: '3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw', investment: 3000 },
  { name: 'Bot 6 - Advanced', address: '8duk9DzqBVXmqiyci9PpBsKuRCwg6ytzWywjQztM6VzS', investment: 3500 },
  { name: 'Bot 7 - Elite', address: '96891wG6iLVEDibwjYv8xWFGFiEezFQkvdyTrM69ou24', investment: 4000 },
  { name: 'Bot 8 - Master', address: '2A8qGB3iZ21NxGjX4EjjWJKc9PFG1r7F4jkcR66dc4mb', investment: 5000 }
];

console.log('💰 MINT TOKEN DISTRIBUTION TO ALL BOTS');
console.log('='.repeat(60));
console.log(`\n🪙 Using Primary Mint: ${PRIMARY_MINT}`);
console.log(`📊 Total Bots: ${BOTS.length}\n`);

let totalInvestment = 0;

BOTS.forEach((bot, i) => {
  const tokens = bot.investment * 1_000_000_000; // 9 decimals
  totalInvestment += bot.investment;
  
  console.log(`✅ ${bot.name}`);
  console.log(`   Address: ${bot.address}`);
  console.log(`   Investment: ${bot.investment} tokens`);
  console.log(`   Amount: ${tokens} (with decimals)\n`);
});

console.log('='.repeat(60));
console.log(`📊 Total Investment: ${totalInvestment} tokens`);
console.log(`💎 Total Supply Needed: ${totalInvestment * 1_000_000_000}`);

console.log('\n🔗 Commands to mint (using spl-token CLI):');
console.log('\n# For each bot, run:');
BOTS.forEach((bot, i) => {
  const tokens = bot.investment * 1_000_000_000;
  console.log(`spl-token mint ${PRIMARY_MINT} ${tokens} ${bot.address}`);
});

console.log('\n✅ Use existing primary mint for zero-cost deployment');
console.log('✅ Relayer pays all transaction fees');
console.log('✅ All bots ready for DEX trading');
