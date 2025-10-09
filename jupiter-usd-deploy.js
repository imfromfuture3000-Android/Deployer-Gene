#!/usr/bin/env node

const { Connection, PublicKey, Transaction, Keypair } = require('@solana/web3.js');
const { createMint, createAssociatedTokenAccount, mintTo } = require('@solana/spl-token');
require('dotenv').config();

const JUPITER_PROGRAM = new PublicKey('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4');
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

async function deployJupiterUSD() {
  console.log('🚀 JUPITER USD DEPLOYMENT - RELAYER MODE');
  
  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');
  const deployer = Keypair.generate();
  
  // Create mint with Jupiter compatibility
  const mint = await createMint(
    connection,
    deployer,
    deployer.publicKey,
    null,
    6 // USDC decimals
  );
  
  console.log('✅ Mint Created:', mint.toBase58());
  console.log('🔗 Jupiter URL: https://jup.ag/swap/USDC-' + mint.toBase58());
  
  return {
    mint: mint.toBase58(),
    deployer: deployer.publicKey.toBase58(),
    jupiterUrl: `https://jup.ag/swap/USDC-${mint.toBase58()}`,
    status: 'READY_FOR_RELAYER'
  };
}

if (require.main === module) {
  deployJupiterUSD().catch(console.error);
}

module.exports = { deployJupiterUSD };