# Ralph Wiggum Autonomous Development Loop

Welcome to the **Ralph** autonomous AI development system. This is a continuous, iterative development loop where AI agents autonomously pick tasks, implement them, test them, and commit changes—all without manual intervention.

## Overview

Ralph is named after the "Ralph Wiggum" methodology—a pattern where:
1. An agent reads a task from a backlog (PRD.md)
2. Implements the task with full testing
3. Commits the changes
4. Loops back to step 1 until all tasks are complete

This enables **hands-off development cycles** where Copilot or other AI agents can autonomously drive feature development, bug fixes, and infrastructure improvements.

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ralph-autonomy.yml         # GitHub Actions workflow (runs every 3 hours)
├── scripts/
│   └── ralph/
│       ├── ralph-loop.sh              # Main loop orchestrator
│       └── prompt.md                  # Agent instructions (read each iteration)
├── PRD.md                             # Product Requirements & Backlog
├── AGENTS.md                          # Agent learnings & discoveries
├── .ralph-config.json                 # Configuration for Ralph system
└── RALPH_README.md                    # This file
```

## 🚀 Quick Start

### 1. Local Testing

Test the Ralph loop locally before enabling GitHub Actions:

```bash
# Make script executable
chmod +x scripts/ralph/ralph-loop.sh

# Run loop locally (max 5 iterations for testing)
./scripts/ralph/ralph-loop.sh 5
```

### 2. Configure Environment

Create a `.env` file with required API keys:

```bash
# Required for AI agent execution
AGENT_API_KEY=your_copilot_or_ai_key

# Optional: For blockchain tasks
ALCHEMY_API_KEY=your_alchemy_key
BICONOMY_API_KEY=your_biconomy_key
HELIUS_API_KEY=your_helius_key
```

### 3. Add GitHub Secrets

To enable automated Ralph loop via GitHub Actions:

```bash
# Via GitHub CLI
gh secret set AGENT_API_KEY --body "your_key"
gh secret set ALCHEMY_API_KEY --body "your_key"
gh secret set BICONOMY_API_KEY --body "your_key"
```

Or via GitHub Web UI:
- Settings → Secrets and Variables → Actions
- Add each secret from `.env`

### 4. Enable GitHub Actions

The workflow at [.github/workflows/ralph-autonomy.yml](.github/workflows/ralph-autonomy.yml) runs:
- **Automatically**: Every 3 hours via cron schedule
- **Manually**: Via `workflow_dispatch` (Actions tab)

## 📋 How to Use Ralph

### Adding Tasks

Edit [PRD.md](PRD.md) and add tasks in this format:

```markdown
## Priority 1: Foundation & Architecture

- [ ] Analyze current codebase structure, generate architecture summary
- [ ] Document existing contract addresses and their purposes
- [ ] Map all blockchain networks and RPC endpoints in use
```

**Important**: 
- Tasks should be **atomic** (completable in ~30 minutes)
- Include acceptance criteria in the task description
- Use checkboxes: `- [ ]` (unchecked) and `- [x]` (checked)

### Monitoring Execution

#### Option A: GitHub Actions UI
1. Go to **Actions** tab
2. Select **"Autonomous Ralph Loop"** workflow
3. View run history, logs, and generated PRs

#### Option B: Local Logs
```bash
# Check last iteration details
tail -50 logs/ralph.log

# View AGENTS.md for learnings
cat AGENTS.md
```

#### Option C: Git History
```bash
# See all Ralph commits
git log --grep="\[ralph\]" --oneline
```

### Reviewing Changes

Ralph can optionally create Pull Requests with its changes. To review:

1. GitHub automatically creates a PR with prefix `[Ralph]`
2. Review diffs and test coverage
3. Merge or request changes as needed

## 🔧 Configuration

Edit [.ralph-config.json](.ralph-config.json) to customize:

```json
{
  "ralph": {
    "loop": {
      "maxIterations": 50,           // Max iterations per run
      "iterationTimeout": 1800,      // Seconds per iteration
      "completeSignal": "LOOP_COMPLETE"
    },
    "agent": {
      "model": "claude-haiku-4.5",  // AI model to use
      "temperature": 0.7,            // Creativity/randomness
      "maxTokens": 8000
    },
    "blockchain": {
      "defaultNetwork": "devnet"     // Use devnet for testing first!
    }
  }
}
```

## 📚 Agent Instructions

When Ralph executes, agents read [scripts/ralph/prompt.md](scripts/ralph/prompt.md). This file contains:

- **Workflow**: How to pick tasks, implement, test, and commit
- **Key Principles**: One task per iteration, test first, fail gracefully
- **Completion Criteria**: How the loop knows when to stop

**You can edit this file to guide agent behavior!**

## 📖 Learning & Iteration

### AGENTS.md

This file documents agent discoveries:
- Codebase patterns and conventions
- Common pitfalls and solutions
- Test frameworks and setup
- Integration gotchas

Agents append to this file each iteration, building up a **collective knowledge base** for future runs.

Example entry:

```markdown
### Iteration 3
- [SUCCESS] Implemented Alchemy RPC connectors
- [LEARNED] Always retry RPC calls with exponential backoff
- [COMMITTED] 3 files changed, 2 tests added
```

## ⚙️ Advanced Usage

### Custom Task Definitions

Use rich markdown in PRD.md:

```markdown
- [ ] **Create Biconomy integration**
  - [ ] Set up smart account factory
  - [ ] Implement gas sponsorship
  - [ ] Add tests for relayer flow
  - Notes: Use devnet first, refer to AGENTS.md#biconomy-pattern
```

### Stopping the Loop

To pause Ralph:

1. Add `LOOP_COMPLETE` to [scripts/ralph/prompt.md](scripts/ralph/prompt.md), OR
2. Comment out the cron schedule in [.github/workflows/ralph-autonomy.yml](.github/workflows/ralph-autonomy.yml), OR
3. Delete unchecked tasks from PRD.md

### Running Custom Iterations

```bash
# Run up to 100 iterations
./scripts/ralph/ralph-loop.sh 100

# With environment variables
AGENT_API_KEY=xxx ALCHEMY_API_KEY=yyy ./scripts/ralph/ralph-loop.sh 50
```

### Debugging Failed Iterations

1. Check GitHub Actions logs for error messages
2. Review [AGENTS.md](AGENTS.md) for error context
3. Examine git diff: `git log -p --grep="\[ralph\]" | head -100`
4. Check [.ralph-config.json](.ralph-config.json) for configuration issues

## 🛑 Troubleshooting

### Issue: Loop not triggering automatically

**Solution**: Check GitHub Actions is enabled:
- Settings → Actions → General → Allow all actions

### Issue: Agent commits failing

**Solution**: Verify git config and secrets:
```bash
git config user.name "ralph-autonomy[bot]"
git config user.email "ralph-autonomy[bot]@users.noreply.github.com"
gh secret list  # Verify all secrets are set
```

### Issue: API rate limiting

**Solution**: Increase sleep interval in [scripts/ralph/ralph-loop.sh](scripts/ralph/ralph-loop.sh):
```bash
sleep 30  # Increase from 5 to 30 seconds
```

## 🤝 Integration with Copilot

Ralph is designed to work seamlessly with **GitHub Copilot** and other AI agents.

### Using with GitHub Copilot in VS Code

1. Open [scripts/ralph/prompt.md](scripts/ralph/prompt.md)
2. Highlight the prompt content
3. Ask Copilot: **"Execute this Ralph prompt for the next task in PRD.md"**
4. Copilot will implement, test, and suggest commits

### Using with External AI APIs

Replace the agent invocation in [scripts/ralph/ralph-loop.sh](scripts/ralph/ralph-loop.sh):

```bash
# Example: OpenAI API
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d @"$PROMPT_FILE"

# Example: Anthropic Claude
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -d @"$PROMPT_FILE"
```

## 📊 Metrics & Monitoring

Ralph logs execution to **logs/ralph.log** (JSON format):

```json
{
  "iteration": 5,
  "task": "Create Biconomy integration",
  "status": "success",
  "duration_sec": 1250,
  "files_changed": 3,
  "tests_passed": 12,
  "timestamp": "2025-01-27T19:05:00Z"
}
```

View summary:
```bash
cat logs/ralph.log | jq '.[] | {iteration, task, status}'
```

## 🎯 Best Practices

1. **Keep tasks small**: Aim for ~30 min iterations
2. **Write tests first**: Higher success rate
3. **Use devnet for blockchain**: Always test before mainnet
4. **Document patterns**: Append learnings to AGENTS.md
5. **Review PRs**: Don't auto-merge without inspection
6. **Monitor costs**: Log API usage in AGENTS.md

## 📚 Related Files

- [PRD.md](PRD.md) - Task backlog
- [AGENTS.md](AGENTS.md) - Learnings & discoveries
- [.ralph-config.json](.ralph-config.json) - System configuration
- [scripts/ralph/prompt.md](scripts/ralph/prompt.md) - Agent instructions
- [scripts/ralph/ralph-loop.sh](scripts/ralph/ralph-loop.sh) - Loop orchestrator
- [.github/workflows/ralph-autonomy.yml](.github/workflows/ralph-autonomy.yml) - CI/CD workflow

## 🚀 Next Steps

1. ✅ System initialized
2. **Add tasks to PRD.md** (edit the file with your backlog)
3. **Set up GitHub Secrets** (add API keys via gh CLI or web UI)
4. **Enable GitHub Actions** (workflow will run automatically)
5. **Monitor** (check Actions tab for execution logs)

## 📞 Support

- Check [AGENTS.md](AGENTS.md) for common patterns and gotchas
- Review GitHub Actions logs for error details
- Edit [.ralph-config.json](.ralph-config.json) to adjust behavior

---

**Ralph system initialized on 2025-01-27**

Happy autonomous developing! 🤖
