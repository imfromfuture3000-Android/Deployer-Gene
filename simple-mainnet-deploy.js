const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMintLen, ExtensionType } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function simpleMainnetDeploy() {
  console.log('🚀 SIMPLE MAINNET DEPLOYMENT');
  console.log('⚡ OMEGA TOKEN - LIVE CREATION');
  
  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  
  // Load deployer key
  const deployerKeyPath = path.join(process.cwd(), '.deployer.key');
  const privateKeyString = fs.readFileSync(deployerKeyPath, 'utf8').trim();
  const privateKeyBytes = bs58.decode(privateKeyString);
  const deployer = Keypair.fromSecretKey(privateKeyBytes);
  
  console.log('🔑 Deployer:', deployer.publicKey.toBase58());
  
  // Check balance
  const balance = await connection.getBalance(deployer.publicKey);
  console.log('💰 Balance:', balance / 1e9, 'SOL');
  
  if (balance < 0.01 * 1e9) {
    console.error('❌ Insufficient SOL balance for deployment');
    return;
  }
  
  try {
    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    
    console.log('🪙 Mint Address:', mint.toBase58());
    console.log('🔗 Explorer:', `https://explorer.solana.com/address/${mint.toBase58()}`);
    
    // Get rent for mint account
    const mintLen = getMintLen([]);
    const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);
    
    // Create mint account transaction
    const createMintTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: deployer.publicKey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports: mintRent,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint,
        9, // decimals
        deployer.publicKey, // mint authority
        deployer.publicKey, // freeze authority
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    // Send mint creation transaction
    const mintTxSignature = await connection.sendTransaction(createMintTx, [deployer, mintKeypair]);
    await connection.confirmTransaction(mintTxSignature, 'confirmed');
    
    console.log('✅ MINT CREATED!');
    console.log('📝 Transaction:', mintTxSignature);
    console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${mintTxSignature}`);
    
    // Create treasury ATA
    const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY || deployer.publicKey.toBase58());
    const treasuryAta = await getAssociatedTokenAddress(mint, treasuryPubkey, false, TOKEN_2022_PROGRAM_ID);
    
    // Create ATA and mint tokens
    const mintToTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        deployer.publicKey,
        treasuryAta,
        treasuryPubkey,
        mint,
        TOKEN_2022_PROGRAM_ID
      ),
      createMintToInstruction(
        mint,
        treasuryAta,
        deployer.publicKey,
        BigInt(1_000_000_000) * BigInt(10 ** 9), // 1B tokens
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    const mintToSignature = await connection.sendTransaction(mintToTx, [deployer]);
    await connection.confirmTransaction(mintToSignature, 'confirmed');
    
    console.log('✅ TOKENS MINTED!');
    console.log('📝 Transaction:', mintToSignature);
    console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${mintToSignature}`);
    console.log('💰 Amount: 1,000,000,000 OMEGA');
    
    // Save deployment data
    const deploymentData = {
      timestamp: new Date().toISOString(),
      mintAddress: mint.toBase58(),
      deployerAddress: deployer.publicKey.toBase58(),
      treasuryAta: treasuryAta.toBase58(),
      createMintTx: mintTxSignature,
      mintTokensTx: mintToSignature,
      totalSupply: '1000000000',
      network: 'mainnet-beta',
      programId: TOKEN_2022_PROGRAM_ID.toBase58()
    };
    
    const cacheDir = path.join(process.cwd(), '.cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(cacheDir, 'live-deployment.json'),
      JSON.stringify(deploymentData, null, 2)
    );
    
    console.log('🎉 DEPLOYMENT COMPLETE!');
    console.log('📊 LIVE CONTRACT DATA:');
    console.log(`   🪙 Mint: ${mint.toBase58()}`);
    console.log(`   💰 Supply: 1,000,000,000 OMEGA`);
    console.log(`   🏦 Treasury: ${treasuryAta.toBase58()}`);
    console.log(`   📝 Create TX: ${mintTxSignature}`);
    console.log(`   📝 Mint TX: ${mintToSignature}`);
    console.log('🌐 Network: Solana Mainnet-Beta');
    
    return deploymentData;
    
  } catch (error) {
    console.error('❌ DEPLOYMENT FAILED:', error.message);
    throw error;
  }
}

simpleMainnetDeploy().catch(console.error);