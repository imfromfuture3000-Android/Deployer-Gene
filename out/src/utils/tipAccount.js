"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIP_ACCOUNT_CONFIG = exports.HELIUS_TIP_ACCOUNTS = void 0;
exports.getRandomTipAccount = getRandomTipAccount;
exports.calculateOptimalTip = calculateOptimalTip;
exports.getTipAccountForProgram = getTipAccountForProgram;
const web3_js_1 = require("@solana/web3.js");
// Helius tip accounts for rebates
exports.HELIUS_TIP_ACCOUNTS = [
    'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY', // Primary tip account
    'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL', // Secondary tip account
    '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5', // Tertiary tip account
    'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe' // Quaternary tip account
];
exports.TIP_ACCOUNT_CONFIG = {
    // Minimum tip for rebate eligibility (in lamports)
    MIN_TIP_LAMPORTS: 1000, // 0.000001 SOL
    // Maximum tip for optimal rebates (in lamports)  
    MAX_TIP_LAMPORTS: 100000, // 0.0001 SOL
    // Default tip amount (in lamports)
    DEFAULT_TIP_LAMPORTS: 10000, // 0.00001 SOL
    // Rebate percentage (basis points)
    REBATE_BPS: 50, // 0.5%
};
function getRandomTipAccount() {
    const randomIndex = Math.floor(Math.random() * exports.HELIUS_TIP_ACCOUNTS.length);
    return new web3_js_1.PublicKey(exports.HELIUS_TIP_ACCOUNTS[randomIndex]);
}
function calculateOptimalTip(transactionSize) {
    // Base tip calculation based on transaction complexity
    const baseTip = Math.max(exports.TIP_ACCOUNT_CONFIG.MIN_TIP_LAMPORTS, transactionSize * 10);
    return Math.min(baseTip, exports.TIP_ACCOUNT_CONFIG.MAX_TIP_LAMPORTS);
}
function getTipAccountForProgram(programId) {
    // Deterministic tip account selection based on program ID
    const hash = programId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % exports.HELIUS_TIP_ACCOUNTS.length;
    return new web3_js_1.PublicKey(exports.HELIUS_TIP_ACCOUNTS[index]);
}
