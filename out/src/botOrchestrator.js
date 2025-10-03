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
const txLogger_1 = require("./utils/txLogger");
const pdas_1 = require("./utils/pdas");
const securityConfig_1 = require("./utils/securityConfig");
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
    const connection = (0, securityConfig_1.createSecureConnection)('confirmed');
    const userAuth = (0, wallet_1.loadOrCreateUserAuth)();
    const relayerPubkey = new web3_js_1.PublicKey(process.env.RELAYER_PUBKEY);
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
    const mintKeypairJson = JSON.parse(fs.readFileSync(mintKeypairPath, 'utf-8'));
    const mintKeypair = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(mintKeypairJson));
    const mint = mintKeypair.publicKey;
    const botsConfig = JSON.parse(fs.readFileSync(botsPath, 'utf-8'));
    const botList = botsConfig.bots || [];
    const amountPerBotTokens = BigInt(botsConfig.amount || '0');
    if (botList.length === 0 || amountPerBotTokens === BigInt(0)) {
        console.error('bots.json must define non-empty bots array and amount.');
        process.exit(1);
    }
    const treasury = new web3_js_1.PublicKey(TREASURY_ADDRESS);
    const treasuryAta = (0, pdas_1.findAssociatedTokenAddress)(treasury, mint);
    const amountBaseUnits = amountPerBotTokens * BigInt(10 ** DECIMALS);
    console.log(`Distributing ${amountPerBotTokens} tokens (${amountBaseUnits} base units) to ${botList.length} bots.`);
    for (const bot of botList) {
        const botPk = new web3_js_1.PublicKey(bot);
        const botAta = (0, pdas_1.findAssociatedTokenAddress)(botPk, mint);
        const tx = new web3_js_1.Transaction();
        // Ensure bot ATA exists
        const botAtaInfo = await connection.getAccountInfo(botAta);
        if (!botAtaInfo) {
            const ata = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, userAuth, mint, botPk, true, 'confirmed', { commitment: 'confirmed' }, spl_token_1.TOKEN_2022_PROGRAM_ID);
            if (ata.instruction) {
                tx.add(ata.instruction);
            }
        }
        tx.add((0, spl_token_1.createTransferInstruction)(treasuryAta, botAta, userAuth.publicKey, Number(amountBaseUnits), [], spl_token_1.TOKEN_2022_PROGRAM_ID));
        tx.feePayer = userAuth.publicKey;
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = blockhash;
        tx.partialSign(userAuth);
        let signature = 'DRY_RUN_SIGNATURE';
        try {
            signature = await (0, relayer_1.sendViaRelayer)(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL, tx, process.env.RELAYER_API_KEY);
            console.log(`✅ Distributed to ${bot}: https://explorer.solana.com/tx/${signature}`);
        }
        catch (e) {
            console.error(`❌ Distribution to ${bot} failed: ${e.message}`);
            if (!dryRun)
                continue; // skip logging failed real tx
        }
        (0, txLogger_1.appendDeploymentEvent)({
            timestamp: new Date().toISOString(),
            action: 'bot-distribution',
            signature,
            details: { bot, amountBaseUnits: amountBaseUnits.toString() }
        });
    }
    console.log('Bot distribution complete. Log written to .cache/deployment-log.json');
}
main().catch(e => { console.error(e); process.exit(1); });
