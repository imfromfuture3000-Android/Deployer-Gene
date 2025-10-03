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
dotenv.config();
async function rollback() {
    const cacheDir = path.join(process.cwd(), '.cache');
    const mintCachePath = path.join(cacheDir, 'mint.json');
    const userAuthPath = path.join(cacheDir, 'user_auth.json');
    if (fs.existsSync(mintCachePath)) {
        const mint = new web3_js_1.PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
        const connection = new web3_js_1.Connection(process.env.RPC_URL, 'confirmed');
        const metadataPda = (0, pdas_1.findMetadataPda)(mint);
        const mintInfo = await connection.getAccountInfo(mint);
        const metadataInfo = await connection.getAccountInfo(metadataPda);
        console.log(`Mint exists: ${mintInfo ? 'Yes' : 'No'}`);
        console.log(`Metadata exists: ${metadataInfo ? 'Yes' : 'No'}`);
        console.log('Note: On-chain data (mint, metadata) cannot be deleted. Delete cache to restart.');
        fs.unlinkSync(mintCachePath);
        console.log('Deleted mint cache.');
    }
    if (fs.existsSync(userAuthPath)) {
        fs.unlinkSync(userAuthPath);
        console.log('Deleted user auth cache.');
    }
    console.log('Rollback complete. Run `npm run mainnet:all` to restart deployment.');
}
rollback().catch((e) => {
    console.error(`Rollback failed: ${e.message}`);
    process.exit(1);
});
