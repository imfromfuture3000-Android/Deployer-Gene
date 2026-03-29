/**
 * HELIUS PAGINATION EXAMPLES & TESTS
 * Demonstrates all pagination methods with real-world use cases
 */

require('dotenv').config({ path: '/workspaces/Deployer-Gene/.env.local' });

const HeliusPaginationClient = require('./helius-pagination');

// Initialize client
const helius = new HeliusPaginationClient({
  apiKey: process.env.HELIUS_API_KEY,
  debug: true,
  maxRetries: 3,
  rateLimit: 50
});

// Listen to events
helius.on('log', ({ level, message, data }) => {
  console.log(`📡 [${level}] ${message}`, data);
});

helius.on('page', ({ pageCount, itemsInPage, endpoint }) => {
  console.log(`📄 Page ${pageCount} | ${itemsInPage} items | ${endpoint}`);
});

helius.on('tokens', ({ walletAddress, count, total }) => {
  console.log(`💰 Fetched ${count} tokens (Total: ${total}) for ${walletAddress.slice(0, 8)}...`);
});

helius.on('transactions', ({ walletAddress, count, total }) => {
  console.log(`📊 Fetched ${count} transactions (Total: ${total}) for ${walletAddress.slice(0, 8)}...`);
});

helius.on('accounts', ({ programAddress, page, pageSize, totalFetched }) => {
  console.log(`🔧 Program page ${page}: ${pageSize} accounts (Total: ${totalFetched})`);
});

helius.on('nfts', ({ collection, pageSize, total }) => {
  console.log(`🖼️  NFT page fetched: ${pageSize} items (Total: ${total})`);
});

helius.on('batch', ({ batchIndex, batchSize }) => {
  console.log(`⚙️  Batch ${batchIndex}: ${batchSize} items processed`);
});

/**
 * EXAMPLE 1: FETCH ALL TOKEN BALANCES
 */
async function example1_TokenBalances() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 1: GET ALL TOKEN BALANCES');
  console.log('='.repeat(80));

  try {
    // Replace with real wallet address
    const testWallet = 'ALbZwZfFyVA5iNPsKfZhfCuXJXmf3YgXvFvVF8vYJvMT'; // Example
    
    console.log(`\n📍 Fetching balances for: ${testWallet}`);
    
    const balances = await helius.getTokenBalances(testWallet, {
      includeNative: true,
      maxPages: 10
    });

    console.log(`\n✅ RESULT:`, {
      totalTokens: balances.tokens.length,
      nativeBalance: balances.native,
      topTokens: balances.tokens.slice(0, 5).map(t => ({
        mint: t.mint.slice(0, 8) + '...',
        amount: t.amount,
        decimals: t.decimals
      }))
    });

    return balances;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * EXAMPLE 2: FETCH TRANSACTION HISTORY WITH PAGINATION
 */
async function example2_TransactionHistory() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 2: GET TRANSACTION HISTORY');
  console.log('='.repeat(80));

  try {
    const testWallet = 'ALbZwZfFyVA5iNPsKfZhfCuXJXmf3YgXvFvVF8vYJvMT'; // Example
    
    console.log(`\n📍 Fetching transactions for: ${testWallet}`);
    
    const txHistory = await helius.getTransactionHistory(testWallet, {
      limit: 100,
      maxPages: 5
    });

    console.log(`\n✅ RESULT:`, {
      totalTransactions: txHistory.totalCount,
      transactionTypes: txHistory.types,
      recentTx: txHistory.transactions.slice(0, 3).map(tx => ({
        signature: tx.signature?.slice(0, 8) + '...',
        type: tx.type,
        timestamp: tx.timestamp
      }))
    });

    return txHistory;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * EXAMPLE 3: GET PROGRAM ACCOUNTS
 */
async function example3_ProgramAccounts() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 3: GET PROGRAM ACCOUNTS');
  console.log('='.repeat(80));

  try {
    // Raydium program example
    const programAddress = '675kPX9MHTjS2zt1qrXjVVxt2YUB3d4Bu30Ns44fDwti';
    
    console.log(`\n📍 Fetching accounts for program: ${programAddress}`);
    
    const accounts = await helius.getProgramAccounts(programAddress, {
      pageSize: 50,
      maxPages: 5
    });

    console.log(`\n✅ RESULT:`, {
      totalAccounts: accounts.totalCount,
      pageCount: accounts.pageCount,
      sampleAccounts: accounts.accounts.slice(0, 2).map(acc => ({
        pubkey: acc.pubkey.slice(0, 8) + '...',
        executable: acc.executable,
        lamports: acc.lamports
      }))
    });

    return accounts;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * EXAMPLE 4: STREAM PROCESSING (MEMORY EFFICIENT)
 */
async function example4_StreamProcessing() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 4: STREAM PROCESSING');
  console.log('='.repeat(80));

  try {
    const testWallet = 'ALbZwZfFyVA5iNPsKfZhfCuXJXmf3YgXvFvVF8vYJvMT'; // Example
    
    console.log(`\n📍 Stream processing transactions for: ${testWallet}`);
    
    let processedCount = 0;
    let totalValue = 0;

    const result = await helius.streamProcess(
      `/addresses/${testWallet}/transactions`,
      { limit: 100 },
      async (transaction, index) => {
        // Process each transaction without loading all into memory
        processedCount++;
        
        // Example: accumulate transaction value
        if (transaction.nativeTransfers) {
          totalValue += transaction.nativeTransfers.reduce((sum, t) => sum + t.amount, 0);
        }

        if (index % 50 === 0) {
          console.log(`  ⚡ Processed ${index} transactions...`);
        }
      },
      { maxPages: 3 }
    );

    console.log(`\n✅ RESULT:`, {
      itemsProcessed: result.itemsProcessed,
      totalNativeValue: (totalValue / 1e9).toFixed(4) + ' SOL'
    });

    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * EXAMPLE 5: BATCH PROCESSING (MULTIPLE WALLETS)
 */
async function example5_BatchProcessing() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 5: BATCH PROCESSING');
  console.log('='.repeat(80));

  try {
    const wallets = [
      'ALbZwZfFyVA5iNPsKfZhfCuXJXmf3YgXvFvVF8vYJvMT',
      '4U8K76tGBB5jYYMp55SzFJzZQ7xyDV8a1E4G7u9SHhZa',
      'HN7cABqLq46Es1L97fGzQkVxfxWyuVghU2RRzKZfEu9s'
    ];

    console.log(`\n📍 Batch processing ${wallets.length} wallets`);

    const results = await helius.batchProcess(
      wallets,
      async (wallet) => {
        // Fetch transactions for each wallet
        return await helius.getTransactionHistory(wallet, { maxPages: 1 });
      },
      { batchSize: 2, delayMs: 500 }
    );

    console.log(`\n✅ RESULT:`, {
      walletsProcessed: results.length,
      totalTransactions: results.reduce((sum, r) => sum + r.totalCount, 0),
      avgTxPerWallet: (results.reduce((sum, r) => sum + r.totalCount, 0) / results.length).toFixed(0)
    });

    return results;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * DISPLAY STATISTICS
 */
function displayStats() {
  console.log('\n' + '='.repeat(80));
  console.log('PAGINATION STATISTICS');
  console.log('='.repeat(80));
  
  const stats = helius.getStats();
  console.log(`
  📊 Total Requests: ${stats.totalRequests}
  🔄 Total Retries: ${stats.totalRetries}
  ❌ Total Errors: ${stats.totalErrors}
  📡 Total Data Fetched: ${(stats.totalBytes / 1024 / 1024).toFixed(2)} MB
  
  ⚡ Avg Requests/Second: ${stats.avgRequestsPerSecond}
  📦 Avg Bytes/Request: ${stats.avgBytesPerRequest}
  🔁 Retry Rate: ${stats.retryRate}
  ⚠️  Error Rate: ${stats.errorRate}
  
  ⏱️  Elapsed Time: ${stats.elapsedSeconds.toFixed(2)}s
  `);
}

/**
 * RUN ALL EXAMPLES (uncomment to test)
 */
async function runAllExamples() {
  console.log('\n🚀 HELIUS PAGINATION CLIENT - COMPREHENSIVE EXAMPLES\n');

  try {
    // Uncomment examples to test (requires valid Helius API key and wallet addresses)
    // await example1_TokenBalances();
    // await example2_TransactionHistory();
    // await example3_ProgramAccounts();
    // await example4_StreamProcessing();
    // await example5_BatchProcessing();

    console.log('\n💡 NOTE: Uncomment examples in this file to test with real data.');
    console.log('📌 Replace example wallet addresses with real addresses.');
    console.log('🔑 Ensure HELIUS_API_KEY is set in .env.local\n');

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    displayStats();
  }
}

// Run examples
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  example1_TokenBalances,
  example2_TransactionHistory,
  example3_ProgramAccounts,
  example4_StreamProcessing,
  example5_BatchProcessing
};
