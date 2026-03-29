# Ralph Autonomous Loop - Supabase Backend

## Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Copy Project URL and Secret Key

2. **Run Schema**
   ```bash
   # In Supabase SQL Editor, run:
   cat supabase/schema.sql
   ```

3. **Configure Environment**
   ```bash
   # Edit .env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your_secret_key
   RALPH_PRIVATE_KEY=your_solana_private_key_base58
   ```

4. **Run Loop**
   ```bash
   node scripts/ralph/ralph-loop-supabase.js
   ```

## Features

- ✅ Continuous mainnet execution
- ✅ Thread-based logging to Supabase
- ✅ Balance monitoring
- ✅ Strategy execution
- ✅ Automatic summaries
- ✅ Zero-cost relayer integration

## Environment Variables

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=eyJxxx
RALPH_PRIVATE_KEY=base58_encoded_key
RALPH_LOOP_INTERVAL=60000
RALPH_MIN_BALANCE=0.1
YIELD_HARVESTER_ENABLED=true
SIGNAL_SEEKER_ENABLED=true
LIQUIDITY_SNIFFER_ENABLED=true
```

## Mainnet Only

Following deployment rules:
- ✅ Relayer pays all fees
- ✅ User signs only
- ✅ Mainnet-beta only
- ✅ Real on-chain transactions
