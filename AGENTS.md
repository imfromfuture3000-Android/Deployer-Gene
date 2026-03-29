# Agent Learnings & Discoveries

This document captures patterns, gotchas, and conventions discovered by agents during autonomous loop execution. Use this to improve future iterations.

## Codebase Architecture

### Directory Structure
- **Root**: Configuration files, deployment scripts, contract addresses
- **scripts/**: Utility scripts for various tasks (deployment, validation, etc.)
- **contracts/** (if exists): Smart contract source files
- **src/** or **lib/**: Core business logic
- **tests/**: Test suites

### Key Technologies
- **Blockchain**: Solana, EVM chains (Ethereum, etc.)
- **RPC**: Alchemy, Helius, QuickNode
- **Smart Accounts**: Biconomy
- **Package Manager**: npm/yarn
- **Runtime**: Node.js 18+

## Common Patterns & Best Practices

### Configuration Management
- Use `.env` files for sensitive data (never commit)
- Environment-specific configs in separate files
- Validate all env vars at startup

### Blockchain Interactions
- Always use devnet/testnet for testing
- Implement retry logic with exponential backoff
- Log transaction hashes and signatures for audit trails
- Use try-catch blocks around all RPC calls

### Error Handling
- Distinguish between network errors, validation errors, and contract errors
- Log stack traces for debugging
- Return meaningful error messages to users

### Testing
- Test happy path + error cases
- Mock RPC calls in unit tests
- Use real testnet for integration tests
- Verify gas estimations before mainnet deployment

## Iteration History

### Iteration 0
- [INIT] Ralph system initialized
- [INIT] Critical bugs identified: markdown formatting, RPC config issues
- [STATUS] Awaiting first autonomous loop iteration

### Iteration 1 ✅ COMPLETED
- [SUCCESS] Fixed markdown formatting in scripts/ralph/prompt.md
- [SUCCESS] Audited 20 critical Solana address references (4 key addresses identified)
- [SUCCESS] Mapped all RPC endpoints (6+ endpoints, multiple providers)
- [LEARNED] Address format validation: all addresses valid Base58, 44 chars
- [LEARNED] Security pattern: No private keys in source code (✅ SAFE)
- [LEARNED] Configuration pattern inconsistency: some hardcoded, some env-based
- [RECOMMENDED] Standardize address configuration with central registry
- [RECOMMENDED] Add retry logic with exponential backoff for RPC calls
- [COMMITTED] 2 files changed, security audit report generated
- [REPORT] See: SECURITY-AUDIT-RALPH-ITERATION-1.md for full details

### Iteration 2 (Next)
- [ ] Validate all environment variable dependencies
- [ ] Test error handling in blockchain connection utilities
- [ ] Implement centralized config module with address registry

---

**Last Updated**: 2025-01-27 20:15 UTC

**Next Agent**: Continue with next unchecked task in PRD.md


