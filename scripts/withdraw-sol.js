#!/usr/bin/env node

/**
 * DAO Treasury Withdrawal Manager
 * Handle SOL withdrawals from Omega Prime DAO treasury
 */

const { Connection, Keypair, PublicKey, SystemProgram, Transaction } = require('@solana/web3.js');
const fs = require('fs');

// Load env from .env if available
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.includes('=')) {
      const [key, value] = line.split('=');
      if (key && value) process.env[key.trim()] = value.trim();
    }
  });
} catch (e) {
  // .env not found, continue with defaults
}

// Configuration
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const HELIUS_RPC = process.env.HELIUS_RPC_URL || RPC_URL;

// Treasury addresses
const TREASURY_ADDRESS = process.env.TREASURY_PUBKEY || 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
const WITHDRAWAL_DESTINATION = process.env.WITHDRAWAL_ADDRESS || TREASURY_ADDRESS;

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║         💸 DAO TREASURY WITHDRAWAL MANAGER 💸              ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

/**
 * Get SOL balance for an address
 */
async function getBalance(address) {
  try {
    const connection = new Connection(HELIUS_RPC);
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error(`❌ Error fetching balance for ${address}:`, error.message);
    return 0;
  }
}

/**
 * Get treasury balance from deployment data
 */
function getTreasuryFromDeployment() {
  try {
    const deployment = JSON.parse(
      fs.readFileSync('.cache/node-votes-nft-bots-deployment.json', 'utf8')
    );
    
    const dailyEarnings = parseFloat(deployment.deployment.earnings.totalDaily);
    const monthlyAccumulation = dailyEarnings * 30;
    
    return {
      dailyEarnings,
      estimatedMonthly: monthlyAccumulation,
      lastDeployment: deployment.timestamp
    };
  } catch (error) {
    console.error('❌ Error reading deployment data:', error.message);
    return null;
  }
}

/**
 * Create withdrawal transaction
 */
async function createWithdrawal(fromAddress, toAddress, amountSOL) {
  try {
    console.log('\n📝 CREATING WITHDRAWAL TRANSACTION');
    console.log('─'.repeat(65));
    
    const connection = new Connection(HELIUS_RPC);
    
    // Validate addresses
    try {
      new PublicKey(fromAddress);
      new PublicKey(toAddress);
    } catch (e) {
      throw new Error(`Invalid Solana address: ${e.message}`);
    }
    
    const fromPubkey = new PublicKey(fromAddress);
    const toPubkey = new PublicKey(toAddress);
    const lamports = amountSOL * 1e9;
    
    // Create transfer instruction
    const instruction = SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports
    });
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    
    // Create transaction
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromPubkey
    }).add(instruction);
    
    console.log(`From: ${fromAddress.slice(0, 8)}...${fromAddress.slice(-8)}`);
    console.log(`To: ${toAddress.slice(0, 8)}...${toAddress.slice(-8)}`);
    console.log(`Amount: ${amountSOL} SOL`);
    console.log(`Estimated Fee: ~0.00025 SOL`);
    console.log(`\nTransaction created successfully ✅`);
    console.log(`\n⚠️  REQUIRES SIGNER: This transaction needs to be signed with the treasury key.`);
    
    // Save transaction for signing
    const txData = {
      timestamp: new Date().toISOString(),
      type: 'withdrawal',
      from: fromAddress,
      to: toAddress,
      amount: amountSOL,
      transaction: transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      }).toString('base64'),
      blockhash,
      instructions: [{
        program: 'system',
        action: 'transfer',
        amount_lamports: lamports
      }]
    };
    
    fs.writeFileSync(
      '.cache/pending-withdrawal.json',
      JSON.stringify(txData, null, 2)
    );
    
    console.log('\n✅ Transaction saved to: .cache/pending-withdrawal.json');
    return txData;
    
  } catch (error) {
    console.error('❌ Error creating withdrawal:', error.message);
    return null;
  }
}

/**
 * Parse withdrawal instructions
 */
function parseWithdrawalAmount(input) {
  if (input.toLowerCase() === 'all' || input === '*') {
    return null; // Signal to use max available
  }
  
  const amount = parseFloat(input);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount');
  }
  
  return amount;
}

/**
 * Main withdrawal flow
 */
async function withdrawalFlow() {
  console.log('\n📊 TREASURY STATUS');
  console.log('─'.repeat(65));
  
  // Get deployment earnings data
  const deploymentData = getTreasuryFromDeployment();
  
  if (deploymentData) {
    console.log(`Daily Earnings: ${deploymentData.dailyEarnings} SOL`);
    console.log(`Estimated Monthly: ${deploymentData.estimatedMonthly.toFixed(2)} SOL`);
    console.log(`Last Deployment: ${deploymentData.lastDeployment}`);
  }
  
  // Get actual on-chain balance
  console.log('\n🔍 FETCHING ON-CHAIN BALANCE...');
  const onChainBalance = await getBalance(TREASURY_ADDRESS);
  console.log(`\nOn-Chain Balance: ${onChainBalance.toFixed(2)} SOL`);
  
  if (onChainBalance === 0) {
    console.log('⚠️  No balance found at treasury address.');
    console.log('ℹ️  Note: Ensure the treasury address has SOL in it.');
    return;
  }
  
  console.log('\n' + '─'.repeat(65));
  console.log('💡 WITHDRAWAL OPTIONS:');
  console.log('─'.repeat(65));
  console.log(`\n1. Withdraw 50% (~${(onChainBalance * 0.5).toFixed(2)} SOL)`);
  console.log(`2. Withdraw 100% (~${onChainBalance.toFixed(2)} SOL)`);
  console.log(`3. Custom amount`);
  console.log(`4. Exit\n`);
  
  // For automation: demonstrate one withdrawal scenario
  const demoWithdrawalAmount = Math.min(10, onChainBalance * 0.5); // 50% or 10 SOL max
  
  if (onChainBalance >= demoWithdrawalAmount) {
    console.log(`📤 DEMO: Creating withdrawal of ${demoWithdrawalAmount.toFixed(2)} SOL...`);
    await createWithdrawal(TREASURY_ADDRESS, WITHDRAWAL_DESTINATION, demoWithdrawalAmount);
  } else {
    console.log(`⚠️  Insufficient balance for demo withdrawal.`);
  }
}

/**
 * Manual withdrawal (requires private key)
 */
async function executeWithdrawalWithKey(fromAddress, toAddress, amountSOL, privateKeyPath) {
  try {
    console.log('\n🔐 EXECUTING WITHDRAWAL WITH PRIVATE KEY');
    console.log('─'.repeat(65));
    
    if (!fs.existsSync(privateKeyPath)) {
      throw new Error(`Private key file not found: ${privateKeyPath}`);
    }
    
    // Load keypair
    const keyData = fs.readFileSync(privateKeyPath, 'utf8');
    const keyBuffer = Buffer.from(keyData.trim(), 'base64');
    const keypair = Keypair.fromSecretKey(keyBuffer);
    
    console.log(`Signer: ${keypair.publicKey.toBase58().slice(0, 8)}...`);
    
    // Create and sign transaction
    const connection = new Connection(HELIUS_RPC);
    const { blockhash } = await connection.getLatestBlockhash();
    
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: keypair.publicKey
    }).add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports: amountSOL * 1e9
      })
    );
    
    transaction.sign(keypair);
    
    // Send transaction
    console.log('\n📤 Sending transaction...');
    const signature = await connection.sendRawTransaction(transaction.serialize());
    
    console.log(`✅ Transaction sent!`);
    console.log(`Signature: ${signature}`);
    console.log(`Explorer: https://explorer.solana.com/tx/${signature}?cluster=mainnet`);
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature);
    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
      return false;
    }
    
    console.log('✅ Transaction confirmed!');
    
    // Log withdrawal
    const log = {
      timestamp: new Date().toISOString(),
      type: 'withdrawal',
      from: fromAddress,
      to: toAddress,
      amount: amountSOL,
      signature,
      status: 'confirmed'
    };
    
    fs.appendFileSync(
      '.cache/withdrawal-history.json',
      JSON.stringify(log, null, 2) + '\n'
    );
    
    return true;
    
  } catch (error) {
    console.error('❌ Error executing withdrawal:', error.message);
    return false;
  }
}

/**
 * Show withdrawal history
 */
function showWithdrawalHistory() {
  console.log('\n📜 WITHDRAWAL HISTORY');
  console.log('─'.repeat(65));
  
  if (!fs.existsSync('.cache/withdrawal-history.json')) {
    console.log('No withdrawal history found.');
    return;
  }
  
  const lines = fs.readFileSync('.cache/withdrawal-history.json', 'utf8').trim().split('\n');
  
  if (lines.length === 0) {
    console.log('No withdrawals recorded.');
    return;
  }
  
  let totalWithdrawn = 0;
  lines.forEach((line, i) => {
    try {
      const entry = JSON.parse(line);
      totalWithdrawn += entry.amount;
      console.log(`\n${i + 1}. ${entry.timestamp}`);
      console.log(`   Amount: ${entry.amount} SOL`);
      console.log(`   To: ${entry.to.slice(0, 8)}...`);
      console.log(`   Status: ${entry.status}`);
    } catch (e) {
      // Skip invalid lines
    }
  });
  
  console.log(`\n─'.repeat(65)`);
  console.log(`Total Withdrawn: ${totalWithdrawn.toFixed(2)} SOL`);
}

/**
 * Print usage instructions
 */
function printUsage() {
  console.log(`
Usage:
  node withdraw-sol.js [options]
  
Options:
  balance              Show current treasury balance
  withdraw <amount>    Create withdrawal (requires manual signing)
  execute <amount>     Execute withdrawal with private key
  history              Show withdrawal history
  
Environment Variables:
  SOLANA_RPC_URL       Solana RPC endpoint (default: mainnet)
  HELIUS_RPC_URL       Helius RPC endpoint (faster)
  TREASURY_PUBKEY      Treasury address (default: deployer)
  WITHDRAWAL_ADDRESS   Destination for withdrawals
  
Example:
  # Check balance
  node withdraw-sol.js balance
  
  # Create withdrawal (unsigned)
  node withdraw-sol.js withdraw 100
  
  # Execute withdrawal (needs private key)
  node withdraw-sol.js execute 100
  
  # Show history
  node withdraw-sol.js history
`);
}

/**
 * CLI Entry Point
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    await withdrawalFlow();
  } else {
    const command = args[0].toLowerCase();
    
    switch (command) {
      case 'balance':
        const bal = await getBalance(TREASURY_ADDRESS);
        console.log(`\n💰 Treasury Balance: ${bal.toFixed(2)} SOL`);
        console.log(`Address: ${TREASURY_ADDRESS}`);
        break;
        
      case 'withdraw':
        if (args[1]) {
          const amount = parseFloat(args[1]);
          if (isNaN(amount) || amount <= 0) {
            console.error('❌ Invalid amount');
            break;
          }
          await createWithdrawal(TREASURY_ADDRESS, WITHDRAWAL_DESTINATION, amount);
        } else {
          console.error('Usage: withdraw-sol.js withdraw <amount>');
        }
        break;
        
      case 'execute':
        if (args[1]) {
          const amount = parseFloat(args[1]);
          const keyPath = args[2] || '.deployer.key';
          if (isNaN(amount) || amount <= 0) {
            console.error('❌ Invalid amount');
            break;
          }
          await executeWithdrawalWithKey(TREASURY_ADDRESS, WITHDRAWAL_DESTINATION, amount, keyPath);
        } else {
          console.error('Usage: withdraw-sol.js execute <amount> [key-path]');
        }
        break;
        
      case 'history':
        showWithdrawalHistory();
        break;
        
      case 'help':
      case '--help':
      case '-h':
        printUsage();
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
    }
  }
  
  console.log('\n');
}

main().catch(console.error);
