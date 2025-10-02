import { PublicKey } from '@solana/web3.js';

export const JUPITER_PROGRAM_ID = new PublicKey('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4');
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export const JUPITER_CONFIG = {
  programId: JUPITER_PROGRAM_ID,
  apiEndpoint: 'https://quote-api.jup.ag/v6',
  swapEndpoint: 'https://quote-api.jup.ag/v6/swap',
  slippageBps: 50, // 0.5%
};

export function getJupiterTipAccount(): PublicKey {
  // Jupiter's official tip account for MEV protection
  return new PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5');
}