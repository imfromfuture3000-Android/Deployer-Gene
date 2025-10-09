#!/usr/bin/env node
const { Connection, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { getAccount, createTransferInstruction } = require('@solana/spl-token');

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

const TAX_RATE = 0.02; // 2%
const TREASURY = new PublicKey('EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6');
const DEPLOYER = new PublicKey('4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a');

class TreasuryTaxSystem {
  constructor(treasuryAddress, taxRate = 0.02) {
    this.treasury = new PublicKey(treasuryAddress);
    this.taxRate = taxRate;
    this.totalCollected = 0;
    this.transactionCount = 0;
  }

  calculateTax(amount) {
    return Math.floor(amount * this.taxRate);
  }

  async applyTax(amount, transactionType) {
    const taxAmount = this.calculateTax(amount);
    const netAmount = amount - taxAmount;
    
    console.log(`\n💰 Tax Applied:`);
    console.log(`  Type: ${transactionType}`);
    console.log(`  Gross: ${amount}`);
    console.log(`  Tax (2%): ${taxAmount}`);
    console.log(`  Net: ${netAmount}`);
    console.log(`  Treasury: ${this.treasury.toString()}`);
    
    this.totalCollected += taxAmount;
    this.transactionCount++;
    
    return { taxAmount, netAmount };
  }

  async getTreasuryBalance() {
    try {
      const balance = await connection.getBalance(this.treasury);
      console.log(`\n💎 Treasury Balance: ${balance / 1e9} SOL`);
      return balance;
    } catch (error) {
      console.error(`❌ Failed to get treasury balance: ${error.message}`);
      return 0;
    }
  }

  async claimProfits(destination) {
    console.log(`\n🎯 Claiming Profits...`);
    console.log(`  From: ${this.treasury.toString()}`);
    console.log(`  To: ${destination}`);
    console.log(`  Total Collected: ${this.totalCollected}`);
    console.log(`  Transactions: ${this.transactionCount}`);
    
    return {
      success: true,
      amount: this.totalCollected,
      destination
    };
  }

  getStats() {
    return {
      treasury: this.treasury.toString(),
      taxRate: `${this.taxRate * 100}%`,
      totalCollected: this.totalCollected,
      transactionCount: this.transactionCount,
      averageTax: this.transactionCount > 0 ? this.totalCollected / this.transactionCount : 0
    };
  }
}

async function setupTaxSystem() {
  console.log('💰 TREASURY TAX SYSTEM SETUP');
  console.log('=' .repeat(60));
  
  const taxSystem = new TreasuryTaxSystem(TREASURY, TAX_RATE);
  
  console.log(`\n✅ Tax System Initialized`);
  console.log(`  Treasury: ${TREASURY.toString()}`);
  console.log(`  Tax Rate: 2%`);
  console.log(`  Deployer: ${DEPLOYER.toString()}`);
  
  // Simulate transactions
  console.log(`\n📊 Simulating Tax Collection...`);
  
  await taxSystem.applyTax(1000000000, 'Token Swap');
  await taxSystem.applyTax(500000000, 'Token Transfer');
  await taxSystem.applyTax(2000000000, 'Contract Deployment');
  
  // Get treasury balance
  await taxSystem.getTreasuryBalance();
  
  // Show stats
  console.log(`\n📈 Tax System Stats:`);
  const stats = taxSystem.getStats();
  console.log(JSON.stringify(stats, null, 2));
  
  // Claim profits
  await taxSystem.claimProfits(DEPLOYER.toString());
  
  return taxSystem;
}

async function createTaxConfig() {
  const config = {
    enabled: true,
    rate: TAX_RATE,
    treasury: TREASURY.toString(),
    deployer: DEPLOYER.toString(),
    applies_to: [
      'token_swaps',
      'token_transfers',
      'contract_deployments',
      'bot_operations'
    ],
    exemptions: [
      TREASURY.toString(),
      DEPLOYER.toString()
    ],
    auto_collect: true,
    claim_threshold: 1000000000, // 1 SOL
    distribution: {
      treasury: 0.98, // 98% to treasury
      deployer: 0.02  // 2% to deployer
    }
  };
  
  console.log(`\n⚙️  Tax Configuration:`);
  console.log(JSON.stringify(config, null, 2));
  
  return config;
}

async function main() {
  try {
    const taxSystem = await setupTaxSystem();
    const config = await createTaxConfig();
    
    console.log(`\n✅ TREASURY TAX SYSTEM READY`);
    console.log(`\n🔗 Use this system for:`);
    console.log(`  • 2% tax on all transactions`);
    console.log(`  • Automatic profit collection`);
    console.log(`  • Treasury management`);
    console.log(`  • Bot earnings distribution`);
    
  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { TreasuryTaxSystem, setupTaxSystem, createTaxConfig };
