"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHeliusWebhookConfig = createHeliusWebhookConfig;
exports.setupHeliusWebhook = setupHeliusWebhook;
const deployerAuth_1 = require("./deployerAuth");
const tipAccount_1 = require("./tipAccount");
const jupiterIntegration_1 = require("./jupiterIntegration");
const contractAddresses_1 = require("./contractAddresses");
function createHeliusWebhookConfig() {
    const deployerAddress = (0, deployerAuth_1.getDeployerPublicKey)();
    return {
        webhookURL: process.env.WEBHOOK_URL || 'https://your-webhook-endpoint.com/helius',
        transactionTypes: [
            'SWAP',
            'NFT_SALE',
            'TOKEN_MINT',
            'TRANSFER',
            'SET_AUTHORITY'
        ],
        accountAddresses: [
            deployerAddress,
            process.env.TREASURY_PUBKEY,
            process.env.MINT_ADDRESS,
            'F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR', // Earnings vault
            jupiterIntegration_1.JUPITER_PROGRAM_ID.toString(), // Jupiter program monitoring
            jupiterIntegration_1.USDC_MINT.toString(), // USDC transactions
            ...contractAddresses_1.ALL_CONTRACT_ADDRESSES, // All repo contract addresses
            ...tipAccount_1.HELIUS_TIP_ACCOUNTS // Include all tip accounts for rebate tracking
        ].filter(Boolean),
        webhookType: 'enhanced'
    };
}
async function setupHeliusWebhook() {
    const config = createHeliusWebhookConfig();
    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
        console.error('HELIUS_API_KEY required');
        return;
    }
    const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    });
    const result = await response.json();
    console.log('Helius webhook configured:', result.webhookID);
}
