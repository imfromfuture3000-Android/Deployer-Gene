"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintToAgentBots = mintToAgentBots;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const relayer_1 = require("./utils/relayer");
const deployerAuth_1 = require("./utils/deployerAuth");
const txLogger_1 = require("./utils/txLogger");
async function mintToAgentBots(mintAddress, config) {
    const connection = new web3_js_1.Connection(process.env.RPC_URL, 'confirmed');
    const mint = new web3_js_1.PublicKey(mintAddress);
    const authority = (0, deployerAuth_1.loadDeployerAuth)();
    const initialTokens = BigInt(config.initialAmount) * BigInt(10 ** 9); // 9 decimals
    const investmentTokens = BigInt(config.investmentAmount) * BigInt(10 ** 9);
    for (const botPubkey of config.bots) {
        const bot = new web3_js_1.PublicKey(botPubkey);
        const ata = await (0, spl_token_1.getAssociatedTokenAddress)(mint, bot);
        const tx = new web3_js_1.Transaction();
        // Create ATA if needed
        try {
            await connection.getAccountInfo(ata);
        }
        catch {
            tx.add((0, spl_token_1.createAssociatedTokenAccountInstruction)(authority.publicKey, ata, bot, mint));
        }
        // Mint initial OMEGA tokens
        tx.add((0, spl_token_1.createMintToInstruction)(mint, ata, authority.publicKey, initialTokens));
        // Mint investment impulse tokens
        tx.add((0, spl_token_1.createMintToInstruction)(mint, ata, authority.publicKey, investmentTokens));
        tx.partialSign(authority);
        const signature = await (0, relayer_1.sendViaRelayer)(connection, process.env.RELAYER_PUBKEY, process.env.RELAYER_URL, tx, process.env.RELAYER_API_KEY);
        await (0, txLogger_1.appendDeploymentEvent)({
            timestamp: new Date().toISOString(),
            action: 'agent-bot-mint',
            signature,
            details: {
                bot: botPubkey,
                initialAmount: initialTokens.toString(),
                investmentAmount: investmentTokens.toString(),
                totalMinted: (initialTokens + investmentTokens).toString()
            }
        });
        console.log(`✅ Bot ${botPubkey}: ${config.initialAmount} + ${config.investmentAmount} tokens`);
    }
}
