"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SWAP_PAIRS = exports.OMEGA_MINT = exports.IMPULSE_MINT = void 0;
exports.getSwapPair = getSwapPair;
const web3_js_1 = require("@solana/web3.js");
const jupiterIntegration_1 = require("./jupiterIntegration");
exports.IMPULSE_MINT = new web3_js_1.PublicKey(process.env.MINT_ADDRESS || '');
exports.OMEGA_MINT = new web3_js_1.PublicKey(process.env.MINT_ADDRESS || '');
exports.SWAP_PAIRS = {
    IMPULSE_USDC: {
        inputMint: exports.IMPULSE_MINT,
        outputMint: jupiterIntegration_1.USDC_MINT,
        symbol: 'IMPULSE/USDC'
    },
    OMEGA_USDC: {
        inputMint: exports.OMEGA_MINT,
        outputMint: jupiterIntegration_1.USDC_MINT,
        symbol: 'OMEGA/USDC'
    },
    USDC_IMPULSE: {
        inputMint: jupiterIntegration_1.USDC_MINT,
        outputMint: exports.IMPULSE_MINT,
        symbol: 'USDC/IMPULSE'
    },
    USDC_OMEGA: {
        inputMint: jupiterIntegration_1.USDC_MINT,
        outputMint: exports.OMEGA_MINT,
        symbol: 'USDC/OMEGA'
    }
};
function getSwapPair(from, to) {
    const key = `${from.toUpperCase()}_${to.toUpperCase()}`;
    return exports.SWAP_PAIRS[key];
}
