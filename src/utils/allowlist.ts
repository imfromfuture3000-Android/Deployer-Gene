export const ALLOWED_RPC_ENDPOINTS = [
  // Helius
  'https://mainnet.helius-rpc.com',
  'https://devnet.helius-rpc.com',
  'https://rpc.helius.xyz',
  
  // Solana Official
  'https://api.mainnet-beta.solana.com',
  'https://api.devnet.solana.com',
  'https://api.testnet.solana.com',
  
  // QuickNode
  'https://solana-mainnet.quiknode.pro',
  'https://solana-devnet.quiknode.pro',
  'https://api.quicknode.com'
];

export function validateRpcEndpoint(url: string): boolean {
  return ALLOWED_RPC_ENDPOINTS.some(endpoint => 
    url.startsWith(endpoint)
  );
}

export function getValidatedRpcUrl(url: string): string {
  if (!validateRpcEndpoint(url)) {
    throw new Error(`RPC endpoint not allowlisted: ${url}`);
  }
  return url;
}