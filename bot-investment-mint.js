#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

console.log('💰 BOT INVESTMENT & MINT LOGIC');
console.log('==============================');

const botInvestments = {
  timestamp: new Date().toISOString(),
  totalInvestment: 1000000, // 1M tokens
  bots: [
    {
      name: 'BOT1-STAKE',
      address: 'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR',
      investment: 100000, // 100K tokens
      multiplier: 10,
      mintLogic: 'stake_rewards_compound'
    },
    {
      name: 'BOT2-MINT',
      address: 'NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d',
      investment: 150000, // 150K tokens
      multiplier: 15,
      mintLogic: 'token_supply_management'
    },
    {
      name: 'BOT3-CONTRACT',
      address: 'DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA',
      investment: 200000, // 200K tokens
      multiplier: 20,
      mintLogic: 'contract_deployment_fees'
    },
    {
      name: 'BOT4-MEV',
      address: '7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41',
      investment: 250000, // 250K tokens
      multiplier: 25,
      mintLogic: 'mev_profit_extraction'
    },
    {
      name: 'BOT5-LOOT',
      address: '3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw',
      investment: 300000, // 300K tokens
      multiplier: 30,
      mintLogic: 'liquidation_rewards'
    }
  ],
  mint: {
    address: 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz',
    decimals: 9,
    authority: 'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ'
  },
  relayer: {
    zeroCost: true,
    endpoint: process.env.RELAYER_URL || 'https://api.helius.xyz/v0/transactions/submit'
  }
};

// Calculate total expected returns
botInvestments.expectedReturns = botInvestments.bots.reduce((total, bot) => {
  return total + (bot.investment * bot.multiplier);
}, 0);

if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
fs.writeFileSync('.cache/bot-investments.json', JSON.stringify(botInvestments, null, 2));

console.log('✅ Investment Configuration:');
console.log(`   Total Investment: ${botInvestments.totalInvestment.toLocaleString()} tokens`);
console.log(`   Expected Returns: ${botInvestments.expectedReturns.toLocaleString()} tokens`);
console.log(`   ROI Multiplier: ${(botInvestments.expectedReturns / botInvestments.totalInvestment).toFixed(1)}x`);

botInvestments.bots.forEach(bot => {
  console.log(`   ${bot.name}: ${bot.investment.toLocaleString()} → ${(bot.investment * bot.multiplier).toLocaleString()}`);
});

module.exports = botInvestments;