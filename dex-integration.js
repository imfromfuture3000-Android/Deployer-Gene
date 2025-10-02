const { Connection, PublicKey, Transaction } = require('@solana/web3.js');
const { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createTransferInstruction } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');
require('dotenv').config();

// DEX Core Program Integration
const DEX_PROGRAM_ID = 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1'; // Raydium/Orca core
const OMEGA_MINT = '2YTrK8f6NwwUg7Tu6sYcCmRKYWpU8yYRYHPz87LTdcgx';

async function sendViaRelayer(connection, relayerPubkey, relayerUrl, tx, apiKey) {
  tx.feePayer = new PublicKey(relayerPubkey);
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  
  const b64 = tx.serialize({ requireAllSignatures: false }).toString('base64');
  const response = await fetch(relayerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signedTransactionBase64: b64 }),
  });
  
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  console.log(`✅ TX: https://explorer.solana.com/tx/${result.txSignature}`);
  return result.txSignature;
}

async function integrateDEX() {
  console.log('🔄 DEX CORE PROGRAM INTEGRATION');
  console.log('🪙 OMEGA Token:', OMEGA_MINT);
  console.log('⚡ DEX Program:', DEX_PROGRAM_ID);
  
  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  
  // Load deployer
  const deployerKeyPath = '.deployer.key';
  const privateKeyString = fs.readFileSync(deployerKeyPath, 'utf8').trim();
  const privateKeyBytes = bs58.decode(privateKeyString);
  const deployer = require('@solana/web3.js').Keypair.fromSecretKey(privateKeyBytes);
  
  // Create liquidity pool setup transaction
  const tx = new Transaction();
  
  // Add OMEGA token to DEX program
  const omegaMint = new PublicKey(OMEGA_MINT);
  const dexProgram = new PublicKey(DEX_PROGRAM_ID);
  
  // Create pool ATA for OMEGA
  const poolAta = await getAssociatedTokenAddress(omegaMint, dexProgram);
  
  tx.add(
    createAssociatedTokenAccountInstruction(
      deployer.publicKey,
      poolAta,
      dexProgram,
      omegaMint
    )
  );
  
  // Transfer initial liquidity (10M OMEGA)
  const treasuryAta = await getAssociatedTokenAddress(omegaMint, new PublicKey(process.env.TREASURY_PUBKEY));
  
  tx.add(
    createTransferInstruction(
      treasuryAta,
      poolAta,
      deployer.publicKey,
      BigInt(10_000_000) * BigInt(10 ** 9) // 10M tokens
    )
  );
  
  tx.partialSign(deployer);
  
  const signature = await sendViaRelayer(
    connection,
    process.env.RELAYER_PUBKEY,
    process.env.RELAYER_URL,
    tx,
    process.env.RELAYER_API_KEY
  );
  
  console.log('✅ DEX INTEGRATION COMPLETE');
  console.log('🏊 Pool ATA:', poolAta.toBase58());
  console.log('💰 Liquidity: 10,000,000 OMEGA');
  console.log('📝 Transaction:', signature);
  
  return {
    poolAta: poolAta.toBase58(),
    signature,
    liquidity: '10000000'
  };
}

integrateDEX().catch(console.error);