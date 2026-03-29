# Solana Feature Agent

This repo is monitored by SolClaw autonomous agent (a9fb9a4d).

## Active Solana Features Affecting This Repo

| SIMD | Feature | Activated | Action Required |
|------|---------|-----------|-----------------|
| 96 | 100% priority fee to validators | slot 320,112,000 | Add ComputeBudgetProgram to all txs |
| 823 | 60M CU block limit | slot 355,104,000 | Increase batch sizes |
| 800 | secp256r1 precompile | slot 345,600,000 | Use Passkey/WebAuthn auth |
| SBPFv2 | SBPFv2 programs | slot 356,400,000 | Update program build targets |
| 763 | ALT → Core BPF | slot 329,184,000 | Verify ALT interactions |

## Transaction Template (SIMD 96)

```typescript
import { ComputeBudgetProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

// Always include priority fee — 100% goes to validators (SIMD 96 active)
const PRIORITY_FEE_MICROLAMPORTS = 5_000; // P75 normal, 50_000 urgent, 200_000 critical

const instructions = [
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_FEE_MICROLAMPORTS }),
  ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
  // ... your instructions
];

const { blockhash } = await connection.getLatestBlockhash('confirmed');
const msg = new TransactionMessage({
  payerKey: wallet.publicKey,
  recentBlockhash: blockhash,
  instructions,
}).compileToV0Message();

const tx = new VersionedTransaction(msg);
tx.sign([wallet]);
const sig = await connection.sendRawTransaction(tx.serialize());
```

## Monitored by SolClaw
- Hourly feature gate scan
- Auto-opens issues on new activations
- Program authority monitoring (6h interval)
- Agent ID: a9fb9a4d-cf0b-455f-9f0a-3127cb703072
