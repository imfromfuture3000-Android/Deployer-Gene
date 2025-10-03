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
const deployerAuth_1 = require("./utils/deployerAuth");
const securityConfig_1 = require("./utils/securityConfig");
dotenv.config();
async function lockAuthorities() {
    const connection = (0, securityConfig_1.createSecureConnection)('confirmed');
    const userAuth = (0, deployerAuth_1.loadDeployerAuth)();
    const relayerPubkey = new web3_js_1.PublicKey(process.env.RELAYER_PUBKEY);
    const controllerPubkey = userAuth.publicKey;
    const cocreatorPubkey = new web3_js_1.PublicKey(process.env.COCREATOR_PUBKEY);
    const authorityMode = process.env.AUTHORITY_MODE || 'custom';
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
    // Set MintTokens authority to deployer (master controller), FreezeAccount authority to co-creator
    const authoritySettings = [
        { type: spl_token_1.AuthorityType.MintTokens, newAuthority: controllerPubkey },
        { type: spl_token_1.AuthorityType.FreezeAccount, newAuthority: cocreatorPubkey }
    ];
    for (const { type, newAuthority } of authoritySettings) {
        const tx = new web3_js_1.Transaction();
        tx.add((0, spl_token_1.createSetAuthorityInstruction)(mint, userAuth.publicKey, type, newAuthority, [], spl_token_1.TOKEN_2022_PROGRAM_ID));
        tx.feePayer = userAuth.publicKey;
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = blockhash;
        tx.partialSign(userAuth);
        try {
            await (0, relayer_1.sendViaRelayer)(connection, relayerPubkey.toBase58(), process.env.RELAYER_URL, tx, process.env.RELAYER_API_KEY);
            console.log(`✅ Authority ${spl_token_1.AuthorityType[type]} set to ${newAuthority.toBase58()}`);
        }
        catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            console.error(`❌ Authority setting failed: ${errMsg}`);
            process.exit(1);
        }
    }
    console.log(`Mint ${mint.toBase58()} authorities updated.`);
}
lockAuthorities().catch((e) => {
    console.error(`Lock authorities failed: ${e.message}`);
    process.exit(1);
});
