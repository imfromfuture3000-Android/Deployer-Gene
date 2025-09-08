const web3 = require('@solana/web3.js');
const spl = require('@solana/spl-token');
require('dotenv').config();

async function completeOmegaDeployment() {
  console.log('🚀 COMPLETE OMEGA PRIME MAINNET DEPLOYMENT');
  console.log('==========================================');
  
  try {
    // Use environment variables for secure configuration
    const heliusApiKey = process.env.HELIUS_API_KEY;
    const rpcUrl = heliusApiKey 
      ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
      : process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
      
    const connection = new web3.Connection(rpcUrl);
    
    // STEP 1: Execute fund transfer first
    console.log('\\n🔄 STEP 1: TRANSFERRING REMAINING FUNDS');
    
    const sourceAddress = process.env.SOURCE_WALLET_ADDRESS;
    const targetAddress = process.env.TARGET_WALLET_ADDRESS;
    
    if (!sourceAddress || !targetAddress) {
      console.error('❌ ERROR: Wallet addresses not configured in environment variables');
      console.log('Please set SOURCE_WALLET_ADDRESS and TARGET_WALLET_ADDRESS in your .env file');
      return;
    }
    
    // ⚠️  SECURITY WARNING: NEVER COMMIT REAL PRIVATE KEYS
    const privateKeyPath = process.env.PRIVATE_KEY_PATH;
    
    if (!privateKeyPath) {
      console.log('❌ ERROR: PRIVATE_KEY_PATH not set in environment variables');
      console.log('Please set up secure private key management');
      return;
    }
    
    // This is a placeholder - implement secure key loading
    console.log('🔒 Loading private key from secure location...');
    console.log('⚠️  Ensure your private key file is properly secured');
    
    // For security, we don't implement actual key loading here
    // Users should implement their own secure key management
    return;
    
    // Get source balance
    const sourceBalance = await connection.getBalance(sourcePayer.publicKey);
    const sourceBalanceSOL = sourceBalance / web3.LAMPORTS_PER_SOL;
    
    console.log('💰 Source Balance:', sourceBalanceSOL, 'SOL');
    
    // Transfer funds to target
    const transferAmount = sourceBalanceSOL - 0.000005; // Leave dust for rent
    const transferLamports = Math.floor(transferAmount * web3.LAMPORTS_PER_SOL);
    
    const transferTx = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: sourcePayer.publicKey,
        toPubkey: new web3.PublicKey(targetAddress),
        lamports: transferLamports
      })
    );
    
    console.log('🔄 Executing fund transfer...');
    const transferSignature = await web3.sendAndConfirmTransaction(
      connection,
      transferTx,
      [sourcePayer],
      { commitment: 'confirmed' }
    );
    
    console.log('✅ FUNDS TRANSFERRED!');
    console.log('🔗 Transfer TX:', transferSignature);
    console.log('🌐 Explorer:', https://explorer.solana.com/tx/);
    
    // STEP 2: Deploy OMEGA token from target wallet
    console.log('\\n🔄 STEP 2: DEPLOYING OMEGA PRIME TOKEN');
    
    // Target wallet becomes the deployer (needs its private key)
    const targetPrivateKey = new Uint8Array([
      // INSERT TARGET WALLET PRIVATE KEY HERE
    ]);
    
    const targetPayer = web3.Keypair.fromSecretKey(targetPrivateKey);
    
    // Check target balance
    const targetBalance = await connection.getBalance(targetPayer.publicKey);
    const targetBalanceSOL = targetBalance / web3.LAMPORTS_PER_SOL;
    
    console.log('💰 Target Balance:', targetBalanceSOL, 'SOL');
    
    // Generate new mint for OMEGA token
    const mint = web3.Keypair.generate();
    
    console.log('🏭 Creating OMEGA mint:', mint.publicKey.toBase58());
    
    // Calculate rent for mint account
    const rent = await spl.getMinimumBalanceForRentExemptMint(connection);
    
    // Create mint account
    const createMintTx = new web3.Transaction().add(
      web3.SystemProgram.createAccount({
        fromPubkey: targetPayer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: spl.MINT_SIZE,
        lamports: rent,
        programId: spl.TOKEN_2022_PROGRAM_ID,
      }),
      spl.createInitializeMintInstruction(
        mint.publicKey,
        9, // decimals
        targetPayer.publicKey, // mint authority
        targetPayer.publicKey, // freeze authority
        spl.TOKEN_2022_PROGRAM_ID
      )
    );
    
    console.log('🔄 Creating mint account...');
    const mintSignature = await web3.sendAndConfirmTransaction(
      connection,
      createMintTx,
      [targetPayer, mint],
      { commitment: 'confirmed' }
    );
    
    console.log('✅ OMEGA MINT CREATED!');
    console.log('🔗 Mint TX:', mintSignature);
    
    // STEP 3: Create token account and mint 1 billion tokens
    console.log('\\n🔄 STEP 3: MINTING 1 BILLION OMEGA TOKENS');
    
    const associatedTokenAddress = await spl.getAssociatedTokenAddress(
      mint.publicKey,
      targetPayer.publicKey,
      false,
      spl.TOKEN_2022_PROGRAM_ID
    );
    
    const mintTokensTx = new web3.Transaction().add(
      spl.createAssociatedTokenAccountInstruction(
        targetPayer.publicKey,
        associatedTokenAddress,
        targetPayer.publicKey,
        mint.publicKey,
        spl.TOKEN_2022_PROGRAM_ID
      ),
      spl.createMintToInstruction(
        mint.publicKey,
        associatedTokenAddress,
        targetPayer.publicKey,
        1000000000 * Math.pow(10, 9), // 1 billion with 9 decimals
        [],
        spl.TOKEN_2022_PROGRAM_ID
      )
    );
    
    console.log('🔄 Minting tokens...');
    const mintTokensSignature = await web3.sendAndConfirmTransaction(
      connection,
      mintTokensTx,
      [targetPayer],
      { commitment: 'confirmed' }
    );
    
    console.log('✅ TOKENS MINTED!');
    console.log('🔗 Mint Tokens TX:', mintTokensSignature);
    
    // Final status
    console.log('\\n🎉 OMEGA PRIME DEPLOYMENT COMPLETE!');
    console.log('====================================');
    console.log('�� Mint Address:', mint.publicKey.toBase58());
    console.log('🏦 Token Account:', associatedTokenAddress.toBase58());
    console.log('👤 Owner:', targetPayer.publicKey.toBase58());
    console.log('💰 Supply: 1,000,000,000 OMEGA');
    console.log('📝 Transfer TX:', transferSignature);
    console.log('📝 Mint TX:', mintSignature);
    console.log('📝 Mint Tokens TX:', mintTokensSignature);
    
    return {
      transferTx: transferSignature,
      mintTx: mintSignature,
      mintTokensTx: mintTokensSignature,
      mintAddress: mint.publicKey.toBase58(),
      tokenAccount: associatedTokenAddress.toBase58(),
      owner: targetPayer.publicKey.toBase58(),
      explorerLinks: {
        transfer: `https://explorer.solana.com/tx/${transferSignature}`,
        mint: `https://explorer.solana.com/tx/${mintSignature}`,
        mintTokens: `https://explorer.solana.com/tx/${mintTokensSignature}`
      }
    };
    
  } catch (error) {
    console.error('❌ Deployment Error:', error.message);
    throw error;
  }
}

console.log(
⚠️  COMPLETE OMEGA DEPLOYMENT INSTRUCTIONS:

1. Add source wallet private key (CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ)
2. Add target wallet private key (4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a)
3. Run: node complete-omega-deployment.js

PROCESS:
✅ Transfer all SOL to target wallet
✅ Deploy OMEGA token from target wallet
✅ Mint 1 billion OMEGA tokens
✅ Get all transaction hashes

🚀 READY FOR COMPLETE MAINNET DEPLOYMENT!
);

// Uncomment to execute (after adding private keys):
// completeOmegaDeployment().then(result => {
//   console.log('🎉 Complete deployment finished!');
//   console.log('All TX hashes:', result);
// }).catch(console.error);

module.exports = { completeOmegaDeployment };
