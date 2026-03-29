# 🚀 Relayer Deployment Guide - Signer Only Mode

## ✅ Concept: You Sign, Relayer Pays

Based on your transaction details:
- **Slot**: 370616941
- **Rate**: $225.00/SOL
- **Total Fee**: 0.00002 SOL ($0.00450)
- **Priority Fee**: 0.0000000 SOL
- **Signers**: Multiple (you + relayer)

## 📍 Current Setup

### Your Role: SIGNER ONLY
- You sign with mint keypair
- You pay ZERO fees
- You need ZERO SOL balance

### Relayer Role: PAYER
- Relayer pays all fees
- Relayer pays rent exemption
- Relayer signs as fee payer

## 🎯 Deployment Options

### Option 1: Devnet (Working Now)
```bash
npm run deploy:now
```
✅ **SUCCESSFUL** - Deployed to devnet
- Mint: `EUusnMaMbfEZJcK3iPdhrFjDjL5dyv8prMCuQ6uuC2mu`
- Network: Devnet
- Status: Live

### Option 2: Direct Relayer (Mainnet)
```bash
npm run deploy:direct
```
**Requires funding relayer:**
```
TKR7CX2713rsJX76Sbr1YK77ZbqraHGbadn6gAUcQCc
```
Fund with: 0.01+ SOL

### Option 3: External Relayer Service
```bash
npm run deploy:relayer
```
Configure `.env`:
```bash
RELAYER_URL=https://your-relayer-service.com/api
RELAYER_PUBKEY=YourRelayerPublicKey
RELAYER_API_KEY=your_api_key
```

## 💡 How It Works

### Transaction Structure
```javascript
Transaction {
  feePayer: relayerPubkey,  // Relayer pays
  signatures: [
    mintKeypair,              // You sign (new account)
    relayerKeypair            // Relayer signs (payer)
  ],
  instructions: [
    SystemProgram.createAccount({
      fromPubkey: relayerPubkey,  // Relayer pays rent
      newAccountPubkey: mint,
      lamports: rentExempt,
      ...
    }),
    createInitializeMintInstruction(...)
  ]
}
```

### Your Signing Flow
1. Generate mint keypair (local)
2. Build transaction with relayer as payer
3. Sign with mint keypair only
4. Send to relayer
5. Relayer adds signature and submits
6. You pay ZERO fees ✅

## 📊 Cost Breakdown

| Item | Amount | Who Pays |
|------|--------|----------|
| Rent Exemption | ~0.00146 SOL | Relayer |
| Transaction Fee | ~0.00002 SOL | Relayer |
| Priority Fee | 0.00000 SOL | Relayer |
| **Your Cost** | **0 SOL** | **FREE** |

## 🚀 Quick Start

### For Testing (Devnet - Free)
```bash
npm run deploy:now
```

### For Production (Mainnet)

**Step 1**: Fund relayer
```
Address: TKR7CX2713rsJX76Sbr1YK77ZbqraHGbadn6gAUcQCc
Amount: 0.01 SOL
```

**Step 2**: Deploy
```bash
npm run deploy:direct
```

**Step 3**: Verify
```bash
# Check .cache/mint.json for mint address
cat .cache/mint.json
```

## 🔧 Configuration Files

### Mint Keypair (You)
```
Location: .cache/mint-keypair.json
Role: Signer for new account
Balance needed: 0 SOL
```

### Relayer Keypair (Payer)
```
Location: .cache/relayer-keypair.json
Role: Fee payer
Balance needed: 0.01+ SOL
```

### Helius + MPC Configuration
- Centralize RPC + relayer defaults in `src/helius/config.ts` (validates `HELIUS_API_KEY`, `RELAYER_PUBKEY`, `RELAYER_URL`, `MPC_SERVER_URL`, compute unit limits, and priority-fee presets).
- Deploy paths use the MPC wrapper in `src/helius/mpcClient.ts` for `requestPayerSignature`, `submitTransaction`, and `getPriorityFees`; keep your signer endpoint reachable at `MPC_SERVER_URL`.
- Failover RPC order: leave `RPC_URL` unset to hit `https://mainnet.helius-rpc.com/?api-key=$HELIUS_API_KEY`, then fall back to `https://rpc.helius.xyz/?api-key=$HELIUS_API_KEY` if health checks or deploys stall.
- Key rotation playbook: rotate Helius API keys and relayer pubkeys in `.env`, run `node setup-helius.js` to confirm, then restart any deployment daemons/CI jobs so new credentials propagate.

## ✅ Successful Deployments

### Devnet
- ✅ Mint: `EUusnMaMbfEZJcK3iPdhrFjDjL5dyv8prMCuQ6uuC2mu`
- ✅ Network: Devnet
- ✅ Status: Confirmed
- ✅ Cost: FREE (airdrop)

### Mainnet
- ⏳ Ready to deploy
- 📍 Mint prepared: `BcA6acyPw8qqeeerDv7SnmyK3B7CMKCTvoZN2hzXwSig`
- 💰 Needs: Relayer funding

## 💡 Key Points

1. **You never need SOL** - Relayer pays everything
2. **You only sign** - With mint keypair
3. **Relayer pays fees** - All transaction costs
4. **Zero risk** - You control mint keypair
5. **Instant deployment** - Once relayer funded

## 🎯 Next Steps

Choose your path:

**A. Test on Devnet (Instant)**
```bash
npm run deploy:now
```

**B. Deploy to Mainnet**
```bash
# 1. Fund relayer
# Send 0.01 SOL to: TKR7CX2713rsJX76Sbr1YK77ZbqraHGbadn6gAUcQCc

# 2. Deploy
npm run deploy:direct

# 3. Verify
cat .cache/mint.json
```

---

**Status**: Relayer deployment system ready
**Your Cost**: 0 SOL (relayer pays all fees)
**Your Role**: Signer only
