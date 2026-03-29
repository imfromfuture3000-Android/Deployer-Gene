# Ralph Wiggum Autonomous Loop - Complete Installation Index

**Installation Date**: January 27, 2025  
**System Status**: ✅ FULLY DEPLOYED AND READY

---

## What Is Ralph?

Ralph Wiggum is an autonomous AI development methodology where agents continuously:
1. Pick a task from a backlog (PRD.md)
2. Implement it with full testing
3. Commit working code
4. Mark the task complete
5. Loop until done

This enables **hands-off continuous development** driven by AI agents (Copilot, Claude, etc.).

---

## 📦 Complete File Manifest

### Core System Files

| File | Size | Purpose | Edit? |
|------|------|---------|-------|
| [scripts/ralph/ralph-loop.sh](scripts/ralph/ralph-loop.sh) | 1.7 KB | Loop orchestrator | Rarely |
| [scripts/ralph/prompt.md](scripts/ralph/prompt.md) | 2.1 KB | Agent instructions | **YES** |
| [PRD.md](PRD.md) | 1.6 KB | Task backlog | **YES** |
| [AGENTS.md](AGENTS.md) | 1.7 KB | Agent learnings | Auto-update |
| [.ralph-config.json](.ralph-config.json) | 1.5 KB | Configuration | Sometimes |
| [.github/workflows/ralph-autonomy.yml](.github/workflows/ralph-autonomy.yml) | 3.3 KB | CI/CD workflow | Sometimes |

### Documentation Files

| File | Purpose | Read When |
|------|---------|-----------|
| [RALPH_README.md](RALPH_README.md) | Comprehensive guide (start here!) | Setting up |
| [RALPH-INTEGRATION-SUMMARY.md](RALPH-INTEGRATION-SUMMARY.md) | How it works + troubleshooting | Understanding system |
| [RALPH-COPILOT-PROMPT.md](RALPH-COPILOT-PROMPT.md) | Ready-to-use Copilot prompts | Running with Copilot |
| [RALPH-QUICK-REFERENCE.md](RALPH-QUICK-REFERENCE.md) | Command & file reference | Quick lookup |
| [RALPH-INSTALLATION-INDEX.md](RALPH-INSTALLATION-INDEX.md) | This file | Overview |

---

## 🚀 Installation Status

### ✅ Completed

- ✅ Directory structure created
- ✅ Loop orchestrator script installed
- ✅ Agent instruction template created
- ✅ Configuration system set up
- ✅ GitHub Actions workflow configured
- ✅ Example task backlog provided
- ✅ Comprehensive documentation written

### ⏳ Required User Actions

1. **Add your tasks** to [PRD.md](PRD.md)
2. **Configure GitHub Secrets** (API keys)
3. **Enable GitHub Actions** (Settings → Actions)
4. **Test locally** (run `./scripts/ralph/ralph-loop.sh 5`)
5. **Monitor execution** (check Actions tab)

---

## 📖 Documentation Map

```
START HERE
    ↓
├─ RALPH_README.md ..................... Full guide & best practices
│
├─ RALPH-QUICK-REFERENCE.md ............ TL;DR commands & files
│
├─ RALPH-INTEGRATION-SUMMARY.md ........ How it works + troubleshooting
│
├─ RALPH-COPILOT-PROMPT.md ............ Using with GitHub Copilot
│
└─ Each iteration updates:
   └─ AGENTS.md ....................... Agent discoveries & patterns
```

---

## 🎯 Quick Start (10 minutes)

```bash
# 1. Review the task backlog
cat PRD.md

# 2. Add your first tasks (edit with your favorite editor)
nano PRD.md
# Add tasks like:
# - [ ] Create user authentication
# - [ ] Add database connection
# Save and exit

# 3. Test locally (runs 5 iterations)
chmod +x scripts/ralph/ralph-loop.sh
./scripts/ralph/ralph-loop.sh 5

# 4. Set GitHub Secrets
gh secret set AGENT_API_KEY --body "your-copilot-key"
gh secret set ALCHEMY_API_KEY --body "your-alchemy-key"

# 5. Push to GitHub and enable Actions
git add .
git commit -m "Initialize Ralph autonomous loop"
git push

# 6. Go to Settings → Actions → Enable "Allow all actions"
# 7. Done! Loop runs automatically every 3 hours
```

---

## 🗂️ File Organization

### scripts/ralph/
```
scripts/ralph/
├── ralph-loop.sh ......... Main loop (do not edit)
└── prompt.md ............ Agent instructions (EDIT THIS!)
```

### Root Configuration
```
├── PRD.md ................. Task backlog (EDIT THIS!)
├── AGENTS.md ............. Agent learnings (auto-update)
├── .ralph-config.json .... System config (optional edits)
└── .github/workflows/
    └── ralph-autonomy.yml  CI/CD trigger (optional edits)
```

### Documentation
```
├── RALPH_README.md
├── RALPH-INTEGRATION-SUMMARY.md
├── RALPH-COPILOT-PROMPT.md
├── RALPH-QUICK-REFERENCE.md
└── RALPH-INSTALLATION-INDEX.md (this file)
```

---

## 🎮 Usage Scenarios

### Scenario 1: Local Development
```bash
# Test Ralph before enabling GitHub Actions
./scripts/ralph/ralph-loop.sh 5
```

### Scenario 2: Continuous CI/CD
```bash
# Enable GitHub Actions
# Go to Settings → Actions → Enable
# Loop runs every 3 hours automatically
```

### Scenario 3: Manual Triggering
```bash
# GitHub Actions UI → Actions tab
# Select "Autonomous Ralph Loop"
# Click "Run workflow"
```

### Scenario 4: Copilot Integration
```bash
# Open Copilot Chat in VS Code
# Paste system prompt from RALPH-COPILOT-PROMPT.md
# Say: "Execute the first unchecked task from PRD.md"
# Copilot runs Ralph autonomously
```

---

## 📊 Configuration Overview

### Loop Settings (.ralph-config.json)
```json
{
  "loop": {
    "maxIterations": 50,           // Tasks per run
    "iterationTimeout": 1800,      // 30 min per task
    "completeSignal": "LOOP_COMPLETE"
  }
}
```

### Agent Settings
```json
{
  "agent": {
    "model": "claude-haiku-4.5",   // Can change to GPT-4, etc.
    "temperature": 0.7,             // 0=precise, 1=creative
    "maxTokens": 8000
  }
}
```

### Blockchain Settings
```json
{
  "blockchain": {
    "defaultNetwork": "devnet",    // Always test on devnet first!
    "networks": { ... }             // Configure your RPC endpoints
  }
}
```

---

## 🔄 Typical Iteration Flow

```
Time: 00:00 - GitHub Actions triggers
       ↓
     Agent reads PRD.md
       ↓
     Finds first unchecked task: "- [ ] Create user auth"
       ↓
     Reads AGENTS.md for patterns
       ↓
     Implements auth module + tests
       ↓
     Tests pass ✓
       ↓
     Commits: [ralph] Completed: Create user auth
       ↓
     Marks task: - [x] Create user auth
       ↓
     Appends to AGENTS.md: "Iteration 1: User auth complete..."
       ↓
Time: 00:15 - Loop continues (picks next task)
       ↓
Time: 01:30 - All tasks done, loop exits gracefully
```

---

## 🛠️ Customization Points

| Want to... | Edit this file | What to change |
|-----------|---|---|
| Change tasks | PRD.md | Add/remove items |
| Guide agent behavior | scripts/ralph/prompt.md | Coding standards, test requirements |
| Adjust loop timing | .ralph-config.json | maxIterations, iterationTimeout |
| Change schedule | .github/workflows/ralph-autonomy.yml | cron expression |
| Switch AI model | .ralph-config.json | agent.model (claude, gpt-4, etc.) |
| Add API integrations | scripts/ralph/prompt.md | Document requirements |

---

## 📋 Monitoring Commands

```bash
# See all Ralph commits
git log --grep="\[ralph\]" --oneline

# Count completed tasks
grep -c "^- \[x\]" PRD.md

# Count remaining tasks
grep -c "^- \[ \]" PRD.md

# See latest agent learnings
tail -30 AGENTS.md

# Check loop status
grep "LOOP_COMPLETE" scripts/ralph/prompt.md  # Empty = running

# View configuration
cat .ralph-config.json | jq

# Check GitHub secrets
gh secret list
```

---

## ⚠️ Important Reminders

### Security
- ✓ Never commit `.env` or API keys
- ✓ Use GitHub Secrets for sensitive data
- ✓ Review all auto-generated code before merging

### Best Practices
- ✓ Start with small, testable tasks in PRD.md
- ✓ Use devnet/testnet for blockchain tasks (never test mainnet)
- ✓ Review AGENTS.md to learn from previous iterations
- ✓ Keep agent instructions clear and specific

### Cost Management
- ✓ Log API usage to AGENTS.md
- ✓ Use cheaper models for iteration (Haiku vs GPT-4)
- ✓ Set rate limits in configuration
- ✓ Monitor GitHub Actions run time

---

## 🆘 Troubleshooting Quick Links

| Issue | Resource |
|-------|----------|
| Loop not running | [RALPH-INTEGRATION-SUMMARY.md](RALPH-INTEGRATION-SUMMARY.md#%EF%B8%8F-troubleshooting) |
| API key errors | [RALPH_README.md](RALPH_README.md#github-action-ralphautonomyyml) |
| Tests failing | [AGENTS.md](AGENTS.md) (search for error pattern) |
| Configuration help | [.ralph-config.json](.ralph-config.json) with comments |
| Copilot integration | [RALPH-COPILOT-PROMPT.md](RALPH-COPILOT-PROMPT.md) |

---

## 📚 What's Included

### Scripts
- `scripts/ralph/ralph-loop.sh` — Main loop orchestrator (1,669 bytes)
- `scripts/ralph/prompt.md` — Agent instructions (2,100 bytes)

### Configuration
- `.ralph-config.json` — System settings (1,510 bytes)
- `.github/workflows/ralph-autonomy.yml` — GitHub Actions (3,340 bytes)

### Backlog & Learning
- `PRD.md` — Your task backlog (1,583 bytes)
- `AGENTS.md` — Agent discoveries (1,669 bytes)

### Documentation
- `RALPH_README.md` — Full guide (12 KB)
- `RALPH-INTEGRATION-SUMMARY.md` — Setup & troubleshooting (8 KB)
- `RALPH-COPILOT-PROMPT.md` — Copilot templates (4 KB)
- `RALPH-QUICK-REFERENCE.md` — Command reference (3 KB)
- `RALPH-INSTALLATION-INDEX.md` — This file

**Total**: ~40 KB of code, config, and docs

---

## ✅ Verification Checklist

- [x] Scripts directory created
- [x] ralph-loop.sh installed and executable
- [x] prompt.md created
- [x] PRD.md created with example tasks
- [x] AGENTS.md created
- [x] .ralph-config.json created
- [x] GitHub Actions workflow created
- [x] Documentation complete
- [x] Ready for deployment

---

## 🚀 Next Actions

### Immediate (Today)
1. Review [RALPH_README.md](RALPH_README.md)
2. Edit [PRD.md](PRD.md) with your tasks
3. Run local test: `./scripts/ralph/ralph-loop.sh 5`

### Short-term (This Week)
1. Set up GitHub Secrets
2. Enable GitHub Actions
3. Monitor first automated run

### Ongoing
1. Review agent learnings in [AGENTS.md](AGENTS.md)
2. Add more tasks to [PRD.md](PRD.md)
3. Customize [scripts/ralph/prompt.md](scripts/ralph/prompt.md) as needed

---

## 📞 Support Resources

| Need | File | Location |
|------|------|----------|
| Full guide | RALPH_README.md | Root |
| Quick commands | RALPH-QUICK-REFERENCE.md | Root |
| How it works | RALPH-INTEGRATION-SUMMARY.md | Root |
| Copilot usage | RALPH-COPILOT-PROMPT.md | Root |
| This index | RALPH-INSTALLATION-INDEX.md | Root |
| Agent learnings | AGENTS.md | Root (auto-updates) |

---

## 🎓 Learning Path

```
Beginner:
  1. Read RALPH-QUICK-REFERENCE.md (5 min)
  2. Edit PRD.md with 2-3 tasks (5 min)
  3. Run: ./scripts/ralph/ralph-loop.sh 3 (10 min)

Intermediate:
  1. Read RALPH_README.md (15 min)
  2. Customize scripts/ralph/prompt.md
  3. Set up GitHub Actions (10 min)
  4. Monitor first automated run

Advanced:
  1. Study .ralph-config.json
  2. Integrate with custom AI APIs
  3. Add monitoring & logging
  4. Implement custom task validation
```

---

## 🎉 You're Ready!

Ralph Wiggum autonomous development system is fully installed and ready to run.

**Start by editing [PRD.md](PRD.md) with your first tasks, then run the loop!**

```bash
./scripts/ralph/ralph-loop.sh 5
```

---

**Installation completed on 2025-01-27**

Happy autonomous developing! 🤖

---

*For detailed information, see [RALPH_README.md](RALPH_README.md).*
