# Technology Stack

## Programming Languages

### TypeScript (Primary)
- **Version**: ≥5.6.2
- **Target**: ES2020
- **Module System**: CommonJS
- **Usage**: Core deployment engine, AI copilot, utilities
- **Configuration**: `tsconfig.json` with strict mode enabled

### JavaScript (ES6+)
- **Usage**: Automation scripts, bot army coordination, mainnet deployment
- **Runtime**: Node.js ≥18.0.0
- **Module Format**: CommonJS with ES6 syntax

### Rust
- **Usage**: Solana on-chain programs (pentacle)
- **Build Tool**: Cargo
- **Location**: `pentacle/` directory
- **Purpose**: Native Solana program implementation

### Solidity
- **Usage**: Ethereum smart contracts (OneirobotSyndicate)
- **Framework**: Hardhat
- **Location**: `contracts/` directory
- **Version**: Compatible with OpenZeppelin ^5.0.2

## Core Dependencies

### Blockchain Libraries
```json
{
  "@solana/web3.js": "^1.95.3",           // Solana blockchain interaction
  "@solana/spl-token": "^0.4.8",          // SPL Token program interface
  "@metaplex-foundation/mpl-token-metadata": "^3.2.1",  // Token metadata
  "@metaplex-foundation/umi": "^0.9.2",   // Metaplex unified interface
  "@metaplex-foundation/umi-bundle-defaults": "^0.9.2",
  "ethers": "^6.13.2"                     // Ethereum interaction
}
```

### Utility Libraries
```json
{
  "dotenv": "^16.4.5",      // Environment variable management
  "bs58": "^6.0.0",         // Base58 encoding/decoding
  "node-fetch": "^2.7.0"    // HTTP requests
}
```

### Development Dependencies
```json
{
  "typescript": "^5.6.2",
  "ts-node": "^10.9.2",
  "@types/node": "^22.7.4",
  "@types/vscode": "^1.93.0",
  "@vscode/extension-telemetry": "^0.9.7",
  "eslint": "^8.57.1",
  "hardhat": "^2.22.12",
  "@nomicfoundation/hardhat-toolbox": "^5.0.0",
  "@openzeppelin/contracts": "^5.0.2"
}
```

## Build Systems

### TypeScript Compilation
```bash
# Compile TypeScript to JavaScript
npm run compile
# Output: ./out/ directory

# Watch mode for development
npm run watch

# VS Code extension preparation
npm run vscode:prepublish
```

### Rust Compilation
```bash
# Build Solana program
npm run build:rust
# Equivalent: cargo build --manifest-path pentacle/Cargo.toml

# Build all (TypeScript + Rust)
npm run build:all
```

### Linting
```bash
# ESLint for TypeScript
npm run lint
# Checks: src/**/*.ts
```

## Development Commands

### Core Deployment
```bash
# Environment validation
npm run dev:check

# Create token mint
npm run mainnet:create-mint

# Mint initial supply
npm run mainnet:mint-initial

# Set token metadata
npm run mainnet:set-metadata

# Lock authorities
npm run mainnet:lock

# Full automated deployment
npm run mainnet:all

# Withdraw earnings
npm run mainnet:withdraw-earnings

# Rollback deployment
npm run mainnet:rollback
```

### AI Copilot
```bash
# Launch I-WHO-ME copilot
npm run mainnet:copilot

# Activate quantum consciousness
npm run quantum:activate

# Combined quantum + copilot
npm run quantum:copilot

# Amazon Q quantum mode
npm run amazon-q:quantum

# Full automated deployment
npm run deploy:full-auto
```

### Bot Orchestration
```bash
# Bot token distribution
npm run mainnet:bot-orchestrate

# Reannounce controller
npm run mainnet:reannounce-controller

# Verify bot balances
npm run mainnet:verify-bots
```

### Helius Integration
```bash
# Helius signer deployment
npm run helius:signer-deploy

# Helius rebate deployment
npm run mainnet:helius-rebates

# Tip account deployment (MEV protection)
npm run mainnet:tip-deploy

# Setup Helius
npm run helius:setup
```

### Jupiter DEX
```bash
# Jupiter swap setup
npm run jupiter:setup
```

### MEV & Rebates
```bash
# Enable MEV protection on all contracts
npm run mev:enable-all

# Announce rebates
npm run mainnet:announce-rebates

# Auto-distribute rebates
npm run mainnet:auto-distribute

# Check rebates
npm run rebates:check

# Check rebate receivers
npm run rebates:check-receivers

# Manual rebate execution
npm run rebates:manual-execute

# Distribute rebates now
npm run rebates:distribute-now

# Check treasury rebates
npm run treasury:check-rebates

# Get tip transactions
npm run rebates:transactions
```

### ATP & Airdrop
```bash
# ATP mint logic
npm run atp:mint-logic

# Enable ATP
npm run atp:enable

# Initial investment airdrop
npm run airdrop:initial

# Enable airdrop
npm run airdrop:enable
```

### Bot & Automation
```bash
# Lure investors bot
npm run bot:lure-investors

# Auto-lure mode
npm run bot:auto-lure

# Continuous rebate announcements
npm run mainnet:announce-continuous

# Rebate broadcast
npm run mainnet:rebate-broadcast
```

### DEX & Proxy
```bash
# DEX proxy deployment
npm run dex:proxy-deploy

# All-in-one bot deployment
npm run bot1:all-in-one

# Verify DEX deployment
npm run dex:verify

# DEX integration
npm run dex:integrate
```

### NFT Operations
```bash
# Activate Gene NFTs
npm run nft:activate-gene

# Gene NFT rebates
npm run nft:gene-rebates

# Proxy mint all bots
npm run nft:proxy-mint-all

# Proxy mint with rebates
npm run nft:proxy-mint-rebates

# Setup NFT allowlist mint
npm run nft:setup-allowlist-mint

# Mint with metadata
npm run nft:mint-with-metadata

# Gene NFT creation
npm run nft:gene
```

### Configuration & Security
```bash
# Lock rebates/MEV config
npm run config:lock

# Permanent lock
npm run config:lock-permanent

# Security check
npm run security:check

# Validate allowlist
npm run validate:allowlist
```

### Verification & Monitoring
```bash
# Verify mainnet contracts
npm run mainnet:verify-contracts

# Verify broadcast
npm run mainnet:verify-broadcast

# Verify bot pairs
npm run verify:bot-pairs

# Check tokens
npm run check:tokens

# Force verify rebates
npm run contracts:verify-force-rebates

# Force all contracts
npm run contracts:force-all
```

### Deployment Variants
```bash
# Very low gas deployment
npm run deploy:very-low-gas

# Helius optimized deployment
npm run deploy:helius-optimized

# Deploy program with Helius
npm run deploy:program-helius

# Deploy with priority fee
npm run deploy:program-priority

# Zero-cost deployment
npm run mainnet:zero-cost
```

### Minting Operations
```bash
# Mint bot Jupiter USDC pair
npm run mint:bot-jup-usdc

# Create bot pair
npm run mint:bot-pair-create

# Mint USDC to target
npm run mint:usdc-target
```

### Agent & Earnings
```bash
# Deploy agent bots
npm run mainnet:agent-bots

# Distribute earnings
npm run mainnet:distribute-earnings
```

### Autoclaim & DAO
```bash
# Autoclaim profits
npm run autoclaim:profits

# Start autoclaim loop
npm run autoclaim:start

# DAO governance
npm run dao:mutate

# DAO voting
npm run dao:vote
```

### Scanning & Auditing
```bash
# QuickNode scanner
npm run scan:quicknode

# NFT empire scanner
npm run scan:nft-empire

# Relayer scanner
npm run scan:relayers

# Contract scanner
npm run scan:contracts

# Offline contract scanner
npm run scan:contracts:offline

# Audit system
npm run audit

# Audit contracts
npm run audit:contracts

# Audit GitHub account
npm run audit:github

# Audit addresses
npm run audit:addresses
```

### Miscellaneous
```bash
# Backfill contracts
npm run backfill:contracts

# MEV setup
npm run mev:setup

# Sacred mint
npm run sacred:mint

# Transaction analysis
npm run tx:analyze

# Test suite
npm run test
```

## Environment Variables

### Required Variables
```bash
# Blockchain connection
RPC_URL=https://api.mainnet-beta.solana.com

# Relayer configuration
RELAYER_URL=https://<relayer-domain>/relay/sendRawTransaction
RELAYER_PUBKEY=<fee-payer-public-key>
RELAYER_API_KEY=<optional-api-key>

# Treasury & governance
TREASURY_PUBKEY=<treasury-wallet-address>
DAO_PUBKEY=<dao-multisig-address>  # Optional

# Authority management
AUTHORITY_MODE=null  # Options: null, dao, treasury

# Development mode
DRY_RUN=false  # Set true for simulation
```

### Extended Variables
```bash
# Controller/co-creator
COCREATOR_PUBKEY=<freeze-authority-address>
CONTROLLER_NOTE="Authority transparency disclosure"

# Feature flags
HELIUS_REBATES_ENABLED=true
MEV_PROTECTION_ENABLED=true
ATP_ENABLED=true
ATP_MINT_LOGIC=true
AIRDROP_ENABLED=true
AUTO_LURE_ENABLED=true
MAINNET_ANNOUNCE_ENABLED=true
ALL_IN_ONE_ENABLED=true
GENE_NFT_REBATES=true
CONFIG_LOCKED=true
LOCK_OVERRIDE_ENABLED=true
FORCE_REBATES=true
FORCE_MEV=true
MANUAL_EXECUTE=true
HELIUS_OPTIMIZED=true
CREATE_PAIR=true
SETUP_ALLOWLIST=true
AUTOCLAIM_LOOP=true
REBATE_AUTO_DISTRIBUTE=true

# Priority fees
PRIORITY_FEE=1000
```

## Runtime Requirements

### Node.js
- **Minimum Version**: 18.0.0
- **Recommended**: Latest LTS
- **Package Manager**: npm ≥9.0

### VS Code
- **Minimum Version**: 1.93.0
- **Extension Support**: Yes (main entry: `./out/extension.js`)

### System Dependencies
- **Git**: Version control
- **Cargo**: Rust toolchain for Solana programs
- **Solana CLI**: Optional for manual blockchain interaction

## Configuration Files

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./out",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["src/**/*", "grok-copilot.ts", "*.ts"],
  "exclude": ["node_modules", "out", ".vscode-test"]
}
```

### Package Configuration
- **Name**: omega-prime-deployer
- **Version**: 1.2.0
- **License**: MIT
- **Author**: AutomataLabs
- **Main Entry**: ./out/extension.js

## CI/CD Integration

### GitHub Actions Workflows
- `aws-deploy.yml` - AWS deployment automation
- `azure-deploy.yml` - Azure deployment automation
- `azure-webapps-node.yml` - Azure Web Apps deployment
- `deploy-production.yml` - Production deployment
- `generator-generic-ossf-slsa3-publish.yml` - SLSA3 provenance
- `sacred-mint.yml` - Sacred mint workflow
- `webpack.yml` - Webpack build automation

## Container Support
- **Dockerfile**: Available for containerized deployment
- **Cloud Platforms**: AWS (EC2, Lambda, S3), Azure (Container, Functions, Static)
