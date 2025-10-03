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
const txLogger_1 = require("./utils/txLogger");
const deployerAuth_1 = require("./utils/deployerAuth");
dotenv.config();
/*
  Reannounce Controller / Co-Controller
  - Writes a JSON file capturing deployer (master controller) & COCREATOR_PUBKEY plus optional note
  - No on-chain tx (authorities already set by lockAuthorities), purely off-chain attestation for transparency
*/
function main() {
    const controller = (0, deployerAuth_1.loadDeployerAuth)().publicKey.toBase58();
    const cocreator = process.env.COCREATOR_PUBKEY;
    if (!cocreator) {
        console.error('Missing COCREATOR_PUBKEY env var.');
        process.exit(1);
    }
    try {
        new web3_js_1.PublicKey(controller);
        new web3_js_1.PublicKey(cocreator);
    }
    catch {
        console.error('Invalid public key format.');
        process.exit(1);
    }
    const cacheDir = path.join(process.cwd(), '.cache');
    if (!fs.existsSync(cacheDir))
        fs.mkdirSync(cacheDir, { recursive: true });
    const pathOut = path.join(cacheDir, 'controller-announcement.json');
    const payload = {
        timestamp: new Date().toISOString(),
        controller,
        cocreator,
        note: process.env.CONTROLLER_NOTE || 'Reannouncement of active authorities for transparency.'
    };
    fs.writeFileSync(pathOut, JSON.stringify(payload, null, 2));
    (0, txLogger_1.appendDeploymentEvent)({ timestamp: new Date().toISOString(), action: 'controller-reannounce', signature: 'OFF_CHAIN', details: payload });
    console.log(`Controller reannouncement written to ${pathOut}`);
}
main();
