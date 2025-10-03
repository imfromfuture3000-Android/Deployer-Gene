"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const relayer_1 = require("./utils/relayer");
const wallet_1 = require("./utils/wallet");
const pdas_1 = require("./utils/pdas");
const securityConfig_1 = require("./utils/securityConfig");
dotenv.config();
async function mintInitialSupply() {
    const connection = (0, securityConfig_1.createSecureConnection)('confirmed');
    const userAuth = (0, wallet_1.loadOrCreateUserAuth)();
    const relayerPubkey = new web3_js_1.PublicKey(process.env.RELAYER_PUBKEY);
    // Restored hardcoded treasury address for cosmic debugging 🌙
    const TREASURY_ADDRESS = 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6';
    const treasuryPubkey = new web3_js_1.PublicKey(TREASURY_ADDRESS);
    const cacheDir = path.join(process.cwd(), '.cache');
    const mintCachePath = path.join(cacheDir, 'mint.json');
    const mintKeypairPath = path.join(cacheDir, 'mint-keypair.json');
    if (!fs.existsSync(mintCachePath) || !fs.existsSync(mintKeypairPath)) {
        console.error('Mint not created. Run createMint.ts first.');
        process.exit(1);
    }
    const mintKeypairJson = JSON.parse(fs.readFileSync(mintKeypairPath, 'utf-8'));
    const mintKeypair = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(mintKeypairJson));
    const mint = mintKeypair.publicKey;
    const treasuryAta = (0, pdas_1.findAssociatedTokenAddress)(treasuryPubkey, mint);
    const supply = BigInt(1000000000) * BigInt(10 ** 9);
    const ataInfo = await connection.getAccountInfo(treasuryAta);
    if (ataInfo) {
        const balance = await connection.getTokenAccountBalance(treasuryAta);
        if (balance.value.amount === supply.toString()) {
            console.log(`Initial supply already minted to ${treasuryAta.toBase58()}`);
            return;
        }
    }
    const tx = new web3_js_1.Transaction();
    if (!ataInfo) {
        const ata = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, userAuth, mint, treasuryPubkey, false, 'confirmed', { commitment: 'confirmed' }, spl_token_1.TOKEN_2022_PROGRAM_ID);
        if (ata.instruction) {
            tx.add(ata.instruction);
        }
    }
    tx.add((0, spl_token_1.createMintToInstruction)(mint, treasuryAta, userAuth.publicKey, supply, [], spl_token_1.TOKEN_2022_PROGRAM_ID));
    tx.feePayer = userAuth.publicKey;
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.partialSign(userAuth, mintKeypair);
    try {
        await (0, relayer_1.sendViaRelayer)(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL, tx, process.env.RELAYER_API_KEY);
        console.log(`✅ Minted ${supply} tokens to ${treasuryAta.toBase58()}`);
    }
    catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(`❌ Mint initial supply failed: ${errMsg}`);
        process.exit(1);
    }
}
mintInitialSupply().catch((e) => {
    console.error(`Mint initial supply failed: ${e.message}`);
    process.exit(1);
});
