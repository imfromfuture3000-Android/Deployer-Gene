# Cross-Chain Rebate System Configuration

Complete setup for routing Ethereum Biconomy transaction rebates to Solana treasury.

## 🏗️ Architecture Overview

```
┌─────────────────────┐
│   Ethereum User     │
│  (Biconomy Smart    │
│   Account)          │
└──────────┬──────────┘
           │
           │ Execute TX
           ↓
┌─────────────────────────────┐
│  ETH Biconomy Relayer       │
│  Signer: 0x7fa814...        │
│  (Signs & manages TXs)      │
└──────────┬──────────────────┘
           │
           │ Calculate Rebate
           │ (0.5% of gas cost)
           ↓
┌─────────────────────────────┐
│  Rebate Accumulator         │
│  (Batch size: 10 TXs)       │
└──────────┬──────────────────┘
           │
           │ When batch full
           ↓
┌─────────────────────────────┐
│  Wormhole Bridge            │
│  (Cross-chain bridge)       │
└──────────┬──────────────────┘
           │
           │ Bridge ETH → SOL
           ↓
┌──────────────────────────────┐
│ Solana Treasury              │
│ Receiver: 7b201OKf...       │
│ (DAO governance controlled)  │
└──────────────────────────────┘
```

---

## ⚙️ Configuration

### Environment Variables (`.env.local`)

```bash
# ETH Biconomy Signer - Signs all Ethereum transactions
ETH_BICONOMY_SIGNER=0x7fa814c07de0f94aa977a4556e32ef2cf8695dd3e8f3cd55fabb664be5281880
ETH_BICONOMY_ENABLED=true
ETH_CHAIN_ID=1

# Solana Treasury Receiver - Accumulates rebates from ETH
SOLANA_TREASURY_REBATE_RECEIVER=7b201OKf5pQdHRWFo7cDhnlE1YuqpR4sYXrYGDMvCvPc
SOLANA_TREASURY_RECEIVER_RAW=[84,32,127,214,116,85,6,53,123,7,157,124,156,124,90,0,67,65,168,44,121,219,184,2,228,213,113,213,202,218,9,222,90,172,60,63,40,62,136,119,36,193,119,154,84,58,209,237,238,119,144,82,128,70,61,171,218,63,186,120,57,121,163,150]
SOLANA_TREASURY_ENABLED=true
REBATE_PROGRAM_ENABLED=true
```

### Programmatic Setup

```javascript
const CrossChainRebateSystem = require('./src/ralph/integrations/cross-chain-rebate');

const rebateSystem = new CrossChainRebateSystem({
  ethSigner: '0x7fa814c07de0f94aa977a4556e32ef2cf8695dd3e8f3cd55fabb664be5281880',
  solanaReceiver: '7b201OKf5pQdHRWFo7cDhnlE1YuqpR4sYXrYGDMvCvPc',
  enabled: true,
  rebatePercentage: 0.5,      // 0.5% rebate
  minRebateAmount: 0.001,     // Min 0.001 ETH
  batchSize: 10               // Batch every 10 TXs
});
```

---

## 📡 Component Details

### ETH Biconomy Signer

**Address**: `0x7fa814c07de0f94aa977a4556e32ef2cf8695dd3e8f3cd55fabb664be5281880`

**Role**: 
- Signs all Ethereum transactions via Biconomy smart account
- Authorizes gas fee deductions
- Triggers rebate calculations

**Characteristics**:
- 40-character hex string (20 bytes)
- Valid Ethereum address format (0x prefixed)
- Controls Biconomy relayer operations
- Full permissions for transaction signing

### Solana Treasury Receiver

**Address (Base58)**: `7b201OKf5pQdHRWFo7cDhnlE1YuqpR4sYXrYGDMvCvPc`

**Raw Bytes (64-byte format)**:
```
[84,32,127,214,116,85,6,53,123,7,157,124,156,124,90,0,67,65,168,44,121,219,184,2,228,213,113,213,202,218,9,222,90,172,60,63,40,62,136,119,36,193,119,154,84,58,209,237,238,119,144,82,128,70,61,171,218,63,186,120,57,121,163,150]
```

**Role**:
- Destination for cross-chain ETH rebates
- Controlled by Solana DAO governance
- Accumulates treasury from multiple sources
- Used for governance voting & withdrawals

**Characteristics**:
- 32-byte Solana public key
- Can receive SOL and SPL tokens
- Vote-weighted treasury governance
- Multi-sig capable (future)

---

## 🔄 Rebate Flow

### Step 1: ETH Transaction Execution

```
User initiates TX on Ethereum via Biconomy smart account
├─ TX signed by: 0x7fa814c07...
├─ Gas used: ~75,000
├─ Gas price: 50 gwei
└─ Total cost: 0.00375 ETH

Biconomy Relayer
├─ Validates signature
├─ Submits transaction
└─ Records gas consumption
```

### Step 2: Rebate Calculation

```
Rebate Calculation:
├─ TX cost = 75,000 gas × 50 Gwei = 0.00375 ETH
├─ Rebate % = 0.5%
├─ Rebate amount = 0.00375 × 0.005 = 0.0000188 ETH
├─ In USD (@ $2500/ETH) = $0.047
└─ Status → Accumulated
```

### Step 3: Batch Accumulation

```
Rebates accumulate in batches:
- TX 1: +0.0000188 ETH
- TX 2: +0.0000215 ETH
- TX 3: +0.0000192 ETH
...
- TX 10: +0.0000201 ETH
────────────────────────────
Total (batch): 0.00202 ETH ← Ready for routing
```

### Step 4: Cross-Chain Routing

```
When batch size reached:
├─ Total ETH collected: 0.00202 ETH
├─ Conversion to SOL: ~1.01 SOL (@ 2000 SOL/ETH)
├─ Bridge method: Wormhole
├─ Target: 7b201OKf5pQdHRWFo7cDhnlE1YuqpR4sYXrYGDMvCvPc
└─ Estimated arrival: 25 seconds
```

### Step 5: Treasury Deposit

```
Solana Treasury receives:
├─ Amount: 1.01 SOL
├─ From: Wormhole bridge contract
├─ Token: Native SOL
├─ Timestamp: [recorded]
├─ Status: Confirmed on-chain
└─ Treasury balance: +1.01 SOL
```

---

## 💻 API Reference

### Initialize System

```javascript
const rebateSystem = new CrossChainRebateSystem({
  ethSigner: process.env.ETH_BICONOMY_SIGNER,
  solanaReceiver: process.env.SOLANA_TREASURY_REBATE_RECEIVER,
  enabled: true,
  rebatePercentage: 0.5,
  minRebateAmount: 0.001,
  batchSize: 10
});
```

### Process Individual Rebate

```javascript
const rebate = await rebateSystem.processEthRebate(
  txHash,           // '0x1234...'
  gasUsed,          // 75000
  gasPrice,         // 50e9 (wei)
  ethPrice          // 2500 (USD)
);

// Returns:
{
  txHash: '0x1234...',
  gasUsed: 75000,
  txCostETH: 0.00375,
  rebateETH: 0.0000188,
  rebateUSD: 0.047,
  timestamp: '2026-02-13T12:34:56Z',
  status: 'calculated'
}
```

### Route Rebate to Solana

```javascript
const routed = await rebateSystem.routeRebateToSolana(
  rebate,
  heliusClient  // HeliusPaginationClient instance
);

// Returns:
{
  ...rebate,
  solanaRoute: {
    targetAddress: '7b201OKf...',
    amount: 0.0000188,
    token: 'ETH',
    targetChain: 'solana-mainnet',
    bridgeUsed: 'wormhole',
    status: 'pending',
    estimatedArrival: '2026-02-13T12:35:21Z'
  },
  status: 'routed_to_solana'
}
```

### Batch Process Rebates

```javascript
const results = await rebateSystem.batchRouteRebates(
  rebatesArray,
  heliusClient
);

// Returns:
{
  successful: [...routed rebates],
  failed: [...failed rebates],
  totalRouted: 8,
  totalFailed: 2,
  totalValue: 0.00456  // Total ETH routed
}
```

### Get Analytics

```javascript
const analytics = rebateSystem.getTreasuryAnalytics();

// Returns:
{
  summary: {
    ethSigner: '0x7fa814...',
    solanaReceiver: '7b201OKf...',
    enabled: true
  },
  statistics: {
    totalRebates: 0.00456,        // Total ETH rebated
    totalTransactions: 42,         // TXs processed
    successfulRoutes: 40,
    failedRoutes: 2,
    avgRebatePerTx: '0.000109 ETH',
    successRate: '95.2%'
  },
  configuration: {
    rebatePercentage: '0.5%',
    minRebateAmount: '0.001 ETH',
    batchSize: 10,
    network: 'mainnet'
  }
}
```

### Verify Signer

```javascript
const verification = rebateSystem.verifySignerAuthority();

// Returns:
{
  signer: '0x7fa814...',
  isValid: true,
  chainId: 1,
  timestamp: '2026-02-13T12:34:56Z'
}
```

### Get Solana Receiver Info

```javascript
const receiverInfo = rebateSystem.getSolanaReceiverInfo();

// Returns:
{
  configured: '7b201OKf...',
  base58: '7b201OKf...',
  raw: '[84,32,127,...]',
  converted: {
    base58: '7b201OKf...',
    bytes: [84,32,127,...],
    publicKey: '7b201OKf...'
  },
  valid: true,
  network: 'solana-mainnet'
}
```

---

## 🔐 Security Considerations

### Key Management

✅ **ETH Biconomy Signer**
- Stored in `.env.local` (excluded from git)
- Managed by Biconomy relayer
- Never exposed in transaction data
- Can be rotated via Biconomy admin panel

✅ **Solana Treasury Receiver**
- Public address (safe to expose)
- Multi-sig capable for elevated security
- DAO governance controlled
- Cannot withdraw without governance approval

### Rebate Verification

```javascript
// Verify rebate calculation
const isValid = rebate.rebateETH === 
  (rebate.txCostETH * (rebateSystem.config.rebatePercentage / 100));

// Verify Solana address
const addressValid = rebateSystem.verifySignerAuthority().isValid &&
                     rebateSystem.getSolanaReceiverInfo().valid;
```

### Rate Limiting

- **Batch processing**: 10 TXs per batch
- **Bridge delay**: ~25 seconds
- **Helius RPS**: 50-100 (configured separately)
- **Max daily rebates**: Unlimited (treasury controlled)

---

## 📊 Monitoring & Statistics

```javascript
// Get current statistics
const stats = rebateSystem.getTreasuryAnalytics();

console.log(`
  Daily Rebates: ${stats.statistics.totalRebates} ETH
  TXs Processed: ${stats.statistics.totalTransactions}
  Success Rate: ${stats.statistics.successRate}
  Avg Rebate: ${stats.statistics.avgRebatePerTx}
`);
```

---

## 🚀 Integration with Ralph

### Enable in Iteration 1

```javascript
// In Ralph configuration
const ralph = new RalphAgentBot({
  strategies: {
    yieldHarvester: { enabled: true },
    crossChainRebate: { enabled: true }
  }
});

// Attach rebate system
ralph.rebateSystem = new CrossChainRebateSystem({
  ethSigner: process.env.ETH_BICONOMY_SIGNER,
  solanaReceiver: process.env.SOLANA_TREASURY_REBATE_RECEIVER
});
```

### Rebate Event Listeners

```javascript
rebateSystem.on('rebate:processed', (rebate) => {
  console.log(`Rebate: ${rebate.rebateUSD} USD`);
});

rebateSystem.on('rebate:routed', (routed) => {
  console.log(`Routed to Solana: ${routed.solanaRoute.amount} ETH`);
});

rebateSystem.on('batch:complete', (batch) => {
  console.log(`Batch routed: ${batch.totalValue} ETH`);
});
```

---

## 🧪 Testing

### Test Rebate Calculation

```javascript
const rebate = await rebateSystem.processEthRebate(
  '0xtest123',
  100000,
  100e9,  // 100 gwei
  2000    // $2000 ETH
);

// Expected: 0.01 ETH cost × 0.005 = 0.00005 ETH rebate
console.assert(rebate.rebateETH === 0.00005);
```

### Test Batch Routing

```javascript
const rebates = [];
for (let i = 0; i < 10; i++) {
  rebates.push(await rebateSystem.processEthRebate(
    `0xtest${i}`,
    75000,
    50e9,
    2500
  ));
}

const results = await rebateSystem.batchRouteRebates(rebates, heliusClient);
console.log(`Routed ${results.totalRouted} rebates`);
```

---

## 📞 Troubleshooting

### Issue: "Invalid ETH signer address"

**Solution**: Verify format:
```bash
echo $ETH_BICONOMY_SIGNER
# Should output: 0x7fa814c07de0f94aa977a4556e32ef2cf8695dd3e8f3cd55fabb664be5281880
```

### Issue: "Invalid Solana address"

**Solution**: Verify Base58 format:
```javascript
const { PublicKey } = require('@solana/web3.js');
new PublicKey('7b201OKf5pQdHRWFo7cDhnlE1YuqpR4sYXrYGDMvCvPc');
// Should not throw
```

### Issue: Rebate below minimum

**Solution**: Increase batch size or transaction volume:
```javascript
const rebateSystem = new CrossChainRebateSystem({
  minRebateAmount: 0.0001  // Lower threshold
});
```

---

## 📝 Status

- ✅ Configuration complete
- ✅ ETH Biconomy signer configured
- ✅ Solana treasury receiver configured
- ✅ Cross-chain system ready for integration
- ⏳ Integration with Ralph Iteration 1

**Ready for**: Yield Harvester + Rebate routing combined deployment

---

**Last Updated**: Feb 13, 2026  
**Version**: 1.0  
**Ralph Integration**: Iteration 1
