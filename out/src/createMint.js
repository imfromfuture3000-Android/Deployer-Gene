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
const retries = 10;
dotenv.config();
async function createTokenMintWithRetry() {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const connection = new web3_js_1.Connection(process.env.RPC_URL, 'confirmed');
            const userAuth = (0, wallet_1.loadOrCreateUserAuth)();
            const relayerPubkey = new web3_js_1.PublicKey(process.env.RELAYER_PUBKEY);
            const cacheDir = path.join(process.cwd(), '.cache');
            const mintCachePath = path.join(cacheDir, 'mint.json');
            // Restored hardcoded treasury address for cosmic debugging 🌙
            const TREASURY_ADDRESS = 'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6';
            if (fs.existsSync(mintCachePath)) {
                let mint;
                try {
                    const mintCache = JSON.parse(fs.readFileSync(mintCachePath, 'utf-8'));
                    if (typeof mintCache === 'string') {
                        mint = mintCache;
                        // Rewrite file to correct format
                        fs.writeFileSync(mintCachePath, JSON.stringify({ mint }));
                    }
                    else if (mintCache && typeof mintCache.mint === 'string') {
                        mint = mintCache.mint;
                    }
                }
                catch (err) {
                    console.error('Error reading mint cache:', err);
                }
                if (mint) {
                    const mintInfo = await connection.getAccountInfo(new web3_js_1.PublicKey(mint));
                    if (mintInfo) {
                        console.log(`Mint already exists: ${mint}`);
                        return new web3_js_1.PublicKey(mint);
                    }
                }
            }
            const mintKeypairPath = path.join(cacheDir, 'mint-keypair.json');
            let mintKeypair;
            let mintAddress;
            try {
                if (fs.existsSync(mintKeypairPath)) {
                    const mintKeypairRaw = fs.readFileSync(mintKeypairPath, 'utf-8');
                    if (!mintKeypairRaw || mintKeypairRaw.trim().length === 0)
                        throw new Error('mint-keypair.json is empty!');
                    const mintKeypairJson = JSON.parse(mintKeypairRaw);
                    if (!mintKeypairJson || !Array.isArray(mintKeypairJson) || mintKeypairJson.length !== 64)
                        throw new Error('Invalid mint-keypair.json format or length');
                    mintKeypair = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(mintKeypairJson));
                    mintAddress = mintKeypair.publicKey;
                }
                else {
                    mintKeypair = web3_js_1.Keypair.generate();
                    mintAddress = mintKeypair.publicKey;
                    if (!fs.existsSync(cacheDir))
                        fs.mkdirSync(cacheDir, { recursive: true });
                    fs.writeFileSync(mintKeypairPath, JSON.stringify(Array.from(mintKeypair.secretKey)));
                }
            }
            catch (err) {
                console.error('Error loading mint keypair:', err);
                process.exit(1);
            }
            if (!mintKeypair || !mintAddress || !(mintAddress instanceof web3_js_1.PublicKey)) {
                console.error('Mint keypair or address is undefined or invalid!');
                process.exit(1);
            }
            fs.writeFileSync(mintCachePath, JSON.stringify({ mint: mintKeypair.publicKey.toBase58() }));
            const tx = new web3_js_1.Transaction();
            let ownerPubkey, freezePubkey;
            try {
                ownerPubkey = new web3_js_1.PublicKey(TREASURY_ADDRESS);
                freezePubkey = new web3_js_1.PublicKey(TREASURY_ADDRESS);
            }
            catch (err) {
                console.error('Error constructing owner/freeze PublicKey:', err);
                process.exit(1);
            }
            if (!ownerPubkey || !freezePubkey || !(ownerPubkey instanceof web3_js_1.PublicKey) || !(freezePubkey instanceof web3_js_1.PublicKey)) {
                console.error('Owner or freeze authority PublicKey is undefined or invalid!');
                process.exit(1);
            }
            tx.add((0, spl_token_1.createInitializeMintInstruction)(mintAddress, 9, ownerPubkey, freezePubkey, spl_token_1.TOKEN_2022_PROGRAM_ID));
            // Set fee payer and recent blockhash
            if (!userAuth || !userAuth.publicKey || !(userAuth.publicKey instanceof web3_js_1.PublicKey)) {
                console.error('User auth keypair or publicKey is undefined or invalid!');
                process.exit(1);
            }
            tx.feePayer = userAuth.publicKey;
            const { blockhash } = await connection.getLatestBlockhash('confirmed');
            tx.recentBlockhash = blockhash;
            // Sign only with mintKeypair; relayer will be fee payer and finalize
            tx.partialSign(userAuth, mintKeypair);
            const signature = await (0, relayer_1.sendViaRelayer)(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL, tx, process.env.RELAYER_API_KEY);
            if (signature !== 'DRY_RUN_SIGNATURE') {
                if (!fs.existsSync(cacheDir))
                    fs.mkdirSync(cacheDir, { recursive: true });
                fs.writeFileSync(mintCachePath, JSON.stringify({ mint: mintKeypair.publicKey.toBase58() }));
            }
            console.log(`Created mint: ${mintKeypair.publicKey.toBase58()}`);
            return mintKeypair.publicKey;
        }
        catch (e) {
            console.log('Error details:', e);
            const errMsg = e instanceof Error ? e.message : String(e);
            console.error(`Mint creation failed (attempt ${attempt}): ${errMsg}`);
            if (attempt === retries) {
                process.exit(1);
            }
        }
    }
}
createTokenMintWithRetry();
