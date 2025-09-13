// Hardened deploy-impulse script (safe defaults, env-driven)
// SPDX-License-Identifier: MIT

import 'dotenv/config';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createMintToInstruction, createSetAuthorityInstruction, createAssociatedTokenAccountInstruction, createInitializeMintInstruction, AuthorityType } from '@solana/spl-token';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';

// Configuration from environment (safe defaults)
const RPC_URL = process.env.RPC_URL || 'https://rpc.helius.xyz/?api-key=REPLACE_ME';
const RELAYER_URL = process.env.RELAYER_URL || '';
const RELAYER_PUBKEY = process.env.RELAYER_PUBKEY ? new PublicKey(process.env.RELAYER_PUBKEY) : null;
const PAYER_PUBLIC_KEY = process.env.PAYER_PUBLIC_KEY ? new PublicKey(process.env.PAYER_PUBLIC_KEY) : null;
const DRY_RUN = process.env.DRY_RUN ? process.env.DRY_RUN === 'true' : true; // safe default

function parseSecret(json?: string): Keypair | null {
  if (!json) return null;
  try {
    const arr = JSON.parse(json) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(arr));
  } catch (err) {
    console.warn('Failed to parse WALLET_SECRET_JSON:', err);
    return null;
  }
}

const WALLET = parseSecret(process.env.WALLET_SECRET_JSON) || Keypair.generate();
const CONNECTION = new Connection(RPC_URL, { commitment: 'confirmed' });

// Program IDs (kept from original script)
const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const METAPLEX_METADATA = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

let CURRENT_MINT: PublicKey | null = null;

async function deployImpulse() {
  console.log('🚀 Starting IMPULSE deployment (safe mode)');
  console.log('DRY_RUN:', DRY_RUN);
  console.log('RPC_URL:', RPC_URL);
  console.log('Wallet pubkey:', WALLET.publicKey.toBase58());

  const walletBal = await CONNECTION.getBalance(WALLET.publicKey).catch(() => 0);
  console.log('Wallet SOL balance:', walletBal / 1e9);
  if (!DRY_RUN && walletBal === 0 && !PAYER_PUBLIC_KEY && !RELAYER_PUBKEY) {
    throw new Error('No funded wallet/payer/relayer available. Aborting non-dry-run deployment.');
  }

  // Step 1: Initialize a mint (virtual pool simplified)
  console.log('1) Initializing mint (simulated)');
  const mintKeypair = Keypair.generate();
  CURRENT_MINT = mintKeypair.publicKey;
  const tx = new Transaction();
  tx.add(SystemProgram.createAccount({
    fromPubkey: WALLET.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: 82,
    lamports: await CONNECTION.getMinimumBalanceForRentExemption(82),
    programId: TOKEN_PROGRAM,
  }));
  tx.add(createInitializeMintInstruction(mintKeypair.publicKey, 6, WALLET.publicKey, null));

  if (DRY_RUN) {
    console.log('DRY_RUN: would create mint', mintKeypair.publicKey.toBase58());
  } else {
    console.log('Sending mint init transaction...');
    await sendAndConfirmTransaction(CONNECTION, tx, [WALLET, mintKeypair]);
  }

  // Step 2: Set metadata (simple)
  console.log('2) Setting metadata (simulated)');
  const mint = await getMintAddress();
  if (!mint) throw new Error('Mint not set');
  const metadataPda = (await PublicKey.findProgramAddress([Buffer.from('metadata'), METAPLEX_METADATA.toBuffer(), mint.toBuffer()], METAPLEX_METADATA))[0];
  const metaTx = new Transaction();
  metaTx.add(createCreateMetadataAccountV3Instruction({
    metadata: metadataPda,
    mint,
    mintAuthority: WALLET.publicKey,
    payer: WALLET.publicKey,
    updateAuthority: WALLET.publicKey,
  }, {
    createMetadataAccountArgsV3: {
      data: {
        name: process.env.TOKEN_NAME || 'IMPULSE',
        symbol: process.env.TOKEN_SYMBOL || 'IMPULSE',
        uri: process.env.TOKEN_METADATA_URI || '',
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      },
      isMutable: false,
      collectionDetails: null,
    }
  }));

  if (DRY_RUN) console.log('DRY_RUN: would set metadata for', mint.toBase58());
  else await sendAndConfirmTransaction(CONNECTION, metaTx, [WALLET]);

  // Step 3: Mint tokens to recipients (simulated amounts)
  console.log('3) Minting tokens (simulated)');
  const mintTx = new Transaction();
  const recipients = [WALLET.publicKey]; // minimal: mint to treasury only in safe mode
  const amountPerRecipient = Number(process.env.AMOUNT_PER_RECIPIENT || '100000000');
  for (const recipient of recipients) {
    const ata = await getAssociatedTokenAddress(mint, recipient);
    mintTx.add(createAssociatedTokenAccountInstruction(WALLET.publicKey, ata, recipient, mint));
    mintTx.add(createMintToInstruction(mint, ata, WALLET.publicKey, amountPerRecipient));
    console.log('DRY_RUN: would mint', amountPerRecipient, 'to', recipient.toBase58());
  }
  mintTx.add(createSetAuthorityInstruction(mint, WALLET.publicKey, AuthorityType.MintTokens, null));

  if (!DRY_RUN) await sendAndConfirmTransaction(CONNECTION, mintTx, [WALLET]);

  console.log('Done. Mint address:', mint.toBase58());
  console.log('Explorer:', `https://explorer.solana.com/address/${mint.toBase58()}?cluster=mainnet`);
}

async function getMintAddress() {
  return CURRENT_MINT;
}

if (require.main === module) {
  deployImpulse().catch(err => {
    console.error('Deployment error:', err);
    process.exitCode = 1;
  });
}

export {};
