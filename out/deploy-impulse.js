"use strict";
// Hardened deploy-impulse script (safe defaults, env-driven)
// SPDX-License-Identifier: MIT
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
// Note: createCreateMetadataAccountV3Instruction is deprecated in newer versions
// Using placeholder for metadata functionality
// import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';
// Configuration from environment (safe defaults)
const RPC_URL = process.env.RPC_URL || 'https://rpc.helius.xyz/?api-key=REPLACE_ME';
const RELAYER_URL = process.env.RELAYER_URL || '';
const RELAYER_PUBKEY = process.env.RELAYER_PUBKEY ? new web3_js_1.PublicKey(process.env.RELAYER_PUBKEY) : null;
const PAYER_PUBLIC_KEY = process.env.PAYER_PUBLIC_KEY ? new web3_js_1.PublicKey(process.env.PAYER_PUBLIC_KEY) : null;
const DRY_RUN = process.env.DRY_RUN ? process.env.DRY_RUN === 'true' : true; // safe default
function parseSecret(json) {
    if (!json)
        return null;
    try {
        const arr = JSON.parse(json);
        return web3_js_1.Keypair.fromSecretKey(Uint8Array.from(arr));
    }
    catch (err) {
        console.warn('Failed to parse WALLET_SECRET_JSON:', err);
        return null;
    }
}
const WALLET = parseSecret(process.env.WALLET_SECRET_JSON) || web3_js_1.Keypair.generate();
const CONNECTION = new web3_js_1.Connection(RPC_URL, { commitment: 'confirmed' });
// Program IDs (kept from original script)
const TOKEN_PROGRAM = new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const METAPLEX_METADATA = new web3_js_1.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
let CURRENT_MINT = null;
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
    const mintKeypair = web3_js_1.Keypair.generate();
    CURRENT_MINT = mintKeypair.publicKey;
    const tx = new web3_js_1.Transaction();
    tx.add(web3_js_1.SystemProgram.createAccount({
        fromPubkey: WALLET.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: 82,
        lamports: await CONNECTION.getMinimumBalanceForRentExemption(82),
        programId: TOKEN_PROGRAM,
    }));
    tx.add((0, spl_token_1.createInitializeMintInstruction)(mintKeypair.publicKey, 6, WALLET.publicKey, null));
    if (DRY_RUN) {
        console.log('DRY_RUN: would create mint', mintKeypair.publicKey.toBase58());
    }
    else {
        console.log('Sending mint init transaction...');
        await (0, web3_js_1.sendAndConfirmTransaction)(CONNECTION, tx, [WALLET, mintKeypair]);
    }
    // Step 2: Set metadata (disabled due to deprecated imports)
    console.log('2) Setting metadata (skipped - requires updated Metaplex library)');
    const mint = await getMintAddress();
    if (!mint)
        throw new Error('Mint not set');
    // TODO: Update to use newer Metaplex SDK when available
    // const metadataPda = (await PublicKey.findProgramAddress([Buffer.from('metadata'), METAPLEX_METADATA.toBuffer(), mint.toBuffer()], METAPLEX_METADATA))[0];
    // const metaTx = new Transaction();
    console.log('Metadata setting skipped for compatibility. Use Metaplex UMI SDK separately if needed.');
    if (DRY_RUN)
        console.log('DRY_RUN: would set metadata for', mint.toBase58());
    // else await sendAndConfirmTransaction(CONNECTION, metaTx, [WALLET]);
    // Step 3: Mint tokens to recipients (simulated amounts)
    console.log('3) Minting tokens (simulated)');
    const mintTx = new web3_js_1.Transaction();
    const recipients = [WALLET.publicKey]; // minimal: mint to treasury only in safe mode
    const amountPerRecipient = Number(process.env.AMOUNT_PER_RECIPIENT || '100000000');
    for (const recipient of recipients) {
        const ata = await (0, spl_token_1.getAssociatedTokenAddress)(mint, recipient);
        mintTx.add((0, spl_token_1.createAssociatedTokenAccountInstruction)(WALLET.publicKey, ata, recipient, mint));
        mintTx.add((0, spl_token_1.createMintToInstruction)(mint, ata, WALLET.publicKey, amountPerRecipient));
        console.log('DRY_RUN: would mint', amountPerRecipient, 'to', recipient.toBase58());
    }
    mintTx.add((0, spl_token_1.createSetAuthorityInstruction)(mint, WALLET.publicKey, spl_token_1.AuthorityType.MintTokens, null));
    if (!DRY_RUN)
        await (0, web3_js_1.sendAndConfirmTransaction)(CONNECTION, mintTx, [WALLET]);
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
