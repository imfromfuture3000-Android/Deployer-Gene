# GitHub Secrets Setup

## Required Secrets

### Core Configuration
```
RPC_URL=https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e
WSS_URL=wss://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e
HELIUS_API_KEY=your_helius_api_key_here
```

### Relayer Network
```
RELAYER_URL=https://your-relayer-domain/relay/sendRawTransaction
RELAYER_PUBKEY=your_relayer_fee_payer_pubkey_here
RELAYER_API_KEY=your_relayer_api_key_here
```

### Wallet Addresses
```
TREASURY_PUBKEY=your_treasury_pubkey_here
COCREATOR_PUBKEY=your_cocreator_pubkey_here
MINT_ADDRESS=your_omega_mint_address_here
REINVEST_ADDRESS=your_reinvestment_wallet_pubkey
```

### Agent Bot Configuration
```
BOT_1_PUBKEY=agent_bot_1_pubkey
BOT_2_PUBKEY=agent_bot_2_pubkey
BOT_3_PUBKEY=agent_bot_3_pubkey
BOT_4_PUBKEY=agent_bot_4_pubkey
BOT_5_PUBKEY=agent_bot_5_pubkey
```

### Helius Integration & Rebates
```
WEBHOOK_URL=https://your-webhook-endpoint.com/helius
HELIUS_REBATES_ENABLED=true
TIP_ACCOUNT_OVERRIDE=custom_tip_account_pubkey_here
MEV_PROTECTION_ENABLED=true
```

### Jupiter Integration
```
JUPITER_PROGRAM_ID=JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
IMPULSE_MINT=your_impulse_mint_address_here
OMEGA_MINT=your_omega_mint_address_here
```

### Rebate Distribution
```
REBATE_AUTO_DISTRIBUTE=true
TREASURY_CUT_PERCENTAGE=0.15
REBATE_ANNOUNCEMENT_ENABLED=true
```

### ATP Integration
```
ATP_ENABLED=true
ATP_MINT_LOGIC=true
ATP_CONTRACT_LOGIC=true
```

### Initial Investment Airdrop
```
AIRDROP_ENABLED=true
IMPULSE_AIRDROP_AMOUNT=10000
OMEGA_AIRDROP_AMOUNT=5000
INITIAL_INVESTOR_LIST=comma_separated_addresses
```

### Investor Lure Bot
```
AUTO_LURE_ENABLED=true
LURE_BOT_ADDRESS=your_bot_1_pubkey_here
LURE_INTERVAL_MINUTES=5
MAINNET_ANNOUNCE_ENABLED=true
```

### DEX Proxy Deployment
```
DEX_PROXY_PROGRAM=6MWVTis8rmmk6Vt9zmAJJbmb3VuLpzoQ1aHH4N6wQEGh
BOT_1_EXECUTOR=HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR
ALL_IN_ONE_ENABLED=true
```

### Gene NFT Activation
```
GENE_NFT_ENABLED=true
NFT_COLLECTION_SIZE=5
GENE_NFT_REBATES=true
```

### Bot Army NFT Minting
```
BOT_6_PUBKEY=8duk9DzqBVXmqiyci9PpBsKuRCwg6ytzWywjQztM6VzS
BOT_7_PUBKEY=96891wG6iLVEDibwjYv8xWFGFiEezFQkvdyTrM69ou24
BOT_8_PUBKEY=2A8qGB3iZ21NxGjX4EjjWJKc9PFG1r7F4jkcR66dc4mb
PROXY_MINT_ALL=true
```

### Locked Configuration
```
CONFIG_LOCKED=true ft
LOCK_OVERRIDE_ENABLED=true
PERMANENT_REBATES=true
PERMANENT_MEV=true
```

### Security (CRITICAL - Store as encrypted secrets)
```
DEPLOYER_PRIVATE_KEY=2AHAs1gdHSGn2REJbARigh5CLoRuR9gdNTMTKu5UJBVVovXUxhPYeLFYTVgov7gyes4QkwLhgw89PAsGZbUjK2Yv
```

## Setup Commands

1. Go to: `https://github.com/YOUR_USERNAME/Deployer-Gene/settings/secrets/actions`
2. Click "New repository secret" for each variable above
3. Use exact names and values from your `.env` filerunda