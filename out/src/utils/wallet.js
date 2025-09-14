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
exports.loadOrCreateUserAuth = loadOrCreateUserAuth;
const web3_js_1 = require("@solana/web3.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function loadOrCreateUserAuth() {
    const cacheDir = path.join(process.cwd(), '.cache');
    const keypairPath = path.join(cacheDir, 'user_auth.json');
    if (fs.existsSync(keypairPath)) {
        const keypairJson = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
        return web3_js_1.Keypair.fromSecretKey(Uint8Array.from(keypairJson));
    }
    const keypair = web3_js_1.Keypair.generate();
    if (!fs.existsSync(cacheDir))
        fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
    console.log(`Generated new USER_AUTH keypair: ${keypair.publicKey.toBase58()}`);
    return keypair;
}
