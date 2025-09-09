import { Connection, PublicKey, Transaction, Keypair, SystemProgram } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { sendViaRelayer } from './utils/relayer';
import { loadOrCreateUserAuth } from './utils/wallet';
import { findAssociatedTokenAddress } from './utils/pdas';

dotenv.config();

async function withdrawEarnings() {
  console.log('💰 OMEGA PRIME - WITHDRAW EARNINGS');
  console.log('===================================');
  
  // Check required environment variables
  if (!process.env.RPC_URL) {
    console.error('❌ RPC_URL not configured');
    process.exit(1);
  }
  
  if (!process.env.RELAYER_PUBKEY) {
    console.error('❌ RELAYER_PUBKEY not configured');
    process.exit(1);
  }
  
  if (!process.env.TARGET_WALLET_ADDRESS) {
    console.error('❌ TARGET_WALLET_ADDRESS not configured');
    process.exit(1);
  }
  
  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  const userAuth = loadOrCreateUserAuth();
  const relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY);
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY || '4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a');
  const targetPubkey = new PublicKey(process.env.TARGET_WALLET_ADDRESS);
  const cacheDir = path.join(process.cwd(), '.cache');
  const mintCachePath = path.join(cacheDir, 'mint.json');
  
  if (!fs.existsSync(mintCachePath)) {
    console.error('❌ Mint not found. Run createMint.ts first.');
    process.exit(1);
  }

  try {
    const mintData = JSON.parse(fs.readFileSync(mintCachePath, 'utf-8'));
    const mint = new PublicKey(mintData.mint);
    
    console.log('📍 Treasury:', treasuryPubkey.toBase58());
    console.log('🎯 Target:', targetPubkey.toBase58());
    console.log('🪙 Token:', mint.toBase58());
    
    // In DRY_RUN mode, simulate the process without making RPC calls
    if (process.env.DRY_RUN === 'true') {
      console.log('🏃 DRY RUN MODE - Simulating withdrawal process');
      console.log('💎 Simulated Treasury Token Balance: 1000.0 OMEGA');
      console.log('💰 Simulated Treasury SOL Balance: 0.1 SOL');
      console.log('📤 Simulated Withdrawable SOL: 0.097 SOL');
      console.log('📤 Would transfer all tokens to target wallet');
      console.log('💸 Would transfer SOL to target wallet');
      console.log('🏃 DRY RUN - Transaction prepared but not executed');
      console.log('✅ Withdrawal simulation completed successfully');
      return;
    }
    
    // Check treasury token balance
    const treasuryAta = findAssociatedTokenAddress(treasuryPubkey, mint);
    const treasuryTokenBalance = await connection.getTokenAccountBalance(treasuryAta);
    
    if (!treasuryTokenBalance.value || BigInt(treasuryTokenBalance.value.amount) === BigInt(0)) {
      console.log('ℹ️  No token earnings to withdraw');
      return;
    }
    
    console.log('💎 Treasury Token Balance:', treasuryTokenBalance.value.uiAmountString, 'OMEGA');
    
    // Check treasury SOL balance
    const treasurySolBalance = await connection.getBalance(treasuryPubkey);
    const treasurySolBalanceSOL = treasurySolBalance / 1e9;
    const minRentExempt = 0.00203928; // Minimum SOL to keep account active
    const withdrawableSol = Math.max(0, treasurySolBalanceSOL - minRentExempt);
    
    console.log('💰 Treasury SOL Balance:', treasurySolBalanceSOL.toFixed(6), 'SOL');
    console.log('📤 Withdrawable SOL:', withdrawableSol.toFixed(6), 'SOL');
    
    if (BigInt(treasuryTokenBalance.value.amount) === BigInt(0) && withdrawableSol <= 0) {
      console.log('ℹ️  No earnings to withdraw');
      return;
    }
    
    const tx = new Transaction();
    
    // Withdraw tokens if available
    if (BigInt(treasuryTokenBalance.value.amount) > BigInt(0)) {
      const targetAta = findAssociatedTokenAddress(targetPubkey, mint);
      
      // Check if target ATA exists, create if not
      const targetAtaInfo = await connection.getAccountInfo(targetAta);
      if (!targetAtaInfo) {
        const ata = await getOrCreateAssociatedTokenAccount(
          connection,
          userAuth,
          mint,
          targetPubkey,
          false,
          'confirmed',
          { commitment: 'confirmed' },
          TOKEN_2022_PROGRAM_ID
        );
        if ((ata as any).instruction) {
          tx.add((ata as any).instruction);
        }
      }
      
      // Transfer all tokens from treasury to target
      tx.add(
        createTransferInstruction(
          treasuryAta,
          targetAta,
          treasuryPubkey,
          BigInt(treasuryTokenBalance.value.amount),
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      console.log('📤 Adding token transfer to transaction');
    }
    
    // Withdraw SOL if available
    if (withdrawableSol > 0) {
      const withdrawLamports = Math.floor(withdrawableSol * 1e9);
      
      tx.add(
        SystemProgram.transfer({
          fromPubkey: treasuryPubkey,
          toPubkey: targetPubkey,
          lamports: withdrawLamports
        })
      );
      
      console.log('💸 Adding SOL transfer to transaction');
    }
    
    if (tx.instructions.length === 0) {
      console.log('ℹ️  No transfers to execute');
      return;
    }
    
    // Sign and send transaction
    tx.feePayer = userAuth.publicKey;
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.partialSign(userAuth);
    
    console.log('📡 Sending withdrawal transaction...');
    
    const signature = await sendViaRelayer(
      connection, 
      relayerPubkey.toBase58(), 
      process.env.RELAYER_URL!, 
      tx, 
      process.env.RELAYER_API_KEY
    );
    
    if (signature !== 'DRY_RUN_SIGNATURE') {
      console.log('✅ WITHDRAWAL SUCCESSFUL!');
      console.log('🔗 Transaction:', `https://explorer.solana.com/tx/${signature}`);
      
      // Check final balances
      if (BigInt(treasuryTokenBalance.value.amount) > BigInt(0)) {
        const newTargetTokenBalance = await connection.getTokenAccountBalance(
          findAssociatedTokenAddress(targetPubkey, mint)
        );
        console.log('🎯 Target Token Balance:', newTargetTokenBalance.value.uiAmountString, 'OMEGA');
      }
      
      if (withdrawableSol > 0) {
        const newTargetSolBalance = await connection.getBalance(targetPubkey);
        console.log('🎯 Target SOL Balance:', (newTargetSolBalance / 1e9).toFixed(6), 'SOL');
      }
    } else {
      console.log('🏃 DRY RUN - Transaction prepared but not executed');
    }
    
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Withdrawal failed:', errMsg);
    process.exit(1);
  }
}

withdrawEarnings().catch((e) => {
  console.error(`Withdraw earnings failed: ${e.message}`);
  process.exit(1);
});