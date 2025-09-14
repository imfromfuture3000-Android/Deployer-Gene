import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { findAssociatedTokenAddress } from './utils/pdas';
import { createSecureConnection } from './utils/securityConfig';

dotenv.config();

/*
  Verify Bot Balances Script
  - Reads .cache/bots.json (bots + amount per bot in whole tokens)
  - Reads mint from .cache/mint.json & mint-keypair.json (decimals assumed = 9)
  - Checks each bot's ATA balance and reports:
      * ✅ if exact match
      * ⚠️ if less than expected
      * ❌ if ATA missing or zero
  - Exits with code 0 always (informational), can be adjusted to non-zero on mismatch if desired.
*/

const DECIMALS = 9;

async function main() {
  const connection = createSecureConnection('confirmed');
  const cacheDir = path.join(process.cwd(), '.cache');
  const botsPath = path.join(cacheDir, 'bots.json');
  const mintCachePath = path.join(cacheDir, 'mint.json');

  if (!fs.existsSync(botsPath)) {
    console.error('Missing .cache/bots.json');
    process.exit(1);
  }
  if (!fs.existsSync(mintCachePath)) {
    console.error('Missing .cache/mint.json');
    process.exit(1);
  }

  let mintAddress: string | undefined;
  try {
    const mc = JSON.parse(fs.readFileSync(mintCachePath,'utf-8'));
    mintAddress = typeof mc === 'string' ? mc : mc.mint;
  } catch (e) {
    console.error('Failed to parse mint.json');
    process.exit(1);
  }
  if (!mintAddress) { console.error('Mint address not found in mint.json'); process.exit(1); }

  const mint = new PublicKey(mintAddress);
  const botsConfig = JSON.parse(fs.readFileSync(botsPath,'utf-8'));
  const botList: string[] = botsConfig.bots || [];
  const amountPerBotTokens = BigInt(botsConfig.amount || '0');
  const expectedBase = amountPerBotTokens * BigInt(10 ** DECIMALS);

  console.log(`Verifying ${botList.length} bots for ${amountPerBotTokens} tokens each (base units ${expectedBase}).`);

  const summary = { total: botList.length, exact: 0, partial: 0, missing: 0 };

  for (const bot of botList) {
    try {
      const botPk = new PublicKey(bot);
      const ata = findAssociatedTokenAddress(botPk, mint);
      const info = await connection.getAccountInfo(ata);
      if (!info) {
        console.log(`❌ ${bot} ATA missing (${ata.toBase58()})`);
        summary.missing++;
        continue;
      }
      const bal = await connection.getTokenAccountBalance(ata);
      const raw = BigInt(bal.value.amount);
      if (raw === expectedBase) {
        console.log(`✅ ${bot} balance OK (${raw.toString()})`);
        summary.exact++;
      } else if (raw > BigInt(0)) {
        console.log(`⚠️ ${bot} partial balance ${raw.toString()} (expected ${expectedBase})`);
        summary.partial++;
      } else {
        console.log(`❌ ${bot} zero balance (expected ${expectedBase})`);
        summary.missing++;
      }
    } catch (e:any) {
      console.log(`Error checking ${bot}: ${e.message}`);
      summary.missing++;
    }
  }

  console.log('--- Summary ---');
  console.log(JSON.stringify(summary, null, 2));
  console.log('Balance verification complete.');
}

main().catch(e => { console.error(e); process.exit(1); });
