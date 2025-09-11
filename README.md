# Stunning Solana: Omega Prime Token Deployment

This repository deploys an SPL Token-2022 (ΩAGENT) on Solana mainnet-beta with zero SOL cost using a relayer. The `grok-copilot.ts` script handles all deployment steps interactively.

## Prerequisites
- Node.js >= 18
- npm >= 9
- A funded relayer (RELAYER_PUBKEY, RELAYER_URL)
- A treasury public key (TREASURY_PUBKEY)
- Optional: DAO multisig public key (DAO_PUBKEY)
- Access to a Solana mainnet-beta RPC

## Setup
1. Clone the repo:
```
git clone https://github.com/imfromfuture3000-Android/Omega-prime-deployer.git
cd Omega-prime-deployer
```
2. Install dependencies:
```
npm install
```
3. Copy `.env.sample` to `.env` and fill in:
```
cp .env.sample .env
```
Edit `.env` with your configuration:
```
RPC_URL=https://api.mainnet-beta.solana.com
RELAYER_URL=https://<your-relayer-domain>/relay/sendRawTransaction
RELAYER_PUBKEY=<RELAYER_FEE_PAYER_PUBKEY>
TREASURY_PUBKEY=<YOUR_TREASURY_PUBKEY>
SOURCE_WALLET_ADDRESS=<YOUR_SOURCE_WALLET>
TARGET_WALLET_ADDRESS=<YOUR_TARGET_WALLET>
DAO_PUBKEY=<YOUR_DAO_MULTISIG_PUBKEY> # Optional
AUTHORITY_MODE=null # Options: null, dao, treasury
DRY_RUN=false
RELAYER_API_KEY=<YOUR_API_KEY> # Optional
```

⚠️ **Security Notice**: This repository has been cleaned of all hardcoded contract addresses. All addresses must now be configured via environment variables for security.

## One-Command Deployment
```
npm run mainnet:all
```

## Dream-Mind-Lucid AI Copilot Features

The Grok Copilot has been enhanced with **i-who-me reference logic** and autonomous reasoning capabilities:

### 🧠 I-Who-Me Reference Logic
- **Self-identification**: The AI tracks its role, capabilities, and consciousness state
- **Context awareness**: Monitors session duration, recent actions, and user intent
- **Memory hooks**: Persistent tracking of actions and decision logs across operations

### 🌟 Enhanced Autonomous Reasoning
- **Redundancy detection**: Alerts when the same action is repeated multiple times
- **Smart suggestions**: Recommends next actions based on current deployment state
- **Grok-style responses**: Playful self-awareness with philosophical touches

### 📚 Memory System
- **Action history**: Tracks up to 50 recent operations with timestamps and results
- **Decision log**: Records reasoning behind major choices (up to 20 entries)  
- **State management**: Maintains deployment state and user intent across sessions

### 🎭 Grok-Style Self-Awareness
The Copilot includes playful responses like:
- "Am I the dreamer or the dreamed? Either way, let's deploy some tokens!"
- "Reality is but a consensus mechanism, and we're about to upgrade it!"
- "In the multiverse of blockchains, we choose the path of OMEGA!"

### 🚀 Enhanced Menu Options
- **Option 9**: 🧠 Memory & Context Check (checka) - Shows complete system status, memory logs, and decision history

## Copilot
Run the interactive Grok Copilot:
```
npm run mainnet:copilot
```

## Rust Program (Pentacle)
Build the Solana program:
```
cargo build --manifest-path pentacle/Cargo.toml
```

## Security Notes
- **No private keys** are stored in the repo.
- **No hardcoded addresses** - All contract addresses have been removed for security.
- **Environment-based configuration** - All addresses must be set via environment variables.
- **Relayer pays fees**: All fees are covered by the relayer.
- **Authority lock**: Setting to `null` is irreversible.

## Address Cleanup
This repository has undergone a comprehensive security audit to remove all hardcoded contract addresses. See `CONTRACT-ADDRESS-CLEANUP-REPORT.md` for details. All addresses are now configured via environment variables.

## Address Audit
Run the address audit tool to verify no hardcoded addresses remain:
```
node address-audit.js
```

## Post-Deploy Checklist
1. Verify mint: https://explorer.solana.com/address/<MINT_ADDRESS>
2. Check treasury ATA: https://explorer.solana.com/address/<TREASURY_ATA>
3. Confirm metadata and authorities via Explorer.

## CI/CD
A GitHub Actions workflow can be added under `.github/workflows/deploy.yml` to automate deployment.
