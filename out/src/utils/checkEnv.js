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
const dotenv = __importStar(require("dotenv"));
const securityConfig_1 = require("./securityConfig");
dotenv.config();
async function checkEnv() {
    console.log('🔒 Enhanced Security Environment Check');
    console.log('=====================================');
    try {
        // Use the new security configuration
        const config = (0, securityConfig_1.getSecureConfig)();
        // Log security warnings
        (0, securityConfig_1.logSecurityWarnings)();
        // Test RPC connection
        const connection = new web3_js_1.Connection(config.rpcUrlWithKey, 'confirmed');
        await connection.getLatestBlockhash();
        console.log('✅ RPC connection successful');
        console.log('✅ All environment variables validated successfully');
        console.log('🛡️  Security configuration is properly set up');
    }
    catch (e) {
        console.error('❌ Environment check failed:', e.message);
        throw e;
    }
}
checkEnv().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
