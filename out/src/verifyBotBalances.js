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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const pdas_1 = require("./utils/pdas");
const securityConfig_1 = require("./utils/securityConfig");
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
    const connection = (0, securityConfig_1.createSecureConnection)('confirmed');
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
    let mintAddress;
    try {
        const mc = JSON.parse(fs.readFileSync(mintCachePath, 'utf-8'));
        mintAddress = typeof mc === 'string' ? mc : mc.mint;
    }
    catch (e) {
        console.error('Failed to parse mint.json');
        process.exit(1);
    }
    if (!mintAddress) {
        console.error('Mint address not found in mint.json');
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddress);
    const botsConfig = JSON.parse(fs.readFileSync(botsPath, 'utf-8'));
    const botList = botsConfig.bots || [];
    const amountPerBotTokens = BigInt(botsConfig.amount || '0');
    const expectedBase = amountPerBotTokens * BigInt(10 ** DECIMALS);
    console.log(`Verifying ${botList.length} bots for ${amountPerBotTokens} tokens each (base units ${expectedBase}).`);
    const summary = { total: botList.length, exact: 0, partial: 0, missing: 0 };
    for (const bot of botList) {
        try {
            const botPk = new web3_js_1.PublicKey(bot);
            const ata = (0, pdas_1.findAssociatedTokenAddress)(botPk, mint);
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
            }
            else if (raw > BigInt(0)) {
                console.log(`⚠️ ${bot} partial balance ${raw.toString()} (expected ${expectedBase})`);
                summary.partial++;
            }
            else {
                console.log(`❌ ${bot} zero balance (expected ${expectedBase})`);
                summary.missing++;
            }
        }
        catch (e) {
            console.log(`Error checking ${bot}: ${e.message}`);
            summary.missing++;
        }
    }
    console.log('--- Summary ---');
    console.log(JSON.stringify(summary, null, 2));
    console.log('Balance verification complete.');
}
main().catch(e => { console.error(e); process.exit(1); });
