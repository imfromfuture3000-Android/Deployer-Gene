"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JUPITER_CONFIG = exports.USDC_MINT = exports.JUPITER_PROGRAM_ID = void 0;
exports.getJupiterTipAccount = getJupiterTipAccount;
const web3_js_1 = require("@solana/web3.js");
exports.JUPITER_PROGRAM_ID = new web3_js_1.PublicKey('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4');
exports.USDC_MINT = new web3_js_1.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
exports.JUPITER_CONFIG = {
    programId: exports.JUPITER_PROGRAM_ID,
    apiEndpoint: 'https://quote-api.jup.ag/v6',
    swapEndpoint: 'https://quote-api.jup.ag/v6/swap',
    slippageBps: 50, // 0.5%
};
function getJupiterTipAccount() {
    // Jupiter's official tip account for MEV protection
    return new web3_js_1.PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5');
}
