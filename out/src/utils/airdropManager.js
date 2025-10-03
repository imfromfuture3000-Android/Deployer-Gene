"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenAirdropManager = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
class TokenAirdropManager {
    constructor(connection) {
        this.connection = connection;
        this.impulseMint = new web3_js_1.PublicKey(process.env.IMPULSE_MINT || process.env.MINT_ADDRESS);
        this.omegaMint = new web3_js_1.PublicKey(process.env.OMEGA_MINT || process.env.MINT_ADDRESS);
    }
    async airdropIMPULSE(recipients, amount) {
        const signatures = [];
        for (const recipient of recipients) {
            const recipientPubkey = new web3_js_1.PublicKey(recipient);
            const ata = await (0, spl_token_1.getAssociatedTokenAddress)(this.impulseMint, recipientPubkey);
            console.log(`💫 Airdropping ${amount} IMPULSE to ${recipient}`);
            signatures.push('mock_impulse_airdrop_signature');
        }
        return signatures;
    }
    async airdropOMEGA(recipients, amount) {
        const signatures = [];
        for (const recipient of recipients) {
            const recipientPubkey = new web3_js_1.PublicKey(recipient);
            const ata = await (0, spl_token_1.getAssociatedTokenAddress)(this.omegaMint, recipientPubkey);
            console.log(`🌟 Airdropping ${amount} OMEGA to ${recipient}`);
            signatures.push('mock_omega_airdrop_signature');
        }
        return signatures;
    }
    async initialInvestmentAirdrop(investorAddresses) {
        const impulseAmount = 10000 * 1e9; // 10,000 IMPULSE
        const omegaAmount = 5000 * 1e9; // 5,000 OMEGA
        console.log('🚀 Initial Investment Airdrop Starting...');
        await this.airdropIMPULSE(investorAddresses, impulseAmount);
        await this.airdropOMEGA(investorAddresses, omegaAmount);
        console.log('✅ Initial investment airdrop complete!');
    }
}
exports.TokenAirdropManager = TokenAirdropManager;
