import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { sendViaRelayer } from './utils/relayer';
import { loadOrCreateUserAuth } from './utils/wallet';
import { appendDeploymentEvent } from './utils/txLogger';
import { findAssociatedTokenAddress } from './utils/pdas';
import { createSecureConnection } from './utils/securityConfig';

dotenv.config();

/*
  Bot Orchestrator
  - Assumes mint already created & initial supply minted to TREASURY
  - Distributes tokens to a list of bot wallet addresses stored in .cache/bots.json
  - Uses relayer for zero-cost transactions
  - Records tx signatures in deployment-log.json

  bots.json format: { "bots": ["WalletPubkey1", "WalletPubkey2"], "amount": "1000" }
  Amount is in whole tokens (will be adjusted by decimals = 9)
*/

const TREASURY_ADDRESS = 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6'; // existing hardcoded treasury
const DECIMALS = 9;

async function main() {
  const dryRun = process.env.DRY_RUN === 'true';
  const connection = createSecureConnection('confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);

  const cacheDir = path.join(process.cwd(), '.cache');
  const mintKeypairPath = path.join(cacheDir, 'mint-keypair.json');
  const mintCachePath = path.join(cacheDir, 'mint.json');
  const botsPath = path.join(cacheDir, 'bots.json');

  if (!fs.existsSync(mintKeypairPath) || !fs.existsSync(mintCachePath)) {
    console.error('Mint not initialized. Run mainnet:all first.');
    process.exit(1);
  }
  if (!fs.existsSync(botsPath)) {
    console.error('Missing .cache/bots.json. Create it with { "bots": [..], "amount": "1000" }');
    process.exit(1);
  }

  const mintKeypairJson = JSON.parse(fs.readFileSync(mintKeypairPath,'utf-8'));
  const mintKeypair = Keypair.fromSecretKey(Uint8Array.from(mintKeypairJson));
  const mint = mintKeypair.publicKey;

  const botsConfig = JSON.parse(fs.readFileSync(botsPath,'utf-8'));
  const botList: string[] = botsConfig.bots || [];
  const amountPerBotTokens = BigInt(botsConfig.amount || '0');
  if (botList.length === 0 || amountPerBotTokens === BigInt(0)) {
    console.error('bots.json must define non-empty bots array and amount.');
    process.exit(1);
  }

  const treasury = new PublicKey(TREASURY_ADDRESS);
  const treasuryAta = findAssociatedTokenAddress(treasury, mint);

  const amountBaseUnits = amountPerBotTokens * BigInt(10 ** DECIMALS);

  console.log(`Distributing ${amountPerBotTokens} tokens (${amountBaseUnits} base units) to ${botList.length} bots.`);

  for (const bot of botList) {
    const botPk = new PublicKey(bot);
    const botAta = findAssociatedTokenAddress(botPk, mint);

    const tx = new Transaction();

    // Ensure bot ATA exists
    const botAtaInfo = await connection.getAccountInfo(botAta);
    if (!botAtaInfo) {
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        userAuth,
        mint,
        botPk,
        true,
        'confirmed',
        { commitment: 'confirmed' },
        TOKEN_2022_PROGRAM_ID
      );
      if ((ata as any).instruction) {
        tx.add((ata as any).instruction);
      }
    }

    tx.add(
      createTransferInstruction(
        treasuryAta,
        botAta,
        userAuth.publicKey,
        Number(amountBaseUnits),
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    tx.feePayer = userAuth.publicKey;
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.partialSign(userAuth);

    let signature = 'DRY_RUN_SIGNATURE';
    try {
      signature = await sendViaRelayer(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
      console.log(`✅ Distributed to ${bot}: https://explorer.solana.com/tx/${signature}`);
    } catch (e:any) {
      console.error(`❌ Distribution to ${bot} failed: ${e.message}`);
      if (!dryRun) continue; // skip logging failed real tx
    }

    appendDeploymentEvent({
      timestamp: new Date().toISOString(),
      action: 'bot-distribution',
      signature,
      details: { bot, amountBaseUnits: amountBaseUnits.toString() }
    });
  }

  console.log('Bot distribution complete. Log written to .cache/deployment-log.json');
}

main().catch(e => { console.error(e); process.exit(1); });
