import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token';
import { sendViaRelayer } from './utils/relayer';
import { loadDeployerAuth } from './utils/deployerAuth';
import { appendDeploymentEvent } from './utils/txLogger';

const EARNINGS_VAULT = 'F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR';
const REINVEST_PERCENTAGE = 30; // 30% reinvest, 70% distribute

interface DistributionConfig {
  bots: string[];
  reinvestAddress: string;
}

export async function autoDistributeEarnings(mintAddress: string, config: DistributionConfig): Promise<void> {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const mint = new PublicKey(mintAddress);
  const vault = new PublicKey(EARNINGS_VAULT);
  const authority = loadDeployerAuth();
  
  // Get vault balance
  const vaultAta = await getAssociatedTokenAddress(mint, vault);
  const vaultAccount = await getAccount(connection, vaultAta);
  const totalEarnings = vaultAccount.amount;
  
  if (totalEarnings === 0n) {
    console.log('No earnings to distribute');
    return;
  }
  
  const reinvestAmount = (totalEarnings * BigInt(REINVEST_PERCENTAGE)) / 100n;
  const distributeAmount = totalEarnings - reinvestAmount;
  const perBotAmount = distributeAmount / BigInt(config.bots.length);
  
  const tx = new Transaction();
  
  // Reinvest portion
  if (reinvestAmount > 0n) {
    const reinvestAta = await getAssociatedTokenAddress(mint, new PublicKey(config.reinvestAddress));
    tx.add(createTransferInstruction(vaultAta, reinvestAta, authority.publicKey, reinvestAmount));
  }
  
  // Distribute to bots
  for (const botPubkey of config.bots) {
    const botAta = await getAssociatedTokenAddress(mint, new PublicKey(botPubkey));
    tx.add(createTransferInstruction(vaultAta, botAta, authority.publicKey, perBotAmount));
  }
  
  tx.partialSign(authority);
  
  const signature = await sendViaRelayer(
    connection,
    process.env.RELAYER_PUBKEY!,
    process.env.RELAYER_URL!,
    tx,
    process.env.RELAYER_API_KEY
  );
  
  await appendDeploymentEvent({
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