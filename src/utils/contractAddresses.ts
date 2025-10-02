import { PublicKey } from '@solana/web3.js';

export function findMetadataPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(), mint.toBuffer()],
    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  )[0];
}

export function findAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(), mint.toBuffer()],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  )[0];
}

// All contract addresses from repo for MEV and Helius rebates
export const ALL_CONTRACT_ADDRESSES = [
  'HKBJoeUWH6pUQuLd9CZWrJBzGSE9roEW4bshnxd9AHsR', // Bot 1
  'NqGHDaaLWmND7uShuaZkVbGNQFy6pS96qHyfR3pGR2d', // Bot 2
  'DbhKvqweZECTyYQ7PRJoHmKt8f262fsBCGHxSaD5BPqA', // Bot 3
  '7uSCVM1MJPKctrSRzuFN7qfVoJX78q6V5q5JuzRPaK41', // Bot 4
  '3oFCkoneQShDsJMZYscXew4jGwgLjpxfykHuGo85QyLw', // Bot 5
  'EAy5Nfn6fhs4ixC4sMcKQYQaoedLokpWqbfDtWURCnk6', // Contract 1
  'HUwjG8LFabw28vJsQNoLXjxuzgdLhjGQw1DHZggzt76',  // Contract 2
  'FZxmYkA6axyK3Njh3YNWXtybw9GgniVrXowS1pAAyrD1', // Contract 3
  '5ynYfAM7KZZXwT4dd2cZQnYhFNy1LUysE8m7Lxzjzh2p', // Contract 4
  'DHBDPUkLLYCRAiyrgFBgvWfevquFkLR1TjGXKD4M4JPD', // Contract 5
  'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ', // Master Controller
  'EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6', // Treasury
  '4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a', // Target Wallet
  '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y', // Relayer
  '9HUvuQHBHkihcrhiucdYFjk1q4jUgozakoYsubYrHiJS', // Secondary Wallet
  'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp', // Analysis Target
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter
  'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo', // Meteora
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
];

export const PROGRAM_IDS = {
  TOKEN_PROGRAM: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  ASSOCIATED_TOKEN_PROGRAM: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  METADATA_PROGRAM: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  STAKE_PROGRAM: 'Stake11111111111111111111111111111111111111',
  JUPITER_PROGRAM: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
  METEORA_PROGRAM: 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
  RAYDIUM_PROGRAM: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'
};