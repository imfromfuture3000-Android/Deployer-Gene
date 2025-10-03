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