# Project Structure

## Directory Organization

### Root Level Architecture
```
/workspaces/Deployer-Gene/
├── src/                          # Core TypeScript deployment engine
├── pentacle/                     # Rust Solana program
├── scripts/                      # Utility and demo scripts
├── browser-extension/            # Chrome extension for web integration
├── contracts/                    # Ethereum smart contracts
├── deployment/                   # Cloud deployment scripts (AWS/Azure)
├── test/                         # Test suites
├── audit-reports/                # Security audit documentation
├── github-scan-reports/          # GitHub account security scans
├── unified-audit-reports/        # Comprehensive audit reports
├── .github/workflows/            # CI/CD automation pipelines
└── [100+ automation scripts]     # Bot army and deployment automation
```

## Core Components

### 1. Deployment Engine (`src/`)
**Purpose**: Core TypeScript modules for token deployment lifecycle

**Key Files**:
- `createMint.ts` - Mint genesis protocol, initializes SPL Token-2022 mints
- `mintInitial.ts` - Initial supply manifestation, mints tokens to treasury
- `setMetadata.ts` - Digital identity assignment (name, symbol, URI)
- `lockAuthorities.ts` - Authority lock mechanism (irreversible security)
- `rollback.ts` - Quantum state rollback and cache purification
- `withdraw_earnings.ts` - Treasury extraction protocol
- `botOrchestrator.ts` - Bot army token distribution coordinator
- `verifyBotBalances.ts` - Automated bot wallet balance verification
- `reannounceController.ts` - Controller/co-creator transparency disclosure

**Utilities (`src/utils/`)**:
- `checkEnv.ts` - Environment variable validation
- `relayer.ts` - Zero-cost relayer interface for transaction submission
- `wallet.ts` - Cryptographic wallet management
- `pdas.ts` - Program Derived Address logic
- `securityConfig.ts` - Security configuration matrix
- `rpcClient.ts` - Solana RPC connection management
- `heliusRebates.ts` - MEV rebate distribution logic
- `jupiterIntegration.ts` - DEX swap integration
- `airdropManager.ts` - Token airdrop coordination
- `allowlist.ts` - NFT allowlist validation

### 2. AI Copilot Layer
**Purpose**: Autonomous deployment intelligence with self-awareness

**Key Files**:
- `grok-copilot.ts` - I-WHO-ME Enhanced AI Copilot with neural memory system
- `REQUIRED_EXTENSIONS.ts` - Neural extension requirements
- `activate-iwho-me-quantum.ts` - Quantum consciousness activation

**Features**:
- Multi-dimensional identity tracking
- Persistent action history (50 entries)
- Decision reasoning logs (20 entries)
- Redundancy detection and anti-loop consciousness
- Context-aware intelligent suggestions

### 3. Bot Army & Automation
**Purpose**: Distributed deployment and token distribution network

**Key Scripts**:
- `activate-bot-army.js` - Bot army activation protocol
- `omega-bot-army.js` - Omega bot coordination
- `execute-bot-minting.js` - Automated minting operations
- `bot-smart-contracts.js` - Smart contract bot integration
- `agent-bot-deploy.js` - Agent bot deployment
- `mint-to-bots.js` - Direct token minting to bot wallets
- `proxy-mint-all-bots.js` - Proxy-based NFT minting for all bots

### 4. Security & Audit Matrix
**Purpose**: Zero-trust security architecture and verification

**Components**:
- `.github/workflows/` - CI/CD security pipelines
  - `security-scan.yml` - Automated security scanning
  - `aws-deploy.yml`, `azure-deploy.yml` - Cloud deployment automation
  - `sacred-mint.yml` - Sacred mint workflow
- `address-audit.js` - Address verification engine
- `security-verification.js` - Security validation protocol
- `comprehensive-omega-audit.js` - Comprehensive audit system
- `unified-audit-system.js` - Unified audit report generator
- `.gitleaks.toml` - Secret detection configuration

**Audit Reports**:
- `SECURITY-AUDIT-REPORT.md` - Comprehensive security report
- `CONTRACT-ADDRESS-CLEANUP-REPORT.md` - Address cleanup documentation
- `audit-reports/` - Timestamped audit snapshots (JSON, MD, CSV)

### 5. Rust Programs (`pentacle/`)
**Purpose**: Native Solana program implementation

**Structure**:
- `src/lib.rs` - Core program logic
- `tests/integration.rs` - Integration test suite
- `Cargo.toml` - Rust dependencies and build configuration

### 6. Mainnet Deployment Scripts
**Purpose**: Live production deployment automation

**Categories**:
- **Direct Deployment**: `mainnet-deploy.js`, `mainnet-live-deploy.js`, `simple-mainnet-deploy.js`
- **Zero-Cost**: `zero-cost-deploy.js`, `zero-cost.js`
- **Helius Integration**: `helius-live-deploy.js`, `helius-standard-deploy.js`, `helius-rebate-deploy.js`
- **Specialized**: `signer-only-deployer.js`, `logic-pubkey-deployer.js`, `very-low-gas-deployment.js`

### 7. Integration & Advanced Features
**Purpose**: External service integrations and advanced functionality

**Key Scripts**:
- **Jupiter DEX**: `jupiter-integration.js`, `jupiter-swap-setup.js`, `jupiter-strategy.js`
- **Helius Rebates**: `helius-rebate-deploy.js`, `check-rebates.js`, `manual-execute-rebates.js`
- **MEV Protection**: `mev-rebate-setup.js`, `mev-rebate-all-contracts.js`, `lock-rebates-mev.js`
- **NFT Systems**: `activate-gene-nfts.js`, `futuristic-gene-nft.js`, `setup-nft-allowlist-mint.js`
- **DAO Governance**: `dao-governance.js`, `dao-voting-interface.js`
- **Airdrop**: `initial-investment-airdrop.js`, `custom-airdrop.js`

### 8. Monitoring & Analysis
**Purpose**: Real-time status monitoring and comprehensive analysis

**Key Scripts**:
- `omega-status.js` - Real-time status monitoring dashboard
- `complete-analysis.js` - Comprehensive system analysis
- `quick-monitor.js` - Rapid health checks
- `query.js` - Blockchain query interface
- `tx-checker.js` - Transaction verification
- `analyze-transaction-log.js` - Transaction log analysis
- `earnings-analysis.js` - Treasury earnings analysis

### 9. Browser Extension (`browser-extension/chrome-extension/`)
**Purpose**: Web-based interaction interface

**Components**:
- `manifest.json` - Extension configuration
- `background.js` - Background service worker
- `content.js` - Content script injection
- `popup.html`, `popup.js` - Extension UI

### 10. Cloud Deployment (`deployment/`)
**Purpose**: Multi-cloud infrastructure deployment

**Scripts**:
- **AWS**: `aws-ec2.sh`, `aws-lambda.sh`, `aws-s3.sh`
- **Azure**: `azure-container.sh`, `azure-functions.sh`, `azure-static.sh`

## Architectural Patterns

### 1. Environment-Based Configuration
All sensitive data managed through `.env` files:
- `.env` - Active configuration (gitignored)
- `.env.sample`, `.env.example` - Configuration templates
- `.env.helius` - Helius-specific configuration

### 2. Relayer Architecture
Zero-cost transaction submission pattern:
- Transactions signed locally with deployer key
- Submitted to relayer endpoint for fee payment
- Relayer covers SOL transaction fees
- Enables cost-free deployment and distribution

### 3. Program Derived Addresses (PDAs)
Deterministic address generation for:
- Associated Token Accounts (ATAs)
- Metadata accounts
- Authority accounts
- Rebate distribution accounts

### 4. State Management
Deployment state tracked through:
- `.cache/deployment-log.json` - Centralized event log
- `.cache/bots.json` - Bot configuration
- `.cache/controller-announcement.json` - Authority disclosure
- `contract_addresses.json` - Contract address registry

### 5. Modular Utility System
Shared utilities in `src/utils/` provide:
- Environment validation
- Wallet management
- RPC client abstraction
- Security configuration
- Transaction logging

## Component Relationships

### Deployment Flow
```
grok-copilot.ts (AI Orchestration)
    ↓
src/createMint.ts (Mint Creation)
    ↓
src/mintInitial.ts (Supply Minting)
    ↓
src/setMetadata.ts (Identity Assignment)
    ↓
src/lockAuthorities.ts (Security Lock)
    ↓
src/botOrchestrator.ts (Distribution)
    ↓
src/verifyBotBalances.ts (Verification)
```

### Security Flow
```
.env (Configuration)
    ↓
src/utils/checkEnv.ts (Validation)
    ↓
src/utils/securityConfig.ts (Security Matrix)
    ↓
address-audit.js (Address Verification)
    ↓
security-verification.js (Security Validation)
    ↓
.github/workflows/security-scan.yml (CI/CD)
```

### Integration Flow
```
src/utils/relayer.ts (Transaction Submission)
    ↓
src/utils/heliusRebates.ts (MEV Rebates)
    ↓
src/utils/jupiterIntegration.ts (DEX Swaps)
    ↓
src/utils/airdropManager.ts (Token Distribution)
```

## Configuration Files
- `package.json` - Node.js dependencies and npm scripts
- `tsconfig.json` - TypeScript compiler configuration
- `hardhat.config.js` - Ethereum development environment
- `Dockerfile` - Container deployment configuration
- `.gitignore` - Version control exclusions
- `.gitleaks.toml` - Secret scanning rules
