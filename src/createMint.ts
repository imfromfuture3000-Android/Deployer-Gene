import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { createInitializeMintInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

import { sendViaRelayer } from './utils/relayer';
import { loadOrCreateUserAuth } from './utils/wallet';

const retries = 10;

dotenv.config();

async function createTokenMintWithRetry() {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = new Connection(process.env.RPC_URL!, 'confirmed');
      const userAuth = loadOrCreateUserAuth();
      const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
      const cacheDir = path.join(process.cwd(), '.cache');
      const mintCachePath = path.join(cacheDir, 'mint.json');
      process.env.TREASURY_PUBKEY = '4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a';

      if (fs.existsSync(mintCachePath)) {
        let mint: string | undefined;
        try {
          const mintCache = JSON.parse(fs.readFileSync(mintCachePath, 'utf-8'));
          if (typeof mintCache === 'string') {
            mint = mintCache;
            // Rewrite file to correct format
            fs.writeFileSync(mintCachePath, JSON.stringify({ mint }));
          } else if (mintCache && typeof mintCache.mint === 'string') {
            mint = mintCache.mint;
          }
        } catch (err) {
          console.error('Error reading mint cache:', err);
        }
        if (mint) {
          const mintInfo = await connection.getAccountInfo(new PublicKey(mint));
          if (mintInfo) {
            console.log(`Mint already exists: ${mint}`);
            return new PublicKey(mint);
          }
        }
      }


      const mintKeypairPath = path.join(cacheDir, 'mint-keypair.json');
      let mintKeypair: Keypair | undefined;
      let mintAddress: PublicKey | undefined;
      try {
        if (fs.existsSync(mintKeypairPath)) {
          const mintKeypairRaw = fs.readFileSync(mintKeypairPath, 'utf-8');
          if (!mintKeypairRaw || mintKeypairRaw.trim().length === 0) throw new Error('mint-keypair.json is empty!');
          const mintKeypairJson = JSON.parse(mintKeypairRaw);
          if (!mintKeypairJson || !Array.isArray(mintKeypairJson) || mintKeypairJson.length !== 64) throw new Error('Invalid mint-keypair.json format or length');
          mintKeypair = Keypair.fromSecretKey(Uint8Array.from(mintKeypairJson));
          mintAddress = mintKeypair.publicKey;
        } else {
          mintKeypair = Keypair.generate();
          mintAddress = mintKeypair.publicKey;
          if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
          fs.writeFileSync(mintKeypairPath, JSON.stringify(Array.from(mintKeypair.secretKey)));
        }
      } catch (err) {
        console.error('Error loading mint keypair:', err);
        process.exit(1);
      }
      if (!mintKeypair || !mintAddress || !(mintAddress instanceof PublicKey)) {
        console.error('Mint keypair or address is undefined or invalid!');
        process.exit(1);
      }
      fs.writeFileSync(mintCachePath, JSON.stringify({ mint: mintKeypair.publicKey.toBase58() }));

      const tx = new Transaction();
      let ownerPubkey: PublicKey | undefined, freezePubkey: PublicKey | undefined;
      try {
  ownerPubkey = new PublicKey('4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a');
        freezePubkey = new PublicKey('4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a');
      } catch (err) {
        console.error('Error constructing owner/freeze PublicKey:', err);
        process.exit(1);
      }
      if (!ownerPubkey || !freezePubkey || !(ownerPubkey instanceof PublicKey) || !(freezePubkey instanceof PublicKey)) {
        console.error('Owner or freeze authority PublicKey is undefined or invalid!');
        process.exit(1);
      }
      tx.add(
        createInitializeMintInstruction(
          mintAddress,
          9,
          ownerPubkey,
          freezePubkey,
          TOKEN_2022_PROGRAM_ID
        )
      );
      // Set fee payer and recent blockhash
      if (!userAuth || !userAuth.publicKey || !(userAuth.publicKey instanceof PublicKey)) {
        console.error('User auth keypair or publicKey is undefined or invalid!');
        process.exit(1);
      }
      tx.feePayer = userAuth.publicKey;
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
  // Sign only with mintKeypair; relayer will be fee payer and finalize
  tx.partialSign(mintKeypair);

      const signature = await sendViaRelayer(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
      if (signature !== 'DRY_RUN_SIGNATURE') {
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(mintCachePath, JSON.stringify({ mint: mintKeypair.publicKey.toBase58() }));
      }
      console.log(`Created mint: ${mintKeypair.publicKey.toBase58()}`);
      return mintKeypair.publicKey;
    } catch (e) {
  const errMsg = e instanceof Error ? e.message : String(e);
  console.error(`Mint creation failed (attempt ${attempt}): ${errMsg}`);
      if (attempt === retries) {
        process.exit(1);
      }
    }
  }
}

createTokenMintWithRetry();
