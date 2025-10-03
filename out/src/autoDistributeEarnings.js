"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoDistributeEarnings = autoDistributeEarnings;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const relayer_1 = require("./utils/relayer");
const deployerAuth_1 = require("./utils/deployerAuth");
const txLogger_1 = require("./utils/txLogger");
const EARNINGS_VAULT = 'F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR';
const REINVEST_PERCENTAGE = 30; // 30% reinvest, 70% distribute
async function autoDistributeEarnings(mintAddress, config) {
    const connection = new web3_js_1.Connection(process.env.RPC_URL, 'confirmed');
    const mint = new web3_js_1.PublicKey(mintAddress);
    const vault = new web3_js_1.PublicKey(EARNINGS_VAULT);
    const authority = (0, deployerAuth_1.loadDeployerAuth)();
    // Get vault balance
    const vaultAta = await (0, spl_token_1.getAssociatedTokenAddress)(mint, vault);
    const vaultAccount = await (0, spl_token_1.getAccount)(connection, vaultAta);
    const totalEarnings = vaultAccount.amount;
    if (totalEarnings === 0n) {
        console.log('No earnings to distribute');
        return;
    }
    const reinvestAmount = (totalEarnings * BigInt(REINVEST_PERCENTAGE)) / 100n;
    const distributeAmount = totalEarnings - reinvestAmount;
    const perBotAmount = distributeAmount / BigInt(config.bots.length);
    const tx = new web3_js_1.Transaction();
    // Reinvest portion
    if (reinvestAmount > 0n) {
        const reinvestAta = await (0, spl_token_1.getAssociatedTokenAddress)(mint, new web3_js_1.PublicKey(config.reinvestAddress));
        tx.add((0, spl_token_1.createTransferInstruction)(vaultAta, reinvestAta, authority.publicKey, reinvestAmount));
    }
    // Distribute to bots
    for (const botPubkey of config.bots) {
        const botAta = await (0, spl_token_1.getAssociatedTokenAddress)(mint, new web3_js_1.PublicKey(botPubkey));
        tx.add((0, spl_token_1.createTransferInstruction)(vaultAta, botAta, authority.publicKey, perBotAmount));
    }
    tx.partialSign(authority);
    const signature = await (0, relayer_1.sendViaRelayer)(connection, process.env.RELAYER_PUBKEY, process.env.RELAYER_URL, tx, process.env.RELAYER_API_KEY);
    await (0, txLogger_1.appendDeploymentEvent)({
        timestamp: new Date().toISOString(),
        action: 'auto-distribute-earnings',
        signature,
        details: {
            totalEarnings: totalEarnings.toString(),
            reinvestAmount: reinvestAmount.toString(),
            distributeAmount: distributeAmount.toString(),
            perBotAmount: perBotAmount.toString(),
            botsCount: config.bots.length
        }
    });
    console.log(`✅ Distributed ${distributeAmount} tokens, reinvested ${reinvestAmount}`);
}
