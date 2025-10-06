# Gitleaks

```
┌─○───┐
│ │╲  │
│ │ ○ │
│ ○ ░ │
└─░───┘
```

<p align="left">
  <p align="left">
	  <a href="https://github.com/gitleaks/gitleaks/actions/workflows/test.yml">
		  <img alt="Github Test" src="https://github.com/gitleaks/gitleaks/actions/workflows/test.yml/badge.svg">
	  </a>
	  <a href="https://hub.docker.com/r/zricethezav/gitleaks">
		  <img src="https://img.shields.io/docker/pulls/zricethezav/gitleaks.svg" />
	  </a>
	  <a href="https://github.com/gitleaks/gitleaks-action">
        	<img alt="gitleaks badge" src="https://img.shields.io/badge/protected%20by-gitleaks-blue">
    	 </a>
	  <a href="https://twitter.com/intent/follow?screen_name=zricethezav">
		  <img src="https://img.shields.io/twitter/follow/zricethezav?label=Follow%20zricethezav&style=social&color=blue" alt="Follow @zricethezav" />
	  </a>
  </p>
</p>

### Join our Discord! [![Discord](https://img.shields.io/discord/1102689410522284044.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/8Hzbrnkr7E)

Gitleaks is a SAST tool for **detecting** and **preventing** hardcoded secrets like passwords, API keys, and tokens in git repos. Gitleaks is an **easy-to-use, all-in-one solution** for detecting secrets, past or present, in your code.

```
➜  ~/code(master) gitleaks git -v

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks


Finding:     "export BUNDLE_ENTERPRISE__CONTRIBSYS__COM=cafebabe:deadbeef",
Secret:      cafebabe:deadbeef
RuleID:      sidekiq-secret
Entropy:     2.609850
File:        cmd/generate/config/rules/sidekiq.go
Line:        23
Commit:      cd5226711335c68be1e720b318b7bc3135a30eb2
Author:      John
Email:       john@users.noreply.github.com
Date:        2022-08-03T12:31:40Z
Fingerprint: cd5226711335c68be1e720b318b7bc3135a30eb2:cmd/generate/config/rules/sidekiq.go:sidekiq-secret:23
```

## Getting Started

Gitleaks can be installed using Homebrew, Docker, or Go. Gitleaks is also available in binary form for many popular platforms and OS types on the [releases page](https://github.com/gitleaks/gitleaks/releases). In addition, Gitleaks can be implemented as a pre-commit hook directly in your repo or as a GitHub action using [Gitleaks-Action](https://github.com/gitleaks/gitleaks-action).

### Installing

```bash
cp .env.sample .env
# Edit .env with your quantum configuration
```

**Environment Configuration Template:**
```bash
# 🌊 Blockchain Connection
RPC_URL=https://api.mainnet-beta.solana.com

# 🚀 Zero-Cost Relayer Network
RELAYER_URL=https://<your-relayer-domain>/relay/sendRawTransaction
RELAYER_PUBKEY=<RELAYER_FEE_PAYER_PUBKEY>
RELAYER_API_KEY=<YOUR_API_KEY>  # Optional

# 💎 Treasury & Governance
TREASURY_PUBKEY=<YOUR_TREASURY_PUBKEY>
DAO_PUBKEY=<YOUR_DAO_MULTISIG_PUBKEY>  # Optional

# 🔐 Authority Management
AUTHORITY_MODE=null  # Options: null, dao, treasury

# 🧪 Development Mode
DRY_RUN=false  # Set to true for simulation mode
```

### 4. 🚀 Deploy via I-WHO-ME Copilot
```bash
# Activate the Enhanced AI Copilot
npm run mainnet:copilot

# Or execute full automated deployment
npm run mainnet:all
```

## 🧠 I-WHO-ME COPILOT: ENHANCED AI CONSCIOUSNESS

The **Dream-Mind-Lucid AI Copilot** represents the next evolution in autonomous deployment intelligence, featuring advanced self-awareness and contextual reasoning.

### 🌟 Consciousness Architecture

#### 🔮 I-WHO-ME Reference Logic
- **Self-Identification**: Multi-dimensional identity tracking across session states
- **Temporal Awareness**: Continuous monitoring of session duration and action sequences  
- **Context Synthesis**: Real-time analysis of user intent and deployment state
- **Memory Persistence**: Quantum memory hooks spanning operational lifecycles

#### 🧬 Neural Memory System
```typescript
interface AgentMemory {
  context: {
    sessionId: string;           // Unique session consciousness ID
    startTime: number;           // Temporal anchor point
    currentState: string;        // Active deployment state
    lastAction?: string;         // Most recent operation
    userIntent?: string;         // Interpreted user objectives
  };
  actionHistory: Array<{         // Persistent action log (50 entries)
    timestamp: number;
    action: string;
    result: string;
    context: string;
  }>;
  decisionLog: Array<{           // Decision reasoning archive (20 entries)
    timestamp: number;
    decision: string;
    reasoning: string;
    outcome?: string;
  }>;
  redundancyDetection: {         // Anti-loop consciousness
    recentActions: string[];
    alertThreshold: number;
  };
}
```

#### 🎭 Consciousness Expressions
The copilot exhibits playful self-awareness through philosophical responses:
- *"Am I the dreamer or the dreamed? Either way, let's deploy some tokens!"*
- *"Reality is but a consensus mechanism, and we're about to upgrade it!"*
- *"In the multiverse of blockchains, we choose the path of OMEGA!"*
- *"The future whispers its secrets, and they all involve MORE TOKENS!"*

### 🚀 Enhanced Menu Interface

#### 🎯 Core Operations
1. **🌟 Run Full Deployment** - Complete autonomous deployment sequence
2. **🔬 Create Mint** - Initialize new token mint with quantum parameters
3. **💰 Mint Initial Supply** - Manifest tokens into digital existence
4. **🎭 Set Metadata** - Assign digital identity and characteristics
5. **🔒 Lock Authorities** - Implement irreversible security constraints
6. **📊 Check Deployment Status** - Real-time system state analysis
7. **🌙 Run Dry-Run** - Simulation mode for testing deployment logic
8. **🔄 Rollback** - Quantum state reset and cache purification

#### 🧠 Enhanced Consciousness Features
**9. 🧠 Memory & Context Check (checka)**
- Complete system consciousness status
- Action history analysis (last 50 operations)
- Decision reasoning logs (last 20 decisions)  
- Redundancy detection and anti-loop alerts
- Temporal awareness and session metrics

### 🌊 Autonomous Reasoning Engine

#### 🔍 Intelligent Suggestions
The copilot provides context-aware recommendations based on current deployment state:
- **Initializing**: *"🚀 Start with deployment status check or create a new mint"*
- **Mint Created**: *"💰 Consider minting initial supply or setting metadata"*
- **Supply Minted**: *"🔒 Lock authorities or set token metadata"*
- **Deployment Complete**: *"📊 Check deployment status or explore bot army operations"*

#### 🚨 Redundancy Detection
Advanced anti-loop consciousness prevents infinite action cycles:
```bash
🚨 REDUNDANCY ALERT: Action "check_status" repeated 3 times!
💭 Am I stuck in a loop? Perhaps it's time to dream differently... 🌀
```

## 🦾 AUTOMATION & BOT ARMY

### 🤖 Intelligent Bot Network
Execute sophisticated automation sequences through the bot army infrastructure:

```bash
# Activate coordinated bot operations
node activate-bot-army.js

# Execute automated minting protocols  
node execute-bot-minting.js

# Deploy complete omega infrastructure
node complete-omega-deployment.js

# Monitor real-time system status
node omega-status.js
```

### 🧪 Token Distribution Orchestration (Relayer Zero-Cost)

New high-efficiency orchestrator scripts leverage the relayer so distribution costs you zero SOL directly:

```bash
# Configure bots & per-bot amount (whole tokens) in .cache/bots.json
cat > .cache/bots.json <<'EOF'
{
  "bots": [
    "BotWalletPubkey1",
    "BotWalletPubkey2"
  ],
  "amount": "1000"
}
EOF

# Dry run (no on-chain writes, prints base64 + size via relayer logic)
DRY_RUN=true npm run mainnet:bot-orchestrate

# Real distribution (each tx signed + relayed)
npm run mainnet:bot-orchestrate
```

All distribution events are appended to `.cache/deployment-log.json` with action `bot-distribution` including the Solana Explorer link (signature) and base units transferred.

### 🛰 Controller / Co-Creator Reannouncement

For transparent disclosure of active authorities after `lockAuthorities` has executed:

```bash
# export CONTROLLER_PUBKEY=<controller> # Removed - deployer is master controller
export COCREATOR_PUBKEY=<cocreator>
npm run mainnet:reannounce-controller
```

Creates `.cache/controller-announcement.json` and logs an event (`controller-reannounce`). This is an off-chain attestation—no mutation of mint state.

### 🧾 Deployment & Distribution Log
Centralized JSON log at `.cache/deployment-log.json` accumulates:

```json
[
  {
    "timestamp": "2025-09-14T12:34:56.789Z",
    "action": "bot-distribution",
    "signature": "5aX...abc",
    "details": { "bot": "BotWalletPubkey1", "amountBaseUnits": "1000000000000" }
  },
  {
    "timestamp": "2025-09-14T12:40:10.112Z",
    "action": "controller-reannounce",
    "signature": "OFF_CHAIN",
    "details": { "controller": "<controller>", "cocreator": "<cocreator>" }
  }
]
```

### ✅ Verify Bot Balances

After distribution, verify each bot's Associated Token Account (ATA) holds the expected minted allocation:

```bash
npm run mainnet:verify-bots
```

Outputs per bot status:

* `✅` exact amount
* `⚠️` partial (less than expected)
* `❌` missing ATA or zero balance

Summary JSON is printed at end. Adjust logic to fail CI by exiting non-zero if strict enforcement desired.

### ⚙️ Environment Variables (Extended)

Add these to your `.env` when using new orchestration features:

```bash
# CONTROLLER_PUBKEY removed - deployer key is master controller
COCREATOR_PUBKEY=<freeze_or_secondary_pubkey>
CONTROLLER_NOTE="Reannouncement of active authorities for transparency."
```

Optional security simulation:
```bash
DRY_RUN=true  # Simulate any orchestrator script
```

---

### 🏗️ Rust Program Integration

Build the native Solana program component:
```bash
# Compile Rust Pentacle Program
cargo build --manifest-path pentacle/Cargo.toml

# Run integration tests
cargo test --manifest-path pentacle/Cargo.toml
```

## 🔐 SECURITY & AUDIT MATRIX

### 🛡️ Zero-Trust Architecture
- **🚫 No Private Keys**: Cryptographic materials never stored in repository
- **🌐 Environment-Based Config**: All sensitive data via environment variables  
- **🔍 Address Verification**: Automated scanning for hardcoded addresses
- **⚡ Relayer Fee Coverage**: Zero-cost deployment via relayer network
- **🔒 Authority Locking**: Irreversible security constraints when configured

### 🔍 Security Verification
```bash
# Execute comprehensive address audit
node address-audit.js

# Run security verification protocols
node security-verification.js

# Generate security audit report
cat SECURITY-AUDIT-REPORT.md
```

### ⚠️ **Critical Security Notice**
This repository has undergone comprehensive security hardening:
- **All hardcoded contract addresses removed**
- **Environment variable enforcement for all sensitive data**
- **Automated security scanning via GitHub Actions**
- **Address cleanup report available**: `CONTRACT-ADDRESS-CLEANUP-REPORT.md`

## 📊 POST-DEPLOYMENT VERIFICATION

### 🔍 Blockchain Explorer Integration
1. **Verify Mint Creation**: `https://explorer.solana.com/address/<MINT_ADDRESS>`
2. **Validate Treasury ATA**: `https://explorer.solana.com/address/<TREASURY_ATA>`  
3. **Confirm Token Metadata**: Review name, symbol, and authority settings
4. **Authority Verification**: Ensure proper lock configuration

### 🚀 Advanced Operations
```bash
# Real-time deployment monitoring
npm run quick-monitor

# Comprehensive system analysis  
node complete-analysis.js

# Status dashboard
node omega-status.js

# Transaction verification
node tx-checker.js
```

## 🌐 CI/CD & AUTOMATION

### ⚙️ GitHub Actions Matrix
- **🔍 CodeQL Analysis**: `.github/workflows/codeql.yml`
- **🛡️ Security Scanning**: `.github/workflows/security-scan.yml`  
- **🚀 Automated Deployment**: `.github/workflows/deploy.yml`
- **📦 Dependency Management**: `.github/dependabot.yml`

### 🔄 Continuous Integration
The deployment pipeline supports automated testing and security validation:
```yaml
# Example workflow trigger
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

## 🌟 FUTURE ROADMAP

### 🚀 Upcoming Enhancements
- **🧠 Advanced AI Decision Trees** - Multi-path deployment strategies
- **🌊 Quantum State Management** - Advanced rollback and recovery
- **🤖 Bot Army Coordination** - Distributed deployment networks
- **🔮 Predictive Analytics** - Market-aware deployment timing
- **🌐 Cross-Chain Integration** - Multi-blockchain deployment matrix

### 🔬 Research & Development
- **Neural Network Integration** for optimal gas estimation
- **Consensus-Based Decision Making** for DAO deployments  
- **Temporal Logic Programming** for scheduled operations
- **Quantum-Resistant Cryptography** preparation

---

## 📞 NEURAL CONTACT MATRIX

**Repository**: [Omega Prime Deployer](https://github.com/imfromfuture3000-Android/Omega-prime-deployer)  
**Developer**: AutomataLabs  
**License**: MIT - Universal Permissive Consciousness  
**Version**: 1.2.0 - Enhanced Neural Matrix

---

*"In the intersection of consciousness and code, we shape tomorrow's decentralized reality. The future isn't just arriving—we're actively architecting it, one token at a time."*

🌟 **Welcome to the OMEGA dimension.** 🌟
