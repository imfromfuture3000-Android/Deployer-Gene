import { getDeployerPublicKey } from './deployerAuth';
import { HELIUS_TIP_ACCOUNTS, getRandomTipAccount } from './tipAccount';
import { JUPITER_PROGRAM_ID, USDC_MINT } from './jupiterIntegration';
import { ALL_CONTRACT_ADDRESSES } from './contractAddresses';

interface HeliusWebhookConfig {
  webhookURL: string;
  transactionTypes: string[];
  accountAddresses: string[];
  webhookType: 'enhanced' | 'raw';
}

export function createHeliusWebhookConfig(): HeliusWebhookConfig {
  const deployerAddress = getDeployerPublicKey();
  
  return {
    webhookURL: process.env.WEBHOOK_URL || 'https://your-webhook-endpoint.com/helius',
    transactionTypes: [
      'SWAP',
      'NFT_SALE', 
      'TOKEN_MINT',
      'TRANSFER',
      'SET_AUTHORITY'
    ],
    accountAddresses: [
      deployerAddress,
      process.env.TREASURY_PUBKEY!,
      process.env.MINT_ADDRESS!,
      'F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR', // Earnings vault
      JUPITER_PROGRAM_ID.toString(), // Jupiter program monitoring
      USDC_MINT.toString(), // USDC transactions
      ...ALL_CONTRACT_ADDRESSES, // All repo contract addresses
      ...HELIUS_TIP_ACCOUNTS // Include all tip accounts for rebate tracking
    ].filter(Boolean),
    webhookType: 'enhanced'
  };
}

export async function setupHeliusWebhook(): Promise<void> {
  const config = createHeliusWebhookConfig();
  const apiKey = process.env.HELIUS_API_KEY;
  
  if (!apiKey) {
    console.error('HELIUS_API_KEY required');
    return;
  }
  
  const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  
  const result = await response.json() as any;
  console.log('Helius webhook configured:', result.webhookID);
}