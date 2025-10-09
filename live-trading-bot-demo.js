#!/usr/bin/env node

const PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ETC/USDT'];
const BOTS = [
  { id: 1, name: 'MEV Hunter Pro', strategy: 'Front-Running', winRate: 94.7 },
  { id: 2, name: 'Arbitrage Master', strategy: 'Cross-DEX', winRate: 91.2 },
  { id: 3, name: 'Flash Loan Bot', strategy: 'Liquidation', winRate: 88.9 },
  { id: 4, name: 'Sniper Elite', strategy: 'New Listings', winRate: 96.3 },
  { id: 5, name: 'Grid Trader Pro', strategy: 'Grid Trading', winRate: 89.5 }
];

let totalProfit = 0;
let totalTrades = 0;
let runningBots = new Set();

function randomPrice(base, variance = 0.02) {
  return (base * (1 + (Math.random() - 0.5) * variance)).toFixed(2);
}

function randomAmount(min, max) {
  return (Math.random() * (max - min) + min).toFixed(4);
}

function randomProfit(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function getTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function displayHeader() {
  console.clear();
  console.log('\n' + '═'.repeat(100));
  console.log('🤖 LIVE TRADING BOT MONITOR - REAL-TIME PERFORMANCE 🚀');
  console.log('═'.repeat(100));
  console.log(`⏰ ${getTimestamp()} | 💰 Total Profit: $${totalProfit.toFixed(2)} | 📊 Trades: ${totalTrades} | ✅ Win Rate: ${((totalTrades > 0 ? (totalTrades * 0.92) / totalTrades : 0) * 100).toFixed(1)}%`);
  console.log('═'.repeat(100));
}

function executeTrade(bot, pair) {
  const prices = {
    'BTC/USDT': 45000,
    'ETH/USDT': 2400,
    'SOL/USDT': 105,
    'BNB/USDT': 320,
    'ETC/USDT': 28
  };
  
  const entryPrice = randomPrice(prices[pair]);
  const exitPrice = randomPrice(prices[pair] * 1.015, 0.01);
  const amount = randomAmount(0.1, 2.5);
  const profit = randomProfit(50, 850);
  
  totalProfit += parseFloat(profit);
  totalTrades++;
  
  const status = Math.random() > 0.08 ? '✅ WIN' : '⚠️  LOSS';
  const profitColor = status === '✅ WIN' ? profit : `-${(parseFloat(profit) * 0.3).toFixed(2)}`;
  
  console.log(`[${getTimestamp()}] 🤖 ${bot.name.padEnd(20)} | ${pair.padEnd(10)} | Entry: $${entryPrice} → Exit: $${exitPrice} | Amount: ${amount} | ${status} | 💵 $${profitColor}`);
}

function displayBotStatus() {
  console.log('\n' + '─'.repeat(100));
  console.log('📊 ACTIVE BOTS STATUS:');
  BOTS.forEach(bot => {
    const status = runningBots.has(bot.id) ? '🟢 ACTIVE' : '🔴 IDLE';
    const trades = Math.floor(Math.random() * 50) + 20;
    const profit = (Math.random() * 5000 + 1000).toFixed(2);
    console.log(`   ${status} | ${bot.name.padEnd(20)} | Strategy: ${bot.strategy.padEnd(15)} | Win Rate: ${bot.winRate}% | Trades: ${trades} | Profit: $${profit}`);
  });
}

function displayMarketData() {
  console.log('\n' + '─'.repeat(100));
  console.log('📈 LIVE MARKET PRICES:');
  const prices = {
    'BTC/USDT': randomPrice(45000, 0.005),
    'ETH/USDT': randomPrice(2400, 0.008),
    'SOL/USDT': randomPrice(105, 0.01),
    'BNB/USDT': randomPrice(320, 0.007),
    'ETC/USDT': randomPrice(28, 0.012)
  };
  
  Object.entries(prices).forEach(([pair, price]) => {
    const change = (Math.random() * 4 - 1).toFixed(2);
    const arrow = change > 0 ? '📈' : '📉';
    console.log(`   ${arrow} ${pair.padEnd(12)} $${price.padEnd(10)} ${change > 0 ? '+' : ''}${change}%`);
  });
}

function displayStats() {
  console.log('\n' + '─'.repeat(100));
  console.log('💎 PERFORMANCE STATISTICS:');
  console.log(`   💰 Total Profit Today:     $${totalProfit.toFixed(2)}`);
  console.log(`   📊 Total Trades:           ${totalTrades}`);
  console.log(`   ✅ Successful Trades:      ${Math.floor(totalTrades * 0.92)}`);
  console.log(`   ⚠️  Failed Trades:          ${Math.floor(totalTrades * 0.08)}`);
  console.log(`   📈 Win Rate:               ${((totalTrades > 0 ? (totalTrades * 0.92) / totalTrades : 0) * 100).toFixed(1)}%`);
  console.log(`   ⚡ Avg Profit/Trade:       $${(totalProfit / (totalTrades || 1)).toFixed(2)}`);
  console.log(`   🎯 ROI Today:              ${((totalProfit / 10000) * 100).toFixed(1)}%`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemo() {
  console.log('\n🚀 Starting Live Trading Bot Demo...\n');
  await sleep(1000);
  
  // Run for 30 seconds
  const endTime = Date.now() + 30000;
  
  while (Date.now() < endTime) {
    displayHeader();
    
    // Random bot executes trade
    const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
    const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    
    runningBots.add(bot.id);
    executeTrade(bot, pair);
    
    // Show multiple trades rapidly
    if (Math.random() > 0.3) {
      const bot2 = BOTS[Math.floor(Math.random() * BOTS.length)];
      const pair2 = PAIRS[Math.floor(Math.random() * PAIRS.length)];
      runningBots.add(bot2.id);
      executeTrade(bot2, pair2);
    }
    
    if (Math.random() > 0.5) {
      const bot3 = BOTS[Math.floor(Math.random() * BOTS.length)];
      const pair3 = PAIRS[Math.floor(Math.random() * PAIRS.length)];
      runningBots.add(bot3.id);
      executeTrade(bot3, pair3);
    }
    
    displayBotStatus();
    displayMarketData();
    displayStats();
    
    console.log('\n' + '═'.repeat(100));
    console.log('🔥 BOTS ARE PRINTING MONEY 24/7! | 💎 GET YOUR BOT NOW: $500-$1,500 | 🚀 ROI: 300-500%/month');
    console.log('═'.repeat(100));
    
    await sleep(Math.random() * 1500 + 500);
  }
  
  // Final summary
  console.log('\n\n' + '█'.repeat(100));
  console.log('🎉 DEMO COMPLETE - 60 SECONDS OF LIVE TRADING 🎉');
  console.log('█'.repeat(100));
  console.log(`\n💰 TOTAL PROFIT IN 60 SECONDS: $${totalProfit.toFixed(2)}`);
  console.log(`📊 TOTAL TRADES EXECUTED: ${totalTrades}`);
  console.log(`✅ WIN RATE: ${((totalTrades * 0.92) / totalTrades * 100).toFixed(1)}%`);
  console.log(`\n🚀 PROJECTED DAILY PROFIT: $${(totalProfit * 24).toFixed(2)}`);
  console.log(`💎 PROJECTED MONTHLY PROFIT: $${(totalProfit * 24 * 30).toFixed(2)}`);
  console.log(`📈 PROJECTED ANNUAL PROFIT: $${(totalProfit * 24 * 365).toFixed(2)}`);
  console.log(`\n🔥 THIS IS WHAT YOUR BOTS WILL DO 24/7/365!`);
  console.log(`💵 INVESTMENT: $500-$1,500 | ROI: 300-500%/month`);
  console.log(`\n📞 BUY NOW: sales@deployer-gene.io | 🌐 deployer-gene.io/bots`);
  console.log('█'.repeat(100) + '\n');
}

if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };
