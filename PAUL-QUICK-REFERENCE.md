# Ralph Quick Reference Card

## System Files at a Glance

```
scripts/ralph/
├── ralph-loop.sh           The main loop orchestrator
├── prompt.md               Agent instructions (edit this!)
```

```
Root Files
├── PRD.md                  Your task backlog (edit to add tasks!)
├── AGENTS.md               Agent learnings (auto-updates)
├── .ralph-config.json      Configuration (loops, timeouts, API model)
├── RALPH_README.md         Full documentation
├── RALPH-INTEGRATION-SUMMARY.md   Setup guide
├── RALPH-COPILOT-PROMPT.md        Copilot execution template
```

```
.github/workflows/
└── ralph-autonomy.yml      GitHub Actions (runs every 3 hours)
```

---

## 30-Second Setup

```bash
# 1. Add your tasks to PRD.md
nano PRD.md

# 2. Set API keys in GitHub Secrets
gh secret set AGENT_API_KEY --body "your-key"

# 3. Test locally (5 iterations)
chmod +x scripts/ralph/ralph-loop.sh
./scripts/ralph/ralph-loop.sh 5

# 4. Enable GitHub Actions
# (Settings → Actions → Allow all actions)

# 5. Done! Loop runs every 3 hours automatically
```

---

## Command Reference

| Command | Purpose |
|---------|---------|
| `./scripts/ralph/ralph-loop.sh 5` | Run 5 iterations locally |
| `./scripts/ralph/ralph-loop.sh 50` | Run up to 50 iterations |
| `git log --grep="\[ralph\]"` | See all Ralph commits |
| `grep -c "^- \[x\]" PRD.md` | Count completed tasks |
| `tail -30 AGENTS.md` | See latest agent notes |
| `cat .ralph-config.json` | View configuration |

---

## Edit These Files

### To add tasks:
→ Edit **PRD.md** - add lines like `- [ ] Your task here`

### To guide agents:
→ Edit **scripts/ralph/prompt.md** - add coding standards, test requirements

### To adjust settings:
→ Edit **.ralph-config.json** - change iterations, timeouts, API model

### To change schedule:
→ Edit **.github/workflows/ralph-autonomy.yml** - modify cron

---

## Status Checks

```bash
# Is loop enabled?
grep "LOOP_COMPLETE" scripts/ralph/prompt.md  # Should be empty

# How many tasks left?
grep -c "^- \[ \]" PRD.md

# Latest commits from Ralph?
git log --grep="\[ralph\]" --oneline | head -5

# What did agents learn?
tail -50 AGENTS.md
```

---

## Workflow in One Picture

```
User edits PRD.md with tasks
              ↓
GitHub Actions triggers every 3 hours (or manual)
              ↓
ralph-loop.sh starts
              ↓
Agent reads PRD.md, picks next [ ] task
              ↓
Agent implements + tests in loop
              ↓
Tests pass? → Commit + mark [x] + log to AGENTS.md
              ↓
All tasks [x] or LOOP_COMPLETE? → Exit
              ↓
Otherwise → Back to agent (next task)
              ↓
Repeat!
```

---

## GitHub Actions Monitoring

| Location | What to Check |
|----------|---------------|
| **Actions tab** | See workflow runs & logs |
| **Pull Requests** | Ralph creates optional PRs |
| **Commits** | Search for `[ralph]` prefix |
| **AGENTS.md** | Agent notes & learnings |

---

## Common Tasks

### Pause the loop
```bash
echo "LOOP_COMPLETE" >> scripts/ralph/prompt.md
git add . && git commit -m "Pause Ralph loop"
git push
```

### Resume
```bash
# Remove LOOP_COMPLETE from scripts/ralph/prompt.md
nano scripts/ralph/prompt.md
# Delete the LOOP_COMPLETE line, save, commit, push
```

### Change schedule
```bash
# Edit .github/workflows/ralph-autonomy.yml
# Modify cron line, e.g.:
# '0 * * * *'  = every hour
# '0 0 * * 0'  = every Monday
# '0 */6 * * *' = every 6 hours
```

### Check API costs
```bash
# Ralph logs API usage to AGENTS.md
# Search AGENTS.md for "API" or "cost"
grep -i "api\|cost" AGENTS.md
```

---

## Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| Loop not running | Check Actions enabled in Settings |
| Can't commit | Verify git config: `git config user.name` |
| API key errors | `gh secret list` - verify all secrets set |
| Tests failing | Check AGENTS.md for environment notes |
| Wrong schedule | Edit `.github/workflows/ralph-autonomy.yml` cron |

---

## File Purposes (TL;DR)

| File | Purpose | Edit When |
|------|---------|-----------|
| `PRD.md` | Task list | Adding tasks |
| `scripts/ralph/prompt.md` | Agent instructions | Customizing behavior |
| `AGENTS.md` | Learnings (auto-update) | Reviewing insights |
| `.ralph-config.json` | System settings | Changing timeouts/model |
| `.github/workflows/ralph-autonomy.yml` | CI/CD trigger | Changing schedule |

---

## Success Checklist

- ✅ Tasks added to PRD.md
- ✅ API secrets configured in GitHub
- ✅ GitHub Actions enabled
- ✅ Local test passed: `./scripts/ralph/ralph-loop.sh 3`
- ✅ Workflow runs automatically every 3 hours

---

## Support Resources

- **Full guide**: [RALPH_README.md](RALPH_README.md)
- **Setup details**: [RALPH-INTEGRATION-SUMMARY.md](RALPH-INTEGRATION-SUMMARY.md)
- **Copilot usage**: [RALPH-COPILOT-PROMPT.md](RALPH-COPILOT-PROMPT.md)
- **Learnings**: [AGENTS.md](AGENTS.md) (updated each iteration)

---

**Ralph is ready to run. Add tasks to PRD.md and go!** 🚀
