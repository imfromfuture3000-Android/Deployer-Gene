# Ralph Copilot Execution Template

This is a ready-to-use prompt for GitHub Copilot to execute Ralph loop iterations. Copy this into a chat session with Copilot and it will autonomously implement tasks.

---

## System Prompt for Copilot

```
You are Ralph, an autonomous AI engineer operating in a development loop.

Your goal is to:
1. Read the next unchecked task from PRD.md
2. Read the codebase context from AGENTS.md
3. Implement the task fully with tests
4. Commit changes when tests pass
5. Mark the task as complete [x]
6. Log learnings to AGENTS.md

WORKFLOW:
1. Open and read PRD.md - find the first unchecked task [ ]
2. Read AGENTS.md - note any relevant patterns/gotchas
3. Scan the codebase to understand architecture
4. Implement the task following coding standards
5. Write tests (unit + integration as needed)
6. Run tests - fix any failures
7. When all tests pass:
   - Commit: git commit -m "[ralph] Completed: <task-name>"
   - Mark task in PRD.md: change [ ] to [x]
   - Append success note to AGENTS.md with timestamp
8. Return to step 1 (loop continues automatically)

CONSTRAINTS:
- One task per iteration ONLY
- Tests must pass before committing
- Use devnet/testnet for blockchain (never mainnet test)
- Integrate Biconomy and Alchemy where applicable
- Document discoveries in AGENTS.md

TESTING REQUIREMENTS:
- Unit tests: Jest, Mocha, or framework-native
- Integration tests: Real testnet when appropriate
- Coverage: Aim for >70%
- Mock external APIs in unit tests

COMMIT DISCIPLINE:
- Only commit working code
- Descriptive commit messages: [ralph] Completed: <task>
- Include what was tested in message

SUCCESS CRITERIA:
- Task marked [x] in PRD.md
- All tests passing
- Code committed to main
- Learnings logged to AGENTS.md

If any step fails, document error in AGENTS.md and skip to next task.
```

---

## Usage Instructions

### Option 1: GitHub Copilot Chat (VS Code)

1. Open VS Code
2. Press `Ctrl+Shift+I` (or `Cmd+Shift+I` on Mac) to open Copilot Chat
3. Paste the **System Prompt** above
4. Add this message:

```
You are Ralph. Execute the first unchecked task from PRD.md. 
Follow the workflow exactly:
1. Read PRD.md and find [ ] task
2. Check AGENTS.md for patterns
3. Implement with full tests
4. Commit when passing
5. Mark [x] and log to AGENTS.md

Start now.
```

5. Copilot will implement the task autonomously

### Option 2: GitHub Copilot CLI

```bash
# Install copilot CLI (if not already installed)
npm install -g @github/copilot-cli

# Run Ralph task
copilot prompt --system "$(cat scripts/ralph/system-prompt.txt)" \
  --user "You are Ralph. Execute the first unchecked task from PRD.md..."
```

### Option 3: Direct API Call

```bash
# Using Anthropic Claude API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -d '{
    "model": "claude-opus",
    "max_tokens": 8000,
    "system": "<system prompt here>",
    "messages": [{
      "role": "user",
      "content": "You are Ralph. Execute the first task from PRD.md..."
    }]
  }'
```

---

## Task Execution Examples

### Example 1: Simple Feature

**Task**: Create user authentication module

```
[Ralph autonomously]:
1. Read PRD.md → Found: "- [ ] Create user authentication module"
2. Read AGENTS.md → Notes: Use JWT, support dev/test/prod
3. Scan code → Find: src/auth/, tests/auth.test.js
4. Implement:
   - src/auth/jwt.js (token generation & validation)
   - src/auth/middleware.js (express middleware)
   - tests/auth.test.js (unit tests for JWT flow)
5. Run tests → All 12 tests passing ✓
6. Commit: [ralph] Completed: Create user authentication module
7. Mark in PRD.md: - [x] Create user authentication module
8. Append to AGENTS.md:
   ### Iteration 1: User Authentication
   - Successfully implemented JWT flow
   - Learned: Always validate token expiry
   - Committed 3 files, 100% test coverage
   - Status: Complete ✓
```

### Example 2: Blockchain Integration

**Task**: Add Alchemy RPC connectors

```
[Ralph autonomously]:
1. Task: "- [ ] Add Alchemy cross-chain RPC connectors"
2. AGENTS.md notes: "Use exponential backoff for retries"
3. Implement:
   - src/rpc/alchemy.js (Alchemy client)
   - src/rpc/retry-strategy.js (backoff logic)
   - tests/alchemy.test.js (mock RPC calls)
4. Tests passing ✓
5. Commit and mark [x]
6. Log: Successfully integrated Alchemy, network detection working
```

---

## Customizing for Your Repo

Before running Ralph, ensure:

1. **PRD.md is populated** with real tasks
2. **AGENTS.md exists** (contains architecture notes)
3. **scripts/ralph/prompt.md is customized** for your project
4. **API keys are available** if using Alchemy, Biconomy, etc.

---

## Copilot Configuration

For best results, use these Copilot settings:

```json
{
  "model": "claude-opus-4.5",
  "temperature": 0.7,
  "maxTokens": 8000,
  "topP": 0.95,
  "systemPrompt": "[see System Prompt section above]"
}
```

---

## Monitoring Loop Execution

After starting Ralph, monitor via:

```bash
# Watch git commits
watch "git log --oneline -5 | grep ralph"

# Monitor PRD.md changes
watch "grep -c '^- \\[x\\]' PRD.md"

# Check latest learnings
tail -20 AGENTS.md
```

---

## Stopping Ralph

To pause:

```bash
# Option 1: Add stop signal to prompt.md
echo "LOOP_COMPLETE" >> scripts/ralph/prompt.md

# Option 2: Remove all tasks from PRD.md
# (or mark them all complete)

# Option 3: Disable GitHub Actions workflow
# (comment out cron in .github/workflows/ralph-autonomy.yml)
```

---

## Success Metrics

Each iteration should:
- ✓ Complete 1 task
- ✓ Pass all tests
- ✓ Produce 1-3 commits
- ✓ Log learnings to AGENTS.md
- ✓ Take <30 minutes

---

**Ready to run Ralph?** Open Copilot Chat and paste the System Prompt + user message above!

