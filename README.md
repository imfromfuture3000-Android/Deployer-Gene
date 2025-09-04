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
Edit `.env`:
```
RPC_URL=https://api.mainnet-beta.solana.com
RELAYER_URL=https://<your-relayer-domain>/relay/sendRawTransaction
RELAYER_PUBKEY=<RELAYER_FEE_PAYER_PUBKEY>
TREASURY_PUBKEY=<YOUR_TREASURY_PUBKEY>
DAO_PUBKEY=<YOUR_DAO_MULTISIG_PUBKEY> # Optional
AUTHORITY_MODE=null # Options: null, dao, treasury
DRY_RUN=false
RELAYER_API_KEY=<YOUR_API_KEY> # Optional
```

## One-Command Deployment
```
npm run mainnet:all
```

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
- No private keys are stored in the repo.
- Relayer pays fees: All fees are covered by the relayer.
- Authority lock: Setting to `null` is irreversible.

## Post-Deploy Checklist
1. Verify mint: https://explorer.solana.com/address/<MINT_ADDRESS>
2. Check treasury ATA: https://explorer.solana.com/address/<TREASURY_ATA>
3. Confirm metadata and authorities via Explorer.

## CI/CD
A GitHub Actions workflow can be added under `.github/workflows/deploy.yml` to automate deployment.
