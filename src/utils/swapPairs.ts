import { PublicKey } from '@solana/web3.js';
import { JUPITER_PROGRAM_ID, USDC_MINT } from './jupiterIntegration';

export const IMPULSE_MINT = new PublicKey(process.env.MINT_ADDRESS || '');
export const OMEGA_MINT = new PublicKey(process.env.MINT_ADDRESS || '');

export const SWAP_PAIRS = {
  IMPULSE_USDC: {
    inputMint: IMPULSE_MINT,
    outputMint: USDC_MINT,
    symbol: 'IMPULSE/USDC'
  },
  OMEGA_USDC: {
    inputMint: OMEGA_MINT,
    outputMint: USDC_MINT,
    symbol: 'OMEGA/USDC'
  },
  USDC_IMPULSE: {
    inputMint: USDC_MINT,
    outputMint: IMPULSE_MINT,
    symbol: 'USDC/IMPULSE'
  },
  USDC_OMEGA: {
    inputMint: USDC_MINT,
    outputMint: OMEGA_MINT,
    symbol: 'USDC/OMEGA'
  }
};

export function getSwapPair(from: string, to: string) {
  const key = `${from.toUpperCase()}_${to.toUpperCase()}`;
  return SWAP_PAIRS[key as keyof typeof SWAP_PAIRS];
}