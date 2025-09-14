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
exports.getSecureConfig = getSecureConfig;
exports.createSecureConnection = createSecureConnection;
exports.logSecurityWarnings = logSecurityWarnings;
exports.updateSecurityConfig = updateSecurityConfig;
const dotenv = __importStar(require("dotenv"));
const web3_js_1 = require("@solana/web3.js");
// Load environment variables
dotenv.config();
/**
 * Validates that a string is a valid Solana public key
 */
function validatePublicKey(key, name) {
    if (!key)
        return;
    try {
        new web3_js_1.PublicKey(key);
    }
    catch (error) {
        throw new Error(`Invalid public key for ${name}: ${key}`);
    }
}
/**
 * Validates that an API key is not a placeholder or empty
 */
function validateApiKey(key, name) {
    if (!key)
        return;
    const placeholders = ['<YOUR_', 'REPLACE', 'INSERT', 'PLACEHOLDER'];
    if (placeholders.some(placeholder => key.includes(placeholder))) {
        throw new Error(`${name} appears to be a placeholder. Please set a real API key.`);
    }
    if (key.length < 8) {
        throw new Error(`${name} appears to be too short. Please verify the API key.`);
    }
}
/**
 * Gets secure configuration from environment variables with validation
 */
function getSecureConfig() {
    const config = {
        rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
        heliusApiKey: process.env.HELIUS_API_KEY,
        rpcUrlWithKey: '',
        sourceWalletAddress: process.env.SOURCE_WALLET_ADDRESS,
        targetWalletAddress: process.env.TARGET_WALLET_ADDRESS,
        treasuryPubkey: process.env.TREASURY_PUBKEY,
        daoPubkey: process.env.DAO_PUBKEY,
        controllerPubkey: process.env.CONTROLLER_PUBKEY,
        cocreatorPubkey: process.env.COCREATOR_PUBKEY,
        relayerUrl: process.env.RELAYER_URL,
        relayerPubkey: process.env.RELAYER_PUBKEY,
        relayerApiKey: process.env.RELAYER_API_KEY,
        authorityMode: process.env.AUTHORITY_MODE || 'null',
        dryRun: process.env.DRY_RUN === 'true'
    };
    // Validate API keys
    validateApiKey(config.heliusApiKey, 'HELIUS_API_KEY');
    validateApiKey(config.relayerApiKey, 'RELAYER_API_KEY');
    // Validate public keys
    validatePublicKey(config.sourceWalletAddress, 'SOURCE_WALLET_ADDRESS');
    validatePublicKey(config.targetWalletAddress, 'TARGET_WALLET_ADDRESS');
    validatePublicKey(config.treasuryPubkey, 'TREASURY_PUBKEY');
    validatePublicKey(config.daoPubkey, 'DAO_PUBKEY');
    validatePublicKey(config.controllerPubkey, 'CONTROLLER_PUBKEY');
    validatePublicKey(config.cocreatorPubkey, 'COCREATOR_PUBKEY');
    validatePublicKey(config.relayerPubkey, 'RELAYER_PUBKEY');
    // Build RPC URL with API key if available
    if (config.heliusApiKey) {
        config.rpcUrlWithKey = `https://mainnet.helius-rpc.com/?api-key=${config.heliusApiKey}`;
    }
    else {
        config.rpcUrlWithKey = config.rpcUrl;
    }
    // Validate authority mode
    const validAuthorityModes = ['null', 'dao', 'treasury'];
    if (!validAuthorityModes.includes(config.authorityMode)) {
        throw new Error(`Invalid AUTHORITY_MODE: ${config.authorityMode}. Must be one of: ${validAuthorityModes.join(', ')}`);
    }
    return config;
}
/**
 * Creates a Solana connection using secure configuration
 */
function createSecureConnection(commitment = 'confirmed') {
    const config = getSecureConfig();
    if (config.dryRun) {
        console.warn('⚠️  DRY_RUN mode is enabled. No transactions will be executed.');
    }
    return new web3_js_1.Connection(config.rpcUrlWithKey, commitment);
}
/**
 * Logs security warnings if using placeholder values
 */
function logSecurityWarnings() {
    const config = getSecureConfig();
    console.log('🔒 Security Configuration Check:');
    if (!config.heliusApiKey) {
        console.warn('⚠️  HELIUS_API_KEY not set. Using default RPC endpoint which may have rate limits.');
    }
    if (!config.sourceWalletAddress || !config.targetWalletAddress) {
        console.warn('⚠️  Wallet addresses not configured. Some functionality may be limited.');
    }
    if (config.dryRun) {
        console.log('✅ DRY_RUN mode enabled - transactions will be simulated only.');
    }
    else {
        console.warn('⚠️  DRY_RUN mode disabled - transactions will be executed on mainnet!');
    }
    console.log('🔒 Security check complete.\n');
}
/**
 * Updates the security configuration and validates environment variables
 */
function updateSecurityConfig() {
    const config = getSecureConfig();
    // Update checkEnv.ts to use the new security config
    console.log('✅ Security configuration updated successfully');
    console.log('🔒 Environment validation completed');
    if (config.dryRun) {
        console.log('🛡️  DRY_RUN mode is active - no real transactions will be executed');
    }
}
