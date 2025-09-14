"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendViaRelayer = sendViaRelayer;
const web3_js_1 = require("@solana/web3.js");
const wallet_1 = require("./wallet");
async function sendViaRelayer(connection, relayerPubkey, relayerUrl, tx, apiKey) {
    const start = Date.now();
    tx.feePayer = new web3_js_1.PublicKey(relayerPubkey);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    const b64 = tx.serialize({ requireAllSignatures: false }).toString('base64');
    if (process.env.DRY_RUN === 'true') {
        console.log(`[DRY_RUN] Transaction base64: ${b64.slice(0, 120)}...`);
        console.log(`[DRY_RUN] Transaction size: ${b64.length} bytes`);
        return 'DRY_RUN_SIGNATURE';
    }
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey)
        headers['Authorization'] = `Bearer ${apiKey}`;
    // Add rebate-address query param using creator address
    const creatorAddress = (0, wallet_1.loadOrCreateUserAuth)().publicKey.toBase58();
    const rebateUrl = relayerUrl.includes('?')
        ? `${relayerUrl}&rebate-address=${creatorAddress}`
        : `${relayerUrl}?rebate-address=${creatorAddress}`;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(rebateUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({ signedTransactionBase64: b64 }),
            });
            const j = await res.json();
            if (!j.success)
                throw new Error(j.error || `Relayer error (attempt ${attempt})`);
            await connection.confirmTransaction({ signature: j.txSignature, blockhash, lastValidBlockHeight }, 'confirmed');
            console.log(`Transaction confirmed: https://explorer.solana.com/tx/${j.txSignature} (${Date.now() - start}ms)`);
            return j.txSignature;
        }
        catch (e) {
            if (attempt === 3)
                throw new Error(`Relayer failed after 3 attempts: ${e.message}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    throw new Error('Relayer unreachable');
}
