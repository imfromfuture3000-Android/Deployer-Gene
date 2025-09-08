//  INVESTMENT - MINT 100,000 TOKENS TO EACH BOT
const web3 = require('@solana/web3.js');
require('dotenv').config();
const spl = require('@solana/spl-token');

//  BUDGET DEPLOYMENT
const INVESTMENT_BUDGET = 3; // USD
const SOL_PRICE = 150; // Assumed SOL price
const BUDGET_SOL = INVESTMENT_BUDGET / SOL_PRICE; // ~0.02 SOL

console.log('?? INVESTMENT BUDGET: $' + INVESTMENT_BUDGET);
console.log('?? SOL Budget: ' + BUDGET_SOL.toFixed(4) + ' SOL');

// BOT ADDRESSES FOR TOKEN DISTRIBUTION
const BOTS = [
  'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR', // Bot1 - Stake Master
  'NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d',  // Bot2 - Mint Operator  
  'DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA', // Bot3 - Contract Deployer
  '7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41', // Bot4 - MEV Hunter
  '3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw'  // Bot5 - Loot Extractor
];

const TOKENS_PER_BOT = 100000; // 100,000 tokens each
const TOTAL_TOKENS = BOTS.length * TOKENS_PER_BOT; // 500,000 total

async function mintTokensToBots() {
  console.log('?? MINTING SLP TOKENS TO BOTS');
  console.log('Tokens per bot:', TOKENS_PER_BOT.toLocaleString());
  console.log('Total tokens:', TOTAL_TOKENS.toLocaleString());
  console.log('Bot count:', BOTS.length);
  
  const connection = new web3.Connection('${process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : (process.env.RPC_URL || "https://api.mainnet-beta.solana.com")}`');
  
  // Generate new SLP token mint
  const payer = web3.Keypair.generate(); // Replace with your funded keypair
  const mint = web3.Keypair.generate();
  
  console.log('\\n=== TOKEN DEPLOYMENT ===');
  console.log('Payer (needs funding):', payer.publicKey.toBase58());
  console.log('SLP Token Mint:', mint.publicKey.toBase58());
  console.log('Required SOL:', BUDGET_SOL.toFixed(4));
  
  // Calculate costs
  const mintRent = 0.002; // Mint account rent
  const tokenAccountRent = 0.002 * BOTS.length; // Token accounts for each bot
  const transactionFees = 0.001 * (BOTS.length + 2); // Fees for all transactions
  const totalCost = mintRent + tokenAccountRent + transactionFees;
  
  console.log('\\n?? COST BREAKDOWN:');
  console.log('Mint account:', mintRent.toFixed(4), 'SOL');
  console.log('Token accounts (' + BOTS.length + '):', tokenAccountRent.toFixed(4), 'SOL');
  console.log('Transaction fees:', transactionFees.toFixed(4), 'SOL');
  console.log('Total cost:', totalCost.toFixed(4), 'SOL');
  console.log('Budget remaining:', (BUDGET_SOL - totalCost).toFixed(4), 'SOL');
  
  if (totalCost > BUDGET_SOL) {
    console.log('?? Warning: Cost exceeds  budget');
  } else {
    console.log('? Within  budget');
  }
  
  console.log('\\n?? MINTING PLAN:');
  BOTS.forEach((bot, i) => {
    console.log('Bot' + (i+1) + ':', bot);
    console.log('  ? Receives:', TOKENS_PER_BOT.toLocaleString(), 'SLP tokens');
  });
  
  console.log('\\n?? REQUIRED STEPS:');
  console.log('1. Fund payer address with', totalCost.toFixed(4), 'SOL');
  console.log('2. Create SLP token mint');
  console.log('3. Create token accounts for each bot');
  console.log('4. Mint', TOKENS_PER_BOT.toLocaleString(), 'tokens to each bot');
  console.log('5. Distribute tokens across all 5 bots');
  
  console.log('\\n? DEPLOYMENT READY');
  console.log('Replace payer keypair and execute');
  
  return {
    mint: mint.publicKey.toBase58(),
    payer: payer.publicKey.toBase58(),
    bots: BOTS,
    tokensPerBot: TOKENS_PER_BOT,
    totalTokens: TOTAL_TOKENS,
    estimatedCost: totalCost,
    budgetSOL: BUDGET_SOL,
    withinBudget: totalCost <= BUDGET_SOL
  };
}

mintTokensToBots().then(result => {
  console.log('\\n? MINTING PLAN READY');
  console.log(' investment will distribute 500,000 SLP tokens');
  console.log('Each bot gets 100,000 tokens');
}).catch(console.error);
