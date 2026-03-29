# Ralph Agent Bot – Quick Reference Guide
## 🤖 Agentic Ancient Alien Cyberpunk Empire Builder

**Live since**: Feb 13, 2026  
**Theme**: Neon grids, black chrome, ancient alien glyphs flickering in the void  
**Mission**: Autonomous Solana empire building via 5 AI strategies

---

## 🚀 Quick Start

```bash
# Setup
git clone <repo>
npm install
cp .env.example .env.local
# → Fill in: HELIUS_RPC, WALLET_PRIVATE_KEY, QUICKNODE_RPC, DB_URL

# Start Ralph (runs 24/7)
npm run ralph:start

# Monitor status
npm run ralph:status

# View latest decisions
npm run ralph:logs

# Backtest strategies
npm run ralph:backtest
```

---

## 🎯 Five Strategies at a Glance

| # | Strategy | Goal | Executes | Status |
|---|----------|------|----------|--------|
| 1 | **Yield Harvester** | Auto-compound best yields | Every 6h | ✅ Week 1 |
| 2 | **Signal Seeker** | Catch alpha from social signals | Every 5m | ⏳ Week 3 |
| 3 | **Liquidity Sniffer** | Snipe early pool gains | Continuous | ⏳ Week 3 |
| 4 | **ZK Compression Farmer** | Batch micro-txs, farm airdrops | Daily | ⏳ Week 5 |
| 5 | **Belief Rewrite** | Mutate params based on PnL | Weekly | ⏳ Week 5 |

---

## 📊 Current State

**Beliefs** (strategy weights): `.src/ralph/state/beliefs.json`  
**Portfolio**: `src/ralph/state/portfolio.json`  
**Performance**: `src/ralph/state/performance.json`

### Execution Schedule
```
00:00 UTC (daily)    → ZK Compression Farmer
00:00 UTC (Sunday)   → Belief Rewrite Loop
**:00 UTC (every 6h) → Yield Harvester (0, 6, 12, 18)
**:5m   (every 5m)   → Signal Seeker
Continuous          → Liquidity Sniffer (when live)
```

---

## 🔧 Tech Stack

- **Language**: Node.js 18+
- **RPC**: Helius (primary) + QuickNode (fallback)
- **Wallet**: Phantom / Backpack (via web3 adapter)
- **Solana Libraries**: @solana/web3.js, @solana/spl-token
- **APIs**: 
  - Helius DAS (token data, events)
  - Twitter v2 API (signals)
  - Discord bot API (signals)
- **Storage**: PostgreSQL (Neon) + JSON files (`.cache/`, logs/)
- **Scheduler**: node-cron + PM2

---

## 📈 Key Metrics to Watch

**Daily**:
- Wallet balance (alert if <0.5 SOL)
- PnL vs benchmark (Solana index)
- Strategy execution count

**Weekly**:
- Sharpe ratio per strategy (target >1.5)
- Win rate (% profitable trades)
- Belief convergence (are strategy weights stabilizing?)

**Monthly**:
- Cumulative return (target +15%+)
- Max drawdown (constraint: max -5%)
- Sharpe (target >1)

---

## 🚨 Alerts & Warnings

Ralph sends webhooks when:
- Wallet balance < 0.5 SOL (recharge!)
- Strategy fails/crashes (check logs)
- Daily loss > 5% (scale back)
- RPC fails for >5 min (switch to fallback)

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `scripts/ralph/prompt.md` | Ralph's autonomous behavior guide |
| `RALPH_PRD.md` | Implementation roadmap (tasks per iteration) |
| `src/ralph/index.js` | Main loop orchestrator |
| `src/ralph/strategies/*.js` | Each strategy implementation |
| `.cache/ralph-hourly-report.json` | Latest execution summary |
| `logs/ralph-decisions.json` | Full decision history |
| `logs/ralph-beliefs.json` | Weekly belief snapshots |

---

## 🎓 Common Commands

```bash
# Check if Ralph is running
npm run ralph:status

# View latest report
cat .cache/ralph-hourly-report.json | jq .

# View decision log (last 10)
tail -10 logs/ralph-decisions.json | jq .

# Tail live logs
tail -f logs/ralph-decisions.json

# Backtest Yield Harvester on last 30 days
npm run ralph:backtest -- --strategy yield-harvester --days 30

# Manually trigger Belief Rewrite
npm run ralph:rewrite-beliefs

# Scale capital (conservative → aggressive)
npm run ralph:scale -- --factor 2.0
```

---

## 🔒 Security Checklist

- [ ] Private key stored in `.env`, **NEVER in code**
- [ ] `.env` in `.gitignore`
- [ ] RPC keys rotated monthly
- [ ] Database password strong, stored in `.env`
- [ ] No hardcoded values; all config via env
- [ ] Logs sanitized (no private keys, balances, or addresses printed in full)
- [ ] PM2 running as non-root user
- [ ] Regular backups of `.cache/` and `logs/`

---

## 📊 Dashboard

Live dashboard at `http://localhost:3000/ralph-dashboard.html` (after npm run dev)

Shows real-time:
- Wallet balance
- Today's PnL
- Strategy status (running/waiting)
- Last execution time per strategy
- 7-day performance chart

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| RPC timeout | Check Helius API key, switch to QuickNode |
| Strategy crash | Check logs/ralph-decisions.json, review error |
| Wallet not connected | Verify WALLET_PRIVATE_KEY in .env |
| Database error | Check DB_URL, verify Neon connection |
| High fees | Check gas prices, increase threshold in beliefs.json |
| Strategy not executing | Verify cron schedule, check if it's enabled in beliefs.json |

---

## 🎯 Success Criteria (First 8 Weeks)

- Week 1: Yield Harvester live, 0 crashes, APY calc verified
- Week 2: Yield Harvester running, baseline metrics collected
- Week 3: Signal Seeker + Liquidity Sniffer implemented
- Week 4: All 5 strategies coded, devnet testing passing
- Week 5: ZK Farmer + Belief Rewrite live
- Week 6: Loop orchestrator + dashboard working
- Week 7: Mainnet testnet with 0.1 SOL
- Week 8: Mainnet live with 1 SOL, target +0.5% daily

---

## 🚀 Next Steps (Ralph's TODO)

1. Read `RALPH_PRD.md` (full roadmap with checkboxes)
2. Pick first unchecked task from Iteration 1
3. Implement, test, commit
4. Log learnings in AGENTS.md
5. Loop back to step 2

**Ralph**: Ready to build an empire. 🚀

---

Generated: Feb 13, 2026  
Theme: Agentic Ancient Alien – Cyberpunk Solana  
Status: ✅ Ready for Iteration 1
