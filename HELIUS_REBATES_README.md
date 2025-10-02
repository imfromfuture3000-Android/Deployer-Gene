# 🌟 Helius Rebates & MEV Protection Integration

## Overview
The Omega Prime Deployer now includes integrated Helius rebates and MEV protection for all contract deployments, providing cost optimization and transaction security.

## 🎯 Features

### 💰 Helius Rebates
- **Automatic tip account selection** from verified Helius tip accounts
- **Dynamic tip calculation** based on transaction complexity
- **Rebate estimation** up to 0.5% of transaction costs
- **Multi-account rotation** for optimal rebate distribution

### 🛡️ MEV Protection
- **Program-specific tip accounts** for deterministic routing
- **Transaction priority optimization** via strategic tipping
- **Anti-sandwich attack protection** through Helius infrastructure
- **Jito bundle compatibility** for advanced MEV strategies

## 🚀 Quick Start

### 1. Enable Rebates
```bash
# Add to .env
HELIUS_REBATES_ENABLED=true
MEV_PROTECTION_ENABLED=true
```

### 2. Deploy with Rebates
```bash
# Deploy all contracts with rebates
npm run mainnet:helius-rebates

# Deploy with maximum MEV protection
npm run mainnet:tip-deploy
```

## 📊 Tip Account Configuration

### Primary Tip Accounts
- `Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY` - Primary
- `DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL` - Secondary  
- `96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5` - Tertiary
- `HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe` - Quaternary

### Tip Amounts
- **Minimum**: 1,000 lamports (0.000001 SOL)
- **Default**: 10,000 lamports (0.00001 SOL)
- **Maximum**: 100,000 lamports (0.0001 SOL)

## 🔧 Integration Points

### Contract Addresses with Rebates
All deployed contracts automatically include rebate optimization:
- Mint addresses
- Treasury accounts
- Bot army wallets
- Earnings vaults
- DAO multisigs

### Webhook Integration
Helius webhooks monitor all tip accounts for rebate tracking:
```typescript
// Automatic webhook setup includes tip accounts
const tipAccounts = HELIUS_TIP_ACCOUNTS;
// Webhook monitors rebate transactions
```

## 💡 Usage Examples

### Basic Deployment
```javascript
const deployer = new ContractDeployer({
  programId: new PublicKey(mintAddress),
  feePayer: new PublicKey(treasuryPubkey),
  connection,
  enableRebates: true,
  enableMevProtection: true
});

const signature = await deployer.deployWithRebates(instructions);
```

### Custom Tip Amount
```javascript
const rebateManager = new HeliusRebateManager(connection);
const transaction = rebateManager.addTipInstruction(tx, 50000); // Custom tip
```

## 📈 Expected Benefits

### Cost Savings
- **0.1-0.5%** rebate on transaction fees
- **Reduced MEV losses** through priority routing
- **Optimized gas usage** via intelligent tip calculation

### Performance
- **Faster confirmation** through priority processing
- **Reduced failed transactions** via MEV protection
- **Better execution prices** through anti-sandwich protection

## 🔍 Monitoring & Analytics

### Rebate Tracking
```bash
# Check rebate status
npm run mainnet:verify-bots

# Monitor tip account activity
node omega-status.js
```

### Transaction Analysis
All rebate-enabled transactions are logged with:
- Tip amount
- Rebate estimation
- MEV protection status
- Performance metrics

## ⚙️ Environment Variables

```bash
# Rebate Configuration
HELIUS_REBATES_ENABLED=true
MEV_PROTECTION_ENABLED=true
TIP_ACCOUNT_OVERRIDE=<custom_tip_account>

# Helius API
HELIUS_API_KEY=<your_api_key>
WEBHOOK_URL=<webhook_endpoint>
```

## 🚨 Important Notes

- Rebates are processed automatically by Helius
- Tip amounts are optimized per transaction
- MEV protection requires Helius RPC endpoint
- All tip accounts are verified and secure

---

*Maximize your deployment efficiency with Helius rebates and MEV protection! 🌟*