#!/usr/bin/env node

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

let profit = 0;
let trades = 0;
let wins = 0;

const glitch = (text) => {
  const chars = '█▓▒░▄▀■□▪▫';
  return Math.random() > 0.7 ? chars[Math.floor(Math.random() * chars.length)] + text : text;
};

const flash = () => Math.random() > 0.5 ? COLORS.bright : '';

const screen = () => {
  console.clear();
  const winRate = trades > 0 ? ((wins / trades) * 100).toFixed(1) : 0;
  
  console.log(COLORS.cyan + '╔' + '═'.repeat(118) + '╗' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.yellow + flash() + '  ⚡ LIVE TRADING MONITOR - ULTRA HIGH FREQUENCY ⚡  '.padEnd(118) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '╠' + '═'.repeat(118) + '╣' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.green + flash() + `  💰 PROFIT: $${profit.toFixed(2)}`.padEnd(40) + COLORS.yellow + `📊 TRADES: ${trades}`.padEnd(40) + COLORS.magenta + flash() + `✅ WIN RATE: ${winRate}%`.padEnd(38) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '╚' + '═'.repeat(118) + '╝' + COLORS.reset);
};

const trade = (pair, entry, exit, amount, isWin) => {
  const p = (Math.random() * 800 + 100).toFixed(2);
  profit += isWin ? parseFloat(p) : -parseFloat(p) * 0.3;
  trades++;
  if (isWin) wins++;
  
  const status = isWin ? COLORS.green + '✅ WIN ' : COLORS.red + '⚠️ LOSS';
  const profitStr = isWin ? COLORS.green + `+$${p}` : COLORS.red + `-$${(parseFloat(p) * 0.3).toFixed(2)}`;
  
  console.log(
    COLORS.cyan + '│' + COLORS.reset +
    flash() + glitch(` ${pair}`.padEnd(12)) +
    COLORS.yellow + `${entry}→${exit}`.padEnd(20) +
    COLORS.cyan + `${amount}`.padEnd(10) +
    status + COLORS.reset + '  ' +
    profitStr + COLORS.reset +
    COLORS.cyan + ' │' + COLORS.reset
  );
};

const monitor = () => {
  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ETC/USDT'];
  const pair = pairs[Math.floor(Math.random() * pairs.length)];
  const entry = (Math.random() * 50000 + 1000).toFixed(2);
  const exit = (parseFloat(entry) * (1 + Math.random() * 0.03)).toFixed(2);
  const amount = (Math.random() * 2 + 0.1).toFixed(4);
  const isWin = Math.random() > 0.08;
  
  trade(pair, entry, exit, amount, isWin);
};

const winRateBar = () => {
  const winRate = trades > 0 ? (wins / trades) : 0;
  const bars = Math.floor(winRate * 50);
  const bar = COLORS.green + '█'.repeat(bars) + COLORS.red + '░'.repeat(50 - bars) + COLORS.reset;
  console.log(COLORS.cyan + '╔' + '═'.repeat(118) + '╗' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.yellow + flash() + `  WIN RATE: ${(winRate * 100).toFixed(1)}% ${bar}`.padEnd(130) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '╚' + '═'.repeat(118) + '╝' + COLORS.reset);
};

const stats = () => {
  console.log(COLORS.cyan + '\n╔' + '═'.repeat(118) + '╗' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.magenta + flash() + '  📊 20-SECOND CYCLE STATS'.padEnd(118) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '╠' + '═'.repeat(118) + '╣' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.green + `  💵 Total Profit: $${profit.toFixed(2)}`.padEnd(118) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.yellow + `  📈 Total Trades: ${trades}`.padEnd(118) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.green + `  ✅ Wins: ${wins}`.padEnd(118) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.red + `  ❌ Losses: ${trades - wins}`.padEnd(118) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.magenta + flash() + `  🎯 Win Rate: ${trades > 0 ? ((wins / trades) * 100).toFixed(1) : 0}%`.padEnd(118) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.cyan + `  ⚡ Avg Profit/Trade: $${(profit / (trades || 1)).toFixed(2)}`.padEnd(118) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '╚' + '═'.repeat(118) + '╝' + COLORS.reset);
};

const projection = () => {
  const hourly = profit * 180;
  const daily = hourly * 24;
  const monthly = daily * 30;
  
  console.log(COLORS.yellow + '\n╔' + '═'.repeat(118) + '╗' + COLORS.reset);
  console.log(COLORS.yellow + '║' + COLORS.green + flash() + '  🚀 PROFIT PROJECTIONS'.padEnd(118) + COLORS.yellow + '║' + COLORS.reset);
  console.log(COLORS.yellow + '╠' + '═'.repeat(118) + '╣' + COLORS.reset);
  console.log(COLORS.yellow + '║' + COLORS.green + flash() + `  📊 Per Hour:   $${hourly.toFixed(2)}`.padEnd(118) + COLORS.yellow + '║' + COLORS.reset);
  console.log(COLORS.yellow + '║' + COLORS.green + flash() + `  📊 Per Day:    $${daily.toFixed(2)}`.padEnd(118) + COLORS.yellow + '║' + COLORS.reset);
  console.log(COLORS.yellow + '║' + COLORS.green + flash() + `  📊 Per Month:  $${monthly.toFixed(2)}`.padEnd(118) + COLORS.yellow + '║' + COLORS.reset);
  console.log(COLORS.yellow + '╚' + '═'.repeat(118) + '╝' + COLORS.reset);
};

const cta = () => {
  console.log(COLORS.magenta + '\n╔' + '═'.repeat(118) + '╗' + COLORS.reset);
  console.log(COLORS.magenta + '║' + COLORS.yellow + flash() + '  🔥 GET YOUR BOT NOW! | 💎 PRICE: $500-$1,500 | 📈 ROI: 300-500%/month | ⚡ 24/7 AUTOMATED'.padEnd(130) + COLORS.magenta + '║' + COLORS.reset);
  console.log(COLORS.magenta + '╚' + '═'.repeat(118) + '╝' + COLORS.reset);
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run20SecCycle() {
  profit = 0;
  trades = 0;
  wins = 0;
  
  screen();
  console.log(COLORS.cyan + '\n╔' + '═'.repeat(118) + '╗' + COLORS.reset);
  console.log(COLORS.cyan + '║' + COLORS.yellow + flash() + '  ⚡ LIVE TRADES - 20 SECOND CYCLE ⚡'.padEnd(118) + COLORS.cyan + '║' + COLORS.reset);
  console.log(COLORS.cyan + '╠' + '═'.repeat(118) + '╣' + COLORS.reset);
  
  const endTime = Date.now() + 20000;
  
  while (Date.now() < endTime) {
    monitor();
    if (Math.random() > 0.4) monitor();
    if (Math.random() > 0.6) monitor();
    
    await sleep(Math.random() * 300 + 100);
    
    if (trades % 10 === 0) {
      console.log(COLORS.cyan + '╠' + '═'.repeat(118) + '╣' + COLORS.reset);
      screen();
      console.log(COLORS.cyan + '╠' + '═'.repeat(118) + '╣' + COLORS.reset);
    }
  }
  
  console.log(COLORS.cyan + '╚' + '═'.repeat(118) + '╝' + COLORS.reset);
  
  winRateBar();
  stats();
  projection();
  cta();
}

async function main() {
  console.log(COLORS.green + '\n🚀 STARTING GLITCH TRADING MONITOR...\n' + COLORS.reset);
  await sleep(1000);
  
  for (let cycle = 1; cycle <= 3; cycle++) {
    console.log(COLORS.magenta + `\n${'█'.repeat(120)}` + COLORS.reset);
    console.log(COLORS.yellow + flash() + `  🔥 CYCLE ${cycle}/3 - 20 SECONDS OF PURE PROFIT 🔥` + COLORS.reset);
    console.log(COLORS.magenta + `${'█'.repeat(120)}\n` + COLORS.reset);
    
    await run20SecCycle();
    
    if (cycle < 3) {
      await sleep(2000);
    }
  }
  
  console.log(COLORS.green + '\n\n' + '█'.repeat(120) + COLORS.reset);
  console.log(COLORS.yellow + flash() + '  🎉 DEMO COMPLETE - 3 CYCLES × 20 SECONDS = 60 SECONDS TOTAL 🎉' + COLORS.reset);
  console.log(COLORS.green + '█'.repeat(120) + '\n' + COLORS.reset);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { run20SecCycle };
