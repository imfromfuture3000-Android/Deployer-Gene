import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createMintToInstruction } from '@solana/spl-token';
import { sendViaRelayer } from './utils/relayer';
import { loadDeployerAuth } from './utils/deployerAuth';
import { appendDeploymentEvent } from './utils/txLogger';

interface BotConfig {
  bots: string[];
  initialAmount: string;
  investmentAmount: string;
}

export async function mintToAgentBots(mintAddress: string, config: BotConfig): Promise<void> {
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const mint = new PublicKey(mintAddress);
  const authority = loadDeployerAuth();
  
  const initialTokens = BigInt(config.initialAmount) * BigInt(10 ** 9); // 9 decimals
  const investmentTokens = BigInt(config.investmentAmount) * BigInt(10 ** 9);
  
  for (const botPubkey of config.bots) {
    const bot = new PublicKey(botPubkey);
    const ata = await getAssociatedTokenAddress(mint, bot);
    
    const tx = new Transaction();
    
    // Create ATA if needed
    try {
      await connection.getAccountInfo(ata);
    } catch {
      tx.add(createAssociatedTokenAccountInstruction(authority.publicKey, ata, bot, mint));
    }
    
    // Mint initial OMEGA tokens
    tx.add(createMintToInstruction(mint, ata, authority.publicKey, initialTokens));
    
    // Mint investment impulse tokens
    tx.add(createMintToInstruction(mint, ata, authority.publicKey, investmentTokens));
    
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