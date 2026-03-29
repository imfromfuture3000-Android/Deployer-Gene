# DAO Treasury Withdrawal Plan & Configuration

## 📊 Available Liquidity

Based on deployment data from `.cache/node-votes-nft-bots-deployment.json`:

| Period | Amount | Details |
|--------|--------|---------|
| **Daily** | 409.92 SOL | Vote rewards + Bot earnings + Governance + NFT royalties |
| **Monthly** | 12,297.60 SOL | 30-day accumulation (~$369K at current rates) |
| **Annually** | 149,620.80 SOL | Full year projection (~$4.5M at current rates) |

## 🏦 Treasury Accounts

### Primary Authority (Master Signer)
```
Address: zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4
Role: DAO Authority, Program Upgrade Authority, Mint Authority
Network: Solana Mainnet
Verified: ✅ YES
```

### Treasury Holding Accounts
To enable withdrawals, establish dedicated treasure holding accounts:

1. **Main Treasury (receives daily earnings)**
   - Should receive bot payouts and voting rewards
   - Current balance: 0 SOL (earnings routed elsewhere)

2. **Liquidity Reserve** (for operational costs)
   - Hold 1-2 months of expenses
   - Recommended: ~25,000 SOL minimum

3. **DAO Treasury Multi-Sig** (RECOMMENDED)
   - 3-of-5 signers for safety
   - Signers: DAO core team members
   - Required for withdrawals >10,000 SOL

## 💸 Withdrawal Instructions

### Option 1: Create Unsigned Withdrawal (Requires Later Signing)
```bash
# Create a withdrawal transaction
node scripts/withdraw-sol.js withdraw 100
# Output: .cache/pending-withdrawal.json

# Share with signers for approval
# Signers use their private keys to sign and broadcast
```

### Option 2: Execute Withdrawal (With Private Key)
```bash
# Set private key in environment
export DEPLOYER_PRIVATE_KEY="base64-encoded-key"

# Execute withdrawal
node scripts/withdraw-sol.js execute 100

# Or specify key file
node scripts/withdraw-sol.js execute 100 /path/to/key.pem
```

### Option 3: View Treasury History
```bash
node scripts/withdraw-sol.js history
```

## 🔐 Security Best Practices for Withdrawals

### Single Withdrawal Limits
- **<1,000 SOL**: Can be single-signed by authority
- **1,000-10,000 SOL**: Recommend 2-of-3 multi-sig approval
- **>10,000 SOL**: Require 3-of-5 multi-sig + timelock (24-48 hours)

### Required Documentation
1. ✅ Withdrawal request with purpose
2. ✅ Amount and destination address verification
3. ✅ Approval from DAO governance (for >5,000 SOL)
4. ✅ Transaction signature from authorized signers
5. ✅ On-chain confirmation and logging

### Audit Trail
All withdrawals are logged to:
- `.cache/withdrawal-history.json` (local)
- Solana blockchain (immutable)
- DAO governance records (if multi-sig)

## 🚀 Setup Steps (Recommended)

### Step 1: Establish Treasury Holding Account
```bash
# Create new treasury account
solana-keygen new -o treasury-key.json

# Fund it with earnings
# Transfer from bot payout accounts to treasury
```

### Step 2: Setup Multi-Sig (3-of-5)
```bash
# Using Squads (recommended Solana multi-sig)
# Members: 
#   - Authority: zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4
#   - Core team members (4 additional signers)

# Or using SPL Governance
# Requires creating DAO governance token + voting
```

### Step 3: Enable Automated Payouts
```bash
# Configure bot payout script to deposit earnings to treasury
# Update bot scripts to:
# 1. Collect daily earnings from 5 bots
# 2. Aggregate in treasury account
# 3. Await withdrawal approval
```

### Step 4: Configure Withdrawal Approvals
```bash
# In treasury smart contract:
# - Set minimum withdrawal thresholds
# - Configure timelock delays
# - Enable emergency pause function
```

## 📋 Current Withdrawal Status

| Item | Status | Action |
|------|--------|--------|
| **Treasury Address** | ❌ Not Set | Create dedicated treasury account |
| **Bot Payouts** | ❌ Not Routed | Configure bots to deposit earnings |
| **Multi-Sig Authority** | ❌ Not Enabled | Deploy 3-of-5 Squads multi-sig |
| **Withdrawal Tool** | ✅ Ready | `scripts/withdraw-sol.js` |
| **Audit Logging** | ✅ Ready | `.cache/withdrawal-history.json` |
| **Liquidity Pool** | ❌ Empty | Fund with bot earnings |

## 💡 Next Steps

1. **Immediate**: Deploy MPC system for multi-sig signing (see `src/mpc/`)
2. **Short-term**: Create treasury smart contract with timelock
3. **Medium-term**: Implement automated bot payout to treasury
4. **Long-term**: Enable DAO governance voting on large withdrawals

## 📞 Example Withdrawal Scenarios

### Scenario A: Withdraw 100 SOL for operations
```bash
# 1. Create withdrawal
node scripts/withdraw-sol.js withdraw 100

# 2. Share pending-withdrawal.json with signers
# 3. Signers approve in multi-sig interface
# 4. Broadcast signed transaction
```

### Scenario B: Withdraw 50% of monthly earnings (~6,000 SOL)
```bash
# 1. Request governance approval (7-day voting period)
# 2. Upon approval, create withdrawal for 6,000 SOL
# 3. Requires 3-of-5 multi-sig
# 4. Execute with 24-hour timelock
# 5. Broadcast and confirm on-chain
```

### Scenario C: Emergency withdrawal (all funds)
```bash
# Authority can bypass governance for emergency
# But still requires multi-sig for safety
# Documented in emergency-withdrawal.json
# Posted to blockchain for audit trail
```

## 🔗 Related Files

- Main withdrawal tool: `scripts/withdraw-sol.js`
- MPC signing system: `src/mpc/mpcCore.js`
- DAO audit: `scripts/scan-dao-operations.js`
- Deployment data: `.cache/node-votes-nft-bots-deployment.json`
- Signer mapping: `.cache/copilot-signer-mapping.json`

---

**Generated**: 2026-01-27  
**DAO**: Omega Prime  
**Authority**: zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4  
**Status**: Ready for configured withdrawals (pending treasury setup)
