"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeliusRebateManager = void 0;
exports.createRebateEnabledTransaction = createRebateEnabledTransaction;
const web3_js_1 = require("@solana/web3.js");
const tipAccount_1 = require("./tipAccount");
class HeliusRebateManager {
    constructor(connection) {
        this.connection = connection;
        this.rebateConfig = {
            enabled: process.env.HELIUS_REBATES_ENABLED === 'true',
            tipAccount: (0, tipAccount_1.getRandomTipAccount)(),
            tipAmount: tipAccount_1.TIP_ACCOUNT_CONFIG.DEFAULT_TIP_LAMPORTS,
            rebatePercentage: tipAccount_1.TIP_ACCOUNT_CONFIG.REBATE_BPS / 10000
        };
    }
    addTipInstruction(transaction, customTipAmount) {
        if (!this.rebateConfig.enabled)
            return transaction;
        const tipAmount = customTipAmount || (0, tipAccount_1.calculateOptimalTip)(transaction.instructions.length);
        const tipInstruction = web3_js_1.SystemProgram.transfer({
            fromPubkey: transaction.feePayer,
            toPubkey: this.rebateConfig.tipAccount,
            lamports: tipAmount
        });
        // Add tip as first instruction for priority
        transaction.instructions.unshift(tipInstruction);
        return transaction;
    }
    async estimateRebate(transactionCost) {
        if (!this.rebateConfig.enabled)
            return 0;
        return transactionCost * this.rebateConfig.rebatePercentage;
    }
    getOptimalTipForTransaction(instructions) {
        const complexity = instructions.reduce((acc, ix) => acc + ix.data.length, 0);
        return (0, tipAccount_1.calculateOptimalTip)(complexity);
    }
    rotateTipAccount() {
        this.rebateConfig.tipAccount = (0, tipAccount_1.getRandomTipAccount)();
    }
}
exports.HeliusRebateManager = HeliusRebateManager;
function createRebateEnabledTransaction(feePayer, instructions, connection) {
    const transaction = new web3_js_1.Transaction();
    transaction.feePayer = feePayer;
    const rebateManager = new HeliusRebateManager(connection);
    // Add all instructions
    instructions.forEach(ix => transaction.add(ix));
    // Add tip instruction for rebates
    return rebateManager.addTipInstruction(transaction);
}
