import { Connection, PublicKey, Transaction } from '@solana/web3.js';

import { loadOrCreateUserAuth } from './wallet';

export async function sendViaRelayer(
  connection: Connection,
  relayerPubkey: string,
  relayerUrl: string,
  tx: Transaction,
  apiKey?: string
): Promise<string> {
  const start = Date.now();
  tx.feePayer = new PublicKey(relayerPubkey);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;

  const b64 = tx.serialize({ requireAllSignatures: false }).toString('base64');
  if (process.env.DRY_RUN === 'true') {
    console.log(`[DRY_RUN] Transaction base64: ${b64.slice(0, 120)}...`);
    console.log(`[DRY_RUN] Transaction size: ${b64.length} bytes`);
    return 'DRY_RUN_SIGNATURE';
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  // Add rebate-address query param using deployer address for MEV rewards
  const { loadDeployerAuth } = require('./deployerAuth');
  const creatorAddress = loadDeployerAuth().publicKey.toBase58();
  
  // Add MEV tip account for rebates
  const mevTipAccount = 'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt'; // Helius tip account
  const rebateUrl = relayerUrl.includes('?')
    ? `${relayerUrl}&rebate-address=${creatorAddress}&smart-rebates=true`
    : `${relayerUrl}?rebate-address=${creatorAddress}&smart-rebates=true`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(rebateUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ signedTransactionBase64: b64 }),
      });
      const j = await res.json() as any;
      if (!j.success) throw new Error(j.error || `Relayer error (attempt ${attempt})`);
      await connection.confirmTransaction({ signature: j.txSignature, blockhash, lastValidBlockHeight }, 'confirmed');
      console.log(`Transaction confirmed: https://explorer.solana.com/tx/${j.txSignature} (${Date.now() - start}ms)`);
      return j.txSignature;
    } catch (e: any) {
      if (attempt === 3) throw new Error(`Relayer failed after 3 attempts: ${e.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Relayer unreachable');
}
