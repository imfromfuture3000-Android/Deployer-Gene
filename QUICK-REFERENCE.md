# 🚀 Quick Reference Guide - v1.3.0

**Version**: v1.3.0  
**Network**: Solana Mainnet-Beta  
**Status**: ✅ PRODUCTION READY

---

## 📋 Essential Addresses

### Primary Deployment
```
Mint:           3i62KXuWERyTZJ5HbE7HNbhvBAhEdMjMjLQk3m39PpN4
Treasury ATA:   DGWGgSKbdCjePhH7ULWHWBLjcE7XktGk2ohnCSRQ6Unx
Deployer:       7V4aUYVwrYj7jFBbGWDAJhkfejf8ArKkPjyobLBTEw7U
Master Control: CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ
Treasury:       EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6
Backfill:       8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y
```

### Bot Army (8 Nodes)
```
Bot 1: HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR
Bot 2: NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d
Bot 3: DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA
Bot 4: 7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41
Bot 5: 3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw
Bot 6: 8duk9DzqBVXmqiyci9PpBsKuRCwg6ytzWywjQztM6VzS
Bot 7: 96891wG6iLVEDibwjYv8xWFGFiEezFQkvdyTrM69ou24
Bot 8: 2A8qGB3iZ21NxGjX4EjjWJKc9PFG1r7F4jkcR66dc4mb
```

---

## 🛠️ Quick Commands

### Verification
```bash
# Verify all contracts with rebates
node verify-force-add-rebates.js

# Check mainnet contracts
node verify-mainnet-contracts.js

# Verify on-chain state
node verify-onchain-state.js

# Check deployment status
node verify-deployment.js

# Verify balances
node verify-real-balances.js

# Verify transaction hashes
node verify-txhash.js
```

### Deployment
```bash
# Run copilot
npm run mainnet:copilot

# Full deployment
npm run mainnet:all

# Bot orchestration
npm run mainnet:bot-orchestrate

# Verify bots
npm run mainnet:verify-bots

# Reannounce controller
npm run mainnet:reannounce-controller
```

---

## 🔗 Explorer Links

### Primary
- [Mint](https://explorer.solana.com/address/3i62KXuWERyTZJ5HbE7HNbhvBAhEdMjMjLQk3m39PpN4)
- [Deployer](https://explorer.solana.com/address/7V4aUYVwrYj7jFBbGWDAJhkfejf8ArKkPjyobLBTEw7U)
- [Backfill](https://explorer.solana.com/address/8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y)

### Alternative Explorers
- [Solscan](https://solscan.io)
- [Solana Beach](https://solanabeach.io)
- [SolanaFM](https://solana.fm)

---

## 📊 Key Metrics

### Deployment Stats
```
Total Contracts:    27
Verified:           27 (100%)
Rebates:            27 (100%)
MEV Protection:     27 (100%)
Bot Nodes:          8
DEX Integrations:   3
```

### Asset Stats
```
Total SOL:          3.271 SOL
Backfill Balance:   0.111 SOL
Token Accounts:     404
Active Tokens:      317
```

---

## 🔐 Security Config

### Permanent Settings
```
Rebate Rate:        15% (LOCKED)
MEV Protection:     ENABLED (PERMANENT)
Auto-Distribution:  LOCKED
Authority Control:  VERIFIED
```

### Deployment Rules
```
✅ Mainnet-Beta Only
✅ Real Deployments Only
✅ Relayer Logic Only
✅ Zero-Cost for User
```

---

## 📚 Documentation

### Release Docs
- [CHANGELOG-v1.3.0.md](./CHANGELOG-v1.3.0.md)
- [GITHUB-RELEASE-NOTES.md](./GITHUB-RELEASE-NOTES.md)
- [SOLANA-CHAIN-ANNOUNCEMENT.md](./SOLANA-CHAIN-ANNOUNCEMENT.md)

### Technical Docs
- [README.md](./README.md)
- [OPERATIONS-LOG.md](./OPERATIONS-LOG.md)
- [ASSET-INVENTORY.md](./ASSET-INVENTORY.md)
- [SECURITY-AUDIT-REPORT.md](./SECURITY-AUDIT-REPORT.md)

### Verification
- [ACTIVATION-SUMMARY.md](./ACTIVATION-SUMMARY.md)
- [VERIFICATION-CHECKLIST.md](./VERIFICATION-CHECKLIST.md)
- [allowlist-activation-report.json](./.cache/allowlist-activation-report.json)

---

## 🎯 Current Phase

### Phase 3: Complete ✅
- Infrastructure setup
- Contract deployment
- Authority claims
- Allowlist activation

### Phase 4: Next ⏳
- Asset transfers
- Token consolidation
- Treasury operations

---

## 🚨 Important Notes

### Mainnet Only
```
⚠️ NO DEVNET
⚠️ NO TESTNET
✅ MAINNET-BETA ONLY
```

### Relayer Logic
```
✅ User = Signer Only
✅ Relayer = Fee Payer
✅ Zero-Cost Deployment
```

### Real Deployments
```
✅ Real On-Chain Contracts
✅ Valid Transaction Hashes
✅ Verifiable on Explorer
```

---

## 📞 Support

### Resources
- **Repository**: [GitHub](https://github.com/imfromfuture3000-Android/Omega-prime-deployer)
- **Discord**: [Join](https://discord.gg/8Hzbrnkr7E)
- **Issues**: [Report](https://github.com/imfromfuture3000-Android/Omega-prime-deployer/issues)

### Quick Help
```bash
# Check status
node verify-deployment.js

# View logs
cat .cache/deployment-log.json

# Check verification
cat .cache/mainnet-verification.json
```

---

**Last Updated**: 2025-01-XX  
**Version**: v1.3.0  
**Status**: ✅ LIVE

*"Quick access to everything you need."*
