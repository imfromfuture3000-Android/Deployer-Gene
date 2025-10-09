# Deployment Rules

## Rule 1: Relayer Logic Only
- ALWAYS use relayer for fee payment
- User is SIGNER ONLY, never the payer
- All transactions must go through relayer endpoint
- Zero-cost deployment for user

## Rule 2: Mainnet Deployment Only  
- NO devnet deployments
- NO testnet deployments
- MAINNET-BETA only
- Production environment required

## Rule 3: Real Deployments Only
- NO simulated transactions
- ALL contracts must be REAL on-chain
- ALWAYS have valid mainnet transaction hash
- ALWAYS have valid contract address
- ALL Solana/EVM programs must be verifiable on explorer
- MANDATORY transaction hash validation