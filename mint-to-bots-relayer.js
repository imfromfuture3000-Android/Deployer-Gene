#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

console.log('🚀 MINT TO BOTS - RELAYER MODE');
console.log('==============================');

async function mintToBots() {
  const investments = JSON.parse(fs.readFileSync('.cache/bot-investments.json', 'utf8'));
  
  const mintTransactions = [];
  
  for (const bot of investments.bots) {
    const mintTx = {
      bot: bot.name,
      address: bot.address,
      amount: bot.investment,
      amountBaseUnits: bot.investment * 1e9, // 9 decimals
      mint: investments.mint.address,
      signature: null,
      status: 'PENDING_RELAYER'
    };
    
    mintTransactions.push(mintTx);
    
    console.log(`📤 Queued: ${bot.name} → ${bot.investment.toLocaleString()} tokens`);
  }
  
  const mintResult = {
    timestamp: new Date().toISOString(),
    totalBots: investments.bots.length,
    totalTokens: investments.totalInvestment,
    transactions: mintTransactions,
    relayerMode: true,
    cost: 0, // Zero cost via relayer
    status: 'READY_FOR_EXECUTION'
  };
  
  fs.writeFileSync('.cache/mint-transactions.json', JSON.stringify(mintResult, null, 2));
  
  console.log('\n✅ Mint Transactions Prepared:');
  console.log(`   Total Bots: ${mintResult.totalBots}`);
  console.log(`   Total Tokens: ${mintResult.totalTokens.toLocaleString()}`);
  console.log(`   Cost: ${mintResult.cost} SOL (relayer pays)`);
  console.log(`   Status: ${mintResult.status}`);
  
  return mintResult;
}

if (require.main === module) {
  mintToBots().catch(console.error);
}

module.exports = { mintToBots };