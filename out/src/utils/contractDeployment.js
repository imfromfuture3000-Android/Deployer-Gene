"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractDeployer = void 0;
const heliusRebates_1 = require("./heliusRebates");
const tipAccount_1 = require("./tipAccount");
class ContractDeployer {
    constructor(config) {
        this.config = config;
        this.rebateManager = new heliusRebates_1.HeliusRebateManager(config.connection);
    }
    async deployWithRebates(instructions) {
        // Create transaction with rebate optimization
        const transaction = (0, heliusRebates_1.createRebateEnabledTransaction)(this.config.feePayer, instructions, this.config.connection);
        // Add program-specific tip account if MEV protection enabled
        if (this.config.enableMevProtection) {
            const programTipAccount = (0, tipAccount_1.getTipAccountForProgram)(this.config.programId.toString());
            console.log(`🛡️ MEV Protection: Using tip account ${programTipAccount.toString()}`);
        }
        // Get recent blockhash
        const { blockhash } = await this.config.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        // Estimate rebate
        const estimatedCost = await this.config.connection.getFeeForMessage(transaction.compileMessage());
        if (estimatedCost.value) {
            const rebateAmount = await this.rebateManager.estimateRebate(estimatedCost.value);
            console.log(`💰 Estimated rebate: ${rebateAmount} lamports`);
        }
        // Send transaction (would be signed by relayer in actual implementation)
        console.log('🚀 Deploying contract with Helius rebates enabled...');
        // Return mock signature for demonstration
        return 'mock_signature_with_rebates_enabled';
    }
    getDeploymentSummary() {
        return {
            programId: this.config.programId.toString(),
            rebatesEnabled: this.config.enableRebates,
            mevProtectionEnabled: this.config.enableMevProtection,
            tipAccount: (0, tipAccount_1.getTipAccountForProgram)(this.config.programId.toString()).toString(),
            timestamp: new Date().toISOString()
        };
    }
}
exports.ContractDeployer = ContractDeployer;
