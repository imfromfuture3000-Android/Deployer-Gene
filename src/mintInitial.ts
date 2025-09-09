import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createMintToInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { sendViaRelayer } from './utils/relayer';
import { loadOrCreateUserAuth } from './utils/wallet';
import { findAssociatedTokenAddress } from './utils/pdas';

dotenv.config();

async function mintInitialSupply() {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY!);
  // Ensure TREASURY_PUBKEY is set
  if (!process.env.TREASURY_PUBKEY) {
    throw new Error('TREASURY_PUBKEY environment variable must be set');
  }
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY);
  const cacheDir = path.join(process.cwd(), '.cache');
  const mintCachePath = path.join(cacheDir, 'mint.json');
  const mintKeypairPath = path.join(cacheDir, 'mint-keypair.json');

  if (!fs.existsSync(mintCachePath) || !fs.existsSync(mintKeypairPath)) {
    console.error('Mint not created. Run createMint.ts first.');
    process.exit(1);
  }
  const mintKeypairJson = JSON.parse(fs.readFileSync(mintKeypairPath, 'utf-8'));
  const mintKeypair = Keypair.fromSecretKey(Uint8Array.from(mintKeypairJson));
  const mint = mintKeypair.publicKey;
  const treasuryAta = findAssociatedTokenAddress(treasuryPubkey, mint);

  const supply = BigInt(1000000000) * BigInt(10 ** 9);
  const ataInfo = await connection.getAccountInfo(treasuryAta);

  if (ataInfo) {
    const balance = await connection.getTokenAccountBalance(treasuryAta);
    if (balance.value.amount === supply.toString()) {
      console.log(`Initial supply already minted to ${treasuryAta.toBase58()}`);
      return;
    }
  }

  const tx = new Transaction();
  if (!ataInfo) {
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      userAuth,
      mint,
      treasuryPubkey,
      false,
      'confirmed',
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );
    if ((ata as any).instruction) {
      tx.add((ata as any).instruction);
    }
  }

    tx.add(
      createMintToInstruction(
        mint,
        treasuryAta,
        userAuth.publicKey,
        supply,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

  tx.feePayer = userAuth.publicKey;
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  tx.partialSign(userAuth, mintKeypair);
  try {
      await sendViaRelayer(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL!, tx, process.env.RELAYER_API_KEY);
    console.log(`✅ Minted ${supply} tokens to ${treasuryAta.toBase58()}`);
  } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`❌ Mint initial supply failed: ${errMsg}`);
    process.exit(1);
  }
}

mintInitialSupply().catch((e) => {
  console.error(`Mint initial supply failed: ${e.message}`);
  process.exit(1);
});
