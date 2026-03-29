# Ralph Agent Bot – Product Requirements Document (PRD)
## Feb 2026 – Implementation Roadmap

**Status**: 🟢 Active Development  
**Owner**: Ralph (Autonomous AI Agent)  
**Repository**: Deployer-Gene  
**Network**: Solana Mainnet  

---

## 📊 Overview

Ralph is a 24/7 autonomous agent managing 5 empire-building strategies across Solana. This PRD defines all implementation tasks for Iterations 1-4 (8 weeks).

---

## 🎯 Iteration 1: Foundation & Yield Harvester (Week 1-2)

### Infrastructure Setup
- [ ] Create `src/ralph/` directory structure
- [ ] Implement `src/ralph/index.js` (main agent loop coordinator)
- [ ] Create `src/ralph/utils/rpc-client.js` (Helius + QuickNode fallback logic)
- [ ] Create `src/ralph/utils/wallet.js` (Phantom wallet signer, private key fallback for dev)
- [ ] Create `.env.example` with HELIUS_RPC, WALLET_PRIVATE_KEY, QUICKNODE_RPC keys
- [ ] Setup PostgreSQL (Neon) connection in `src/ralph/utils/db.js`
- [ ] Create `/logs` directory with `.gitignore` (exclude sensitive data)

### Yield Harvester Strategy
- [ ] Implement `src/ralph/strategies/yield-harvester.js` core logic
- [ ] Integrate Solana RPC calls to fetch top 10 yield farms (Tulip, Francium, Raydium, Orca)
- [ ] Implement APY calculator (account for fees, gas, slippage)
- [ ] Implement auto-compound logic (trigger when >1% gain available)
- [ ] Create unit tests for APY calculation (edge cases: zero TVL, negative APY)
- [ ] Create integration test on devnet (simulate 1 compound cycle)
- [ ] Implement `src/ralph/strategies/yield-harvester.test.js`
- [ ] Log daily yields to `.cache/ralph-hourly-report.json`

### Monitoring & Alerts
- [ ] Create `src/ralph/utils/alerts.js` (webhook for balance warnings)
- [ ] Setup health check in main loop (RPC connectivity, wallet balance)
- [ ] Implement Discord webhook alerts (low balance, strategy failures)

**Acceptance Criteria**:
- Yield Harvester runs every 6 hours on devnet without errors
- APY calculation matches manual spot-checks within 0.5%
- All unit tests pass (>80% coverage)
- Integration test succeeds 3/3 times

---

## 🎯 Iteration 2: Signal Seeker & Liquidity Sniffer (Week 3-4)

### Signal Seeker Strategy
- [ ] Implement `src/ralph/strategies/signal-seeker.js` core logic
- [ ] Integrate Twitter API v2 (x-api-key, search recent tweets for #solana + custom keywords)
- [ ] Integrate Discord bot listener (monitor selected servers for role pings, volume mentions)
- [ ] Implement simple sentiment analyzer (lexicon-based or lightweight API)
- [ ] Implement volume velocity detector (% change in mention frequency)
- [ ] Create filtering rules (min sentiment score 0.6, min velocity 50 mentions/hour)
- [ ] Implement alert-only mode initially (no auto-execute yet)
- [ ] Create `src/ralph/strategies/signal-seeker.test.js`
- [ ] Log all signals to `logs/ralph-signals.json` (append)

### Liquidity Sniffer Strategy
- [ ] Implement `src/ralph/strategies/liquidity-sniffer.js` core logic
- [ ] Integrate Helius Event API for pool creation events (Raydium, Orca)
- [ ] Implement volume spike detector (compare 1-min vs 5-min average)
- [ ] Implement risk scorer (rug indicators, creator rep, audit status)
- [ ] Implement snipe execute (tight stop + TP orders)
- [ ] Create `src/ralph/strategies/liquidity-sniffer.test.js`
- [ ] Load test on devnet: simulate 10 pool creations, verify correct detection

**Acceptance Criteria**:
- Signal Seeker generates 5+ signals/day on mainnet (verified over 3 days)
- Liquidity Sniffer detects all new pools (100% recall on test data)
- Zero false positives on rug indicators (backtest against known rugs)
- All tests pass (>75% coverage for new code)

---

## 🎯 Iteration 3: ZK Compression Farmer & Belief Rewrite (Week 5-6)

### ZK Compression Farmer Strategy
- [ ] Implement `src/ralph/strategies/zk-compression-farmer.js` core logic
- [ ] Integrate Helius DAS API (query compressed token state trees)
- [ ] Implement batch transaction builder (compress multiple micro-txs into 1 proof)
- [ ] Implement rent calculator & optimizer
- [ ] Identify active airdrop campaigns (farm contract scans)
- [ ] Create `src/ralph/strategies/zk-compression-farmer.test.js`
- [ ] Devnet test: compress 10 token transfers, verify cost savings vs. standard

### Belief Rewrite Loop (CAC-I)
- [ ] Implement `src/ralph/strategies/belief-rewrite.js` core logic
- [ ] Create state file: `src/ralph/state/beliefs.json` (initial weights, thresholds)
- [ ] Implement PnL tracker: calculate 7-day, 30-day returns per strategy
- [ ] Implement weight mutation algorithm (increase high-performers, decrease low)
- [ ] Implement parameter mutation (adjust risk thresholds within bounds)
- [ ] Implement CAC-I framework: Current→Alternative→Compare→Iterate
- [ ] Create `src/ralph/strategies/belief-rewrite.test.js`
- [ ] Log all mutations to `logs/belief-rewrites.json`

**Acceptance Criteria**:
- ZK Farmer compresses micro-txs with 50%+ cost savings
- Belief Rewrite runs weekly without manual input
- Strategy weights converge after 2+ cycles (no wild oscillations)
- Tests verify mutation bounds (no infinite loops)

---

## 🎯 Iteration 4: Integration, Monitoring & Deployment (Week 7-8)

### Main Loop Orchestrator
- [ ] Update `src/ralph/index.js` to coordinate all 5 strategies
- [ ] Implement scheduling: Yield every 6h, Signal every 5m, Liquidity continuous, ZK daily, Belief weekly
- [ ] Implement error recovery (strategy crash → skip, continue next strategy)
- [ ] Implement transaction batching (combine multi-strategy actions into single tx when possible)
- [ ] Create unit tests for scheduler (verify next execution times)

### Monitoring Dashboard
- [ ] Create `/public/ralph-dashboard.html` (real-time status, live PnL, strategy performance)
- [ ] Implement WebSocket endpoint for live updates (`.cache/ralph-hourly-report.json`)
- [ ] Display: Wallet balance, daily PnL, strategy performance, last execution times
- [ ] Add manual trigger buttons (run strategy now, reload beliefs, etc.)

### Logging & Analytics
- [ ] Create `src/ralph/utils/logger.js` (centralized JSON logging)
- [ ] Implement decision history (all trades + reasoning logged)
- [ ] Implement performance analytics (Sharpe, win rate, max drawdown per strategy)
- [ ] Export analytics to CSV for external analysis
- [ ] Setup log rotation (daily rollover, 30-day retention)

### Deployment Scripts
- [ ] Create `scripts/ralph-start.js` (CLI: start agent loop)
- [ ] Create `scripts/ralph-status.js` (CLI: check current state)
- [ ] Create `scripts/ralph-backtest.js` (CLI: simulate strategies on historical data)
- [ ] Setup PM2 ecosystem.config.js (daemonize Ralph with auto-restart)
- [ ] Create deployment docs: `docs/RALPH_DEPLOYMENT.md`

### Testing & QA
- [ ] Run full integration test (all 5 strategies + loop coordinator) on devnet for 24 hours
- [ ] Verify no crashes, all logs present, performance stable
- [ ] Run on testnet with real transactions (0.1 SOL capital)
- [ ] Security audit: private key handling, RPC fallback, error messages (no leaks)
- [ ] Load test: verify latency <100ms per strategy check

### Mainnet Launch
- [ ] Deploy to mainnet with 1 SOL capital (conservative sizing)
- [ ] Monitor for 1 week: target >0.5% gain
- [ ] Tune parameters based on live performance
- [ ] Scale to full capital once confidence >80%

**Acceptance Criteria**:
- All 5 strategies + loop orchestrator running without human intervention
- Dashboard shows real-time data, refreshes every 30 seconds
- Logging complete (every decision tracked)
- PM2 auto-restarts Ralph on crash
- Mainnet PnL positive after 2 weeks
- Documentation complete for future agent iterations

---

## 🏆 Success Metrics (Post-Launch)

- **Daily PnL**: +0.5% to +2% (risk-adjusted)
- **Autonomy Score**: >95% decisions without human input
- **Strategy Sharpe**: >1.5 per strategy
- **Uptime**: >99.5% scheduled execution completion
- **Belief Convergence**: Strategy weights stabilize within 4 weeks
- **Cost Efficiency**: <2% fees as % of AUM

---

## 📋 Task Status

### Iteration 1: Foundation & Yield Harvester
- **[  ] Infrastructure Setup** (8 tasks)
- **[  ] Yield Harvester** (8 tasks)
- **[  ] Monitoring & Alerts** (3 tasks)

### Iteration 2: Signal Seeker & Liquidity Sniffer
- **[  ] Signal Seeker** (8 tasks)
- **[  ] Liquidity Sniffer** (8 tasks)

### Iteration 3: ZK Farmer & Belief Rewrite
- **[  ] ZK Compression Farmer** (7 tasks)
- **[  ] Belief Rewrite Loop** (8 tasks)

### Iteration 4: Integration & Launch
- **[  ] Main Loop Orchestrator** (5 tasks)
- **[  ] Monitoring Dashboard** (5 tasks)
- **[  ] Logging & Analytics** (6 tasks)
- **[  ] Deployment Scripts** (6 tasks)
- **[  ] Testing & QA** (5 tasks)
- **[  ] Mainnet Launch** (4 tasks)

---

## 🔗 Related Files

- **Ralph Prompt**: `scripts/ralph/prompt.md` (autonomous behavior guide)
- **Agent Learnings**: `AGENTS.md` (iteration history, bugs found, lessons learned)
- **Deployment State**: `.cache/node-votes-nft-bots-deployment.json` (existing 7 programs)
- **Wallet Config**: `.env` (RPC, private key, DB connection)

---

**Ralph**: Ready to execute. Pick first unchecked task and begin.  
**Next Review**: Fri Feb 21, 2026 (end of Iteration 1)
