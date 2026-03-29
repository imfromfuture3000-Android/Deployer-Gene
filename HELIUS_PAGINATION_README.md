# Helius Pagination System

Complete pagination framework for Ralph Agent Bot to efficiently fetch data from Solana blockchain via Helius API.

## 📦 Components

### 1. **HeliusPaginationClient** (`src/ralph/integrations/helius-pagination.js`)
- Core pagination engine for all Helius API endpoints
- Automatic retry with exponential backoff
- Rate limiting (respects 100 RPS Helius limit)
- Event-based progress tracking
- Stream processing for memory efficiency
- Batch processing for multi-wallet operations

### 2. **YieldHarvesterHelius** (`src/ralph/strategies/yield-harvester-helius.js`)
- Practical integration for Yield Harvester strategy
- Fetches token balances, transactions, program accounts
- Identifies yield-bearing tokens
- Tracks APY data for major protocols
- Generates comprehensive harvest reports

### 3. **Examples** (`src/ralph/integrations/helius-pagination-examples.js`)
- 5 complete usage examples
- Token balance fetching
- Transaction history analysis
- Program account queries
- Stream and batch processing demos

---

## 🚀 Quick Start

### Basic Usage

```javascript
const HeliusPaginationClient = require('./src/ralph/integrations/helius-pagination');

const helius = new HeliusPaginationClient({
  apiKey: process.env.HELIUS_API_KEY,
  debug: true,
  maxRetries: 3,
  rateLimit: 50
});

// Fetch all token balances
const balances = await helius.getTokenBalances('wallet_address', {
  includeNative: true,
  maxPages: 10
});

console.log(balances);
```

### With Yield Harvester

```javascript
const YieldHarvesterHelius = require('./src/ralph/strategies/yield-harvester-helius');

const harvester = new YieldHarvesterHelius({
  walletAddress: 'your_wallet_address',
  debug: true
});

// Generate full harvest report
const report = await harvester.generateHarvestReport();
console.log(report);
```

---

## 📚 API Reference

### HeliusPaginationClient

#### Constructor Options
```javascript
{
  apiKey: string,              // Helius API key (required)
  baseUrl?: string,            // API base URL (default: helius.xyz)
  rpcUrl?: string,            // RPC endpoint
  rateLimit?: number,         // Requests per second (default: 100)
  maxRetries?: number,        // Max retry attempts (default: 3)
  retryDelay?: number,        // Initial retry delay in ms (default: 1000)
  backoffMultiplier?: number, // Retry exponential backoff (default: 2)
  defaultLimit?: number,      // Default page size (default: 100)
  maxLimit?: number,          // Max page size (default: 1000)
  debug?: boolean,            // Enable debug logging (default: false)
  logger?: object             // Custom logger (default: console)
}
```

#### Methods

##### `getTokenBalances(walletAddress, options)`
Fetch all token balances for a wallet with pagination.

```javascript
const balances = await helius.getTokenBalances(walletAddress, {
  includeNative: true,  // Include SOL balance
  maxPages: 10          // Limit pagination (null = all)
});
```

**Returns:**
```javascript
{
  address: string,
  native: number,
  tokens: [
    {
      mint: string,
      symbol: string,
      amount: number,
      decimals: number,
      usdValue: number,
      priceUsd: number
    }
  ],
  totalCount: number,
  fetchedAt: string
}
```

---

##### `getTransactionHistory(walletAddress, options)`
Fetch full transaction history with pagination.

```javascript
const txs = await helius.getTransactionHistory(walletAddress, {
  limit: 100,      // Items per page
  until: timestamp, // Optional: fetch until this timestamp
  maxPages: 5      // Limit pagination
});
```

**Returns:**
```javascript
{
  address: string,
  transactions: Transaction[],
  totalCount: number,
  types: string[],  // All transaction types found
  fetchedAt: string
}
```

---

##### `getProgramAccounts(programAddress, options)`
Fetch all accounts controlled by a program with pagination.

```javascript
const accounts = await helius.getProgramAccounts(programAddress, {
  pageSize: 100,
  maxPages: 5,
  filters: []  // Optional RPC filters
});
```

**Returns:**
```javascript
{
  programAddress: string,
  accounts: Account[],
  totalCount: number,
  pageCount: number,
  fetchedAt: string
}
```

---

##### `getNFTCollection(collectionAddress, options)`
Fetch all NFTs in a collection with pagination.

```javascript
const nfts = await helius.getNFTCollection(collectionAddress, {
  pageSize: 100,
  maxPages: null
});
```

---

##### `streamProcess(endpoint, params, itemCallback, options)`
Memory-efficient processing - processes items without storing all in memory.

```javascript
let totalValue = 0;

await helius.streamProcess(
  `/addresses/${wallet}/transactions`,
  { limit: 100 },
  async (transaction, index) => {
    // Process each transaction individually
    if (transaction.nativeTransfers) {
      totalValue += transaction.nativeTransfers.reduce((sum, t) => sum + t.amount, 0);
    }
  },
  { maxPages: 5 }
);

console.log(`Total value: ${totalValue / 1e9} SOL`);
```

---

##### `batchProcess(items, processor, options)`
Process multiple items in parallel batches.

```javascript
const wallets = ['addr1', 'addr2', 'addr3'];

const results = await helius.batchProcess(
  wallets,
  async (wallet) => {
    return await helius.getTransactionHistory(wallet);
  },
  { batchSize: 2, delayMs: 500 }
);
```

---

##### `paginatedRequest(endpoint, params, options)`
Low-level pagination for custom endpoints.

```javascript
const results = [];

await helius.paginatedRequest(
  '/custom/endpoint',
  { param: 'value' },
  {
    paginationType: 'cursor',  // 'cursor' or 'limit-offset'
    maxPages: 10,
    pageCallback: async (pageData, pageNum) => {
      results.push(...pageData);
    }
  }
);
```

---

#### Events

Listen to pagination progress:

```javascript
helius.on('log', ({ level, message, data }) => {
  console.log(`[${level}] ${message}`, data);
});

helius.on('page', ({ pageCount, itemsInPage, endpoint }) => {
  console.log(`Page ${pageCount}: ${itemsInPage} items`);
});

helius.on('tokens', ({ walletAddress, count, total }) => {
  console.log(`Fetched ${count} tokens (total: ${total})`);
});

helius.on('transactions', ({ walletAddress, count, total }) => {
  console.log(`Fetched ${count} transactions (total: ${total})`);
});

helius.on('batch', ({ batchIndex, batchSize }) => {
  console.log(`Batch ${batchIndex}: ${batchSize} items`);
});
```

---

#### Statistics

```javascript
const stats = helius.getStats();
console.log({
  totalRequests: stats.totalRequests,
  totalRetries: stats.totalRetries,
  totalErrors: stats.totalErrors,
  avgRequestsPerSecond: stats.avgRequestsPerSecond,
  retryRate: stats.retryRate,
  errorRate: stats.errorRate
});

helius.resetStats();  // Reset statistics
```

---

## 🧪 Examples

### Example 1: Fetch Portfolio Value

```javascript
const helius = new HeliusPaginationClient({ apiKey: process.env.HELIUS_API_KEY });

const balances = await helius.getTokenBalances('your_wallet', { includeNative: true });

const value = balances.tokens.reduce((sum, t) => sum + t.usdValue, 0);
console.log(`Portfolio value: $${value.toFixed(2)}`);
```

### Example 2: Find All Yield Opportunities

```javascript
const harvester = new YieldHarvesterHelius({ 
  walletAddress: 'your_wallet' 
});

const report = await harvester.generateHarvestReport();

report.recommendations.forEach(rec => {
  console.log(`${rec.action}: ${rec.reason}`);
});
```

### Example 3: Track Yield Transactions

```javascript
const helius = new HeliusPaginationClient({ apiKey });

const txHistory = await helius.getTransactionHistory('wallet_address', {
  limit: 100,
  maxPages: 5
});

const yieldTxs = txHistory.transactions
  .filter(tx => JSON.stringify(tx).toLowerCase().includes('harvest'));

console.log(`Found ${yieldTxs.length} yield harvest transactions`);
```

### Example 4: Batch Wallet Analysis

```javascript
const addresses = ['wallet1', 'wallet2', 'wallet3'];

const balances = await helius.batchProcess(
  addresses,
  async (addr) => helius.getTokenBalances(addr),
  { batchSize: 2, delayMs: 100 }
);

const totalValue = balances.reduce((sum, b) => 
  sum + b.tokens.reduce((s, t) => s + t.usdValue, 0), 0
);

console.log(`Total portfolio value: $${totalValue.toFixed(2)}`);
```

### Example 5: Stream Process Large History

```javascript
let totalYieldEarned = 0;

await helius.streamProcess(
  `/addresses/wallet/transactions`,
  { limit: 100 },
  async (tx) => {
    if (tx.nativeTransfers) {
      for (const transfer of tx.nativeTransfers) {
        if (transfer.toUserAccount === 'wallet') {
          totalYieldEarned += transfer.amount;
        }
      }
    }
  },
  { maxPages: 10 }
);

console.log(`Total yield earned: ${(totalYieldEarned / 1e9).toFixed(4)} SOL`);
```

---

## ⚙️ Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Required
HELIUS_API_KEY=your_api_key

# Optional
HELIUS_RPC=https://beta.helius-rpc.com/?api-key=your_key
RPC_NETWORK=solana-mainnet
RPC_URL=https://api.mainnet-beta.solana.com

# Pagination defaults
HELIUS_RATE_LIMIT=100
HELIUS_MAX_RETRIES=3
HELIUS_RETRY_DELAY=1000
HELIUS_DEFAULT_LIMIT=100
```

### Rate Limiting

Helius has rate limits:
- **Free tier**: 50 RPS
- **Standard**: 100 RPS
- **Pro**: 500 RPS

Configure accordingly:

```javascript
const helius = new HeliusPaginationClient({
  apiKey: process.env.HELIUS_API_KEY,
  rateLimit: 50  // Adjust based on your plan
});
```

---

## 🔧 Troubleshooting

### High Error Rate

```javascript
// Increase retry delays and reduce rate limit
const helius = new HeliusPaginationClient({
  apiKey,
  rateLimit: 30,      // Lower rate
  maxRetries: 5,      // More retries
  retryDelay: 2000    // Longer delays
});
```

### Memory Issues with Large Datasets

```javascript
// Use stream processing instead of accumulate
await helius.streamProcess(
  endpoint,
  params,
  async (item) => {
    // Process item immediately without storing
    await processItem(item);
  }
);
```

### API Key Issues

```bash
# Verify API key is set
echo $HELIUS_API_KEY

# Test API connectivity
curl https://api.helius.xyz/v0/addresses/ALbZwZfFyVA5iNPsKfZhfCuXJXmf3YgXvFvVF8vYJvMT/balances?api_key=$HELIUS_API_KEY
```

---

## 📊 Performance Metrics

Typical pagination performance:

| Operation | Time (1000 items) | Memory | RPS Used |
|-----------|------------------|--------|----------|
| Get Token Balances | 2-5s | ~2MB | 10-15 |
| Get Transactions | 5-15s | ~5MB | 20-50 |
| Get Program Accounts | 3-8s | ~3MB | 15-30 |
| Batch Process (10 wallets) | 10-20s | ~5MB | 30-60 |
| Stream Process | Varies | <1MB | 20-50 |

---

## 🔒 Security Notes

- **Never commit `.env.local`** - it contains API keys
- **Rate limit aggressively** to avoid DDoS detection
- **Cache responses** when possible to reduce API calls
- **Monitor error rates** - high error rates may indicate abuse detection

---

## 📞 Support

For issues with Helius pagination:
1. Check `.env.local` has valid `HELIUS_API_KEY`
2. Verify Helius API status: https://status.helius.xyz
3. Check rate limiting - reduce `rateLimit` setting
4. Enable debug mode for detailed logs

---

**Version**: 1.0  
**Last Updated**: Feb 13, 2026  
**Ralph Iteration**: 1 (Yield Harvester)
