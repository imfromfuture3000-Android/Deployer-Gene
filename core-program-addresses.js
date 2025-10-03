#!/usr/bin/env node
/**
 * Core Solana Program Addresses
 */

const CORE_PROGRAMS = {
  STAKE_PROGRAM: 'Stake11111111111111111111111111111111111111',
  TOKEN_PROGRAM: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  ASSOCIATED_TOKEN: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  METADATA_PROGRAM: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  JUPITER_PROGRAM: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'
};

console.log('🔗 CORE SOLANA PROGRAM ADDRESSES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

Object.entries(CORE_PROGRAMS).forEach(([name, address]) => {
  console.log(`✅ ${name}: ${address}`);
});

module.exports = { CORE_PROGRAMS };