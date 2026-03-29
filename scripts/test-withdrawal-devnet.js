#!/usr/bin/env node

/**
 * Devnet Withdrawal Flow Testing
 * Test withdrawal system before mainnet deployment
 */

const { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  Transaction,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');
const fs = require('fs');

const DEVNET_RPC = 'https://api.devnet.solana.com';

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║       🧪 DEVNET WITHDRAWAL FLOW TEST - OMEGA PRIME DAO 🧪   ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

/**
 * Test Stage 1: Setup test accounts
 */
async function stage1_SetupTestAccounts() {
  console.log('📋 STAGE 1: Setup Test Accounts');
  console.log('─'.repeat(65));

  // Create test keypairs
  const treasury = Keypair.generate();
  const recipient = Keypair.generate();
  const signer = Keypair.generate();

  const testAccounts = {
    treasury: {
      pubkey: treasury.publicKey.toBase58(),
      secretKey: Array.from(treasury.secretKey)
    },
    recipient: {
      pubkey: recipient.publicKey.toBase58(),
      secretKey: Array.from(recipient.secretKey)
    },
    signer: {
      pubkey: signer.publicKey.toBase58(),
      secretKey: Array.from(signer.secretKey)
    }
  };

  // Save keypairs
  fs.writeFileSync(
    '.cache/devnet-test-accounts.json',
    JSON.stringify(testAccounts, null, 2)
  );

  console.log('✅ Test accounts created:');
  console.log(`  Treasury:  ${treasury.publicKey.toBase58().slice(0, 16)}...`);
  console.log(`  Recipient: ${recipient.publicKey.toBase58().slice(0, 16)}...`);
  console.log(`  Signer:    ${signer.publicKey.toBase58().slice(0, 16)}...`);
  console.log('\n✅ Saved to: .cache/devnet-test-accounts.json');

  return { treasury, recipient, signer };
}

/**
 * Test Stage 2: Fund test accounts
 */
async function stage2_FundAccounts(accounts) {
  console.log('\n📋 STAGE 2: Fund Test Accounts');
  console.log('─'.repeat(65));

  const connection = new Connection(DEVNET_RPC);

  console.log('⏳ Requesting airdrop for treasury account...');
  
  try {
    // Request airdrop (2 SOL for testing)
    const sig = await connection.requestAirdrop(
      accounts.treasury.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    // Wait for confirmation
    await connection.confirmTransaction(sig);
    
    const balance = await connection.getBalance(accounts.treasury.publicKey);
    console.log(`✅ Airdrop confirmed!`);
    console.log(`   Amount: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
    console.log(`   Signature: ${sig.slice(0, 16)}...`);

    return balance;

  } catch (error) {
    console.error(`❌ Airdrop failed: ${error.message}`);
    console.log('   Note: Devnet airdrop may be rate-limited or unavailable');
    console.log('   Skipping to transaction creation...');
    return 0;
  }
}

/**
 * Test Stage 3: Create withdrawal transaction
 */
async function stage3_CreateWithdrawalTx(accounts, amount = 0.5) {
  console.log('\n📋 STAGE 3: Create Withdrawal Transaction');
  console.log('─'.repeat(65));

  const connection = new Connection(DEVNET_RPC);
  const lamports = amount * LAMPORTS_PER_SOL;

  console.log(`Creating withdrawal transaction...`);
  console.log(`  From: ${accounts.treasury.publicKey.toBase58().slice(0, 16)}...`);
  console.log(`  To:   ${accounts.recipient.publicKey.toBase58().slice(0, 16)}...`);
  console.log(`  Amount: ${amount} SOL (${lamports} lamports)`);

  try {
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();

    // Create transfer instruction
    const instruction = SystemProgram.transfer({
      fromPubkey: accounts.treasury.publicKey,
      toPubkey: accounts.recipient.publicKey,
      lamports
    });

    // Create transaction
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: accounts.treasury.publicKey
    }).add(instruction);

    console.log('\n✅ Transaction created:');
    console.log(`   Blockhash: ${blockhash.slice(0, 16)}...`);
    console.log(`   Instructions: 1 (SystemProgram::transfer)`);
    console.log(`   Fee Payer: ${accounts.treasury.publicKey.toBase58().slice(0, 16)}...`);

    // Save unsigned transaction
    const unsignedTx = {
      type: 'withdrawal',
      timestamp: new Date().toISOString(),
      network: 'devnet',
      from: accounts.treasury.publicKey.toBase58(),
      to: accounts.recipient.publicKey.toBase58(),
      amount: amount,
      lamports: lamports,
      blockhash: blockhash,
      serialized: transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      }).toString('base64')
    };

    fs.writeFileSync(
      '.cache/devnet-unsigned-withdrawal.json',
      JSON.stringify(unsignedTx, null, 2)
    );

    console.log(`\n✅ Unsigned transaction saved: .cache/devnet-unsigned-withdrawal.json`);

    return { transaction, blockhash, lamports };

  } catch (error) {
    console.error(`❌ Error creating transaction: ${error.message}`);
    return null;
  }
}

/**
 * Test Stage 4: Sign and send transaction
 */
async function stage4_SignAndSend(accounts, txData) {
  console.log('\n📋 STAGE 4: Sign and Send Transaction');
  console.log('─'.repeat(65));

  if (!txData) {
    console.log('⚠️  No transaction data. Skipping...');
    return null;
  }

  try {
    const connection = new Connection(DEVNET_RPC);

    // Create fresh transaction from scratch (safer than deserializing)
    const { blockhash } = await connection.getLatestBlockhash();
    
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: accounts.treasury.publicKey
    }).add(
      SystemProgram.transfer({
        fromPubkey: accounts.treasury.publicKey,
        toPubkey: accounts.recipient.publicKey,
        lamports: txData.lamports
      })
    );

    console.log('🔐 Signing transaction...');
    transaction.sign(accounts.treasury);

    console.log('✅ Transaction signed');
    console.log(`   Signer: ${accounts.treasury.publicKey.toBase58().slice(0, 16)}...`);

    // Serialize signed transaction
    const rawTransaction = transaction.serialize();

    // Send transaction
    console.log('\n📤 Sending to devnet...');
    const signature = await connection.sendRawTransaction(rawTransaction);

    console.log(`✅ Transaction sent!`);
    console.log(`   Signature: ${signature}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    return signature;

  } catch (error) {
    console.error(`❌ Error signing/sending: ${error.message}`);
    return null;
  }
}

/**
 * Test Stage 5: Confirm transaction
 */
async function stage5_ConfirmTransaction(signature) {
  console.log('\n📋 STAGE 5: Confirm Transaction');
  console.log('─'.repeat(65));

  if (!signature) {
    console.log('⚠️  No signature to confirm. Skipping...');
    return null;
  }

  try {
    const connection = new Connection(DEVNET_RPC);

    console.log('⏳ Waiting for confirmation...');
    console.log(`   Signature: ${signature.slice(0, 20)}...`);

    const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    if (confirmation.value.err) {
      console.error(`❌ Transaction failed: ${confirmation.value.err}`);
      return false;
    }

    console.log(`✅ Transaction confirmed!`);
    console.log(`   Slot: ${confirmation.context.slot}`);

    // Get transaction details
    const tx = await connection.getTransaction(signature);
    if (tx) {
      console.log(`   Block Time: ${new Date(tx.blockTime * 1000).toISOString()}`);
      console.log(`   Status: ${tx.meta?.err ? 'FAILED' : 'SUCCESS'}`);
    }

    return true;

  } catch (error) {
    console.error(`❌ Error confirming: ${error.message}`);
    return false;
  }
}

/**
 * Test Stage 6: Verify balances
 */
async function stage6_VerifyBalances(accounts, originalBalance, amountSent) {
  console.log('\n📋 STAGE 6: Verify Final Balances');
  console.log('─'.repeat(65));

  try {
    const connection = new Connection(DEVNET_RPC);

    const treasuryBalance = await connection.getBalance(accounts.treasury.publicKey);
    const recipientBalance = await connection.getBalance(accounts.recipient.publicKey);

    const treasurySOL = treasuryBalance / LAMPORTS_PER_SOL;
    const recipientSOL = recipientBalance / LAMPORTS_PER_SOL;

    console.log('Final Balances:');
    console.log(`  Treasury:  ${treasurySOL.toFixed(4)} SOL`);
    console.log(`  Recipient: ${recipientSOL.toFixed(4)} SOL`);

    if (recipientSOL >= amountSent) {
      console.log(`\n✅ Withdrawal successful!`);
      console.log(`   Expected: ${amountSent.toFixed(4)} SOL`);
      console.log(`   Received: ${recipientSOL.toFixed(4)} SOL`);
      return true;
    } else {
      console.log(`\n⚠️  Withdrawal incomplete or failed`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error verifying balances: ${error.message}`);
    return false;
  }
}

/**
 * Full test flow
 */
async function runFullTest() {
  console.log(`Network: Solana Devnet (${DEVNET_RPC})\n`);

  try {
    // Stage 1: Setup
    const accounts = await stage1_SetupTestAccounts();

    // Stage 2: Fund
    const balance = await stage2_FundAccounts(accounts);

    // Stage 3: Create transaction
    const txData = await stage3_CreateWithdrawalTx(accounts, 0.5);

    if (!txData) {
      console.log('\n❌ Test stopped at stage 3');
      printTestSummary(false, 3);
      return;
    }

    // Stage 4: Sign and send
    const signature = await stage4_SignAndSend(accounts, txData);

    if (!signature) {
      console.log('\n❌ Test stopped at stage 4');
      printTestSummary(false, 4);
      return;
    }

    // Stage 5: Confirm
    const confirmed = await stage5_ConfirmTransaction(signature);

    if (!confirmed) {
      console.log('\n❌ Test stopped at stage 5');
      printTestSummary(false, 5);
      return;
    }

    // Stage 6: Verify
    const verified = await stage6_VerifyBalances(accounts, balance, 0.5);

    printTestSummary(verified, 6);

  } catch (error) {
    console.error(`\n❌ Test failed with error: ${error.message}`);
    printTestSummary(false, 0);
  }
}

/**
 * Print test summary
 */
function printTestSummary(success, completedStages) {
  console.log('\n' + '═'.repeat(65));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(65));

  const stages = [
    'Setup Accounts',
    'Fund Accounts',
    'Create Transaction',
    'Sign & Send',
    'Confirm',
    'Verify Balances'
  ];

  stages.forEach((stage, i) => {
    const isCompleted = i < completedStages;
    const isCurrent = i === completedStages - 1 && !success;
    const status = isCompleted && success ? '✅' : isCurrent ? '⚠️' : '⏭️';
    console.log(`${status} ${i + 1}. ${stage}`);
  });

  console.log('\n' + '─'.repeat(65));
  if (success) {
    console.log('✅ DEVNET WITHDRAWAL TEST PASSED!');
    console.log('\n✨ Your withdrawal system is ready for mainnet deployment.');
  } else {
    console.log(`⚠️  Test completed ${completedStages} of 6 stages`);
    console.log('\n💡 Review output above for errors and adjust as needed.');
  }

  console.log('\n📁 Test files:');
  console.log('   • .cache/devnet-test-accounts.json');
  console.log('   • .cache/devnet-unsigned-withdrawal.json');

  console.log('\n🔗 Next steps:');
  console.log('   1. Review test output');
  console.log('   2. Adjust withdrawal limits if needed');
  console.log('   3. Deploy multi-sig system (src/mpc/)');
  console.log('   4. Test on mainnet with real withdrawal');

  console.log('\n');
}

// Run test
runFullTest().catch(console.error);
