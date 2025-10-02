const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMintLen } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');
require('dotenv').config();

async function deployMainnetNow() {
  console.log('🚀 DEPLOYING MAINNET NOW');
  console.log('⚡ LIVE DEPLOYMENT INITIATED');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Load deployer key
  const deployerKeyPath = '.deployer.key';
  const privateKeyString = fs.readFileSync(deployerKeyPath, 'utf8').trim();
  const privateKeyBytes = bs58.decode(privateKeyString);
  const deployer = Keypair.fromSecretKey(privateKeyBytes);
  
  console.log('🔑 Deployer:', deployer.publicKey.toBase58());
  
  // Check balance
  const balance = await connection.getBalance(deployer.publicKey);
  console.log('💰 Balance:', balance / 1e9, 'SOL');
  
  if (balance === 0) {
    console.log('❌ CRITICAL: 0 SOL balance - cannot deploy');
    console.log('💡 SOLUTION: Fund deployer with SOL or use relayer');
    
    // Attempt relayer deployment
    return await attemptRelayerDeploy(connection, deployer);
  }
  
  try {
    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    
    console.log('🪙 LIVE MINT ADDRESS:', mint.toBase58());
    console.log('🔗 Explorer:', `https://explorer.solana.com/address/${mint.toBase58()}`);
    
    // Create mint
    const mintLen = getMintLen([]);
    const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);
    
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
        9,
        deployer.publicKey,
        deployer.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    const mintTxSignature = await connection.sendTransaction(createMintTx, [deployer, mintKeypair]);
    console.log('⏳ Confirming mint creation...');
    await connection.confirmTransaction(mintTxSignature, 'confirmed');
    
    console.log('✅ MINT CREATED LIVE!');
    console.log('📝 TX:', mintTxSignature);
    console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${mintTxSignature}`);
    
    // Create treasury ATA and mint tokens
    const treasuryPubkey = deployer.publicKey;
    const treasuryAta = await getAssociatedTokenAddress(mint, treasuryPubkey, false, TOKEN_2022_PROGRAM_ID);
    
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
        BigInt(1_000_000_000) * BigInt(10 ** 9),
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    const mintToSignature = await connection.sendTransaction(mintToTx, [deployer]);
    console.log('⏳ Confirming token mint...');
    await connection.confirmTransaction(mintToSignature, 'confirmed');
    
    console.log('✅ TOKENS MINTED LIVE!');
    console.log('📝 TX:', mintToSignature);
    console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${mintToSignature}`);
    
    // Save live deployment
    const liveDeployment = {
      timestamp: new Date().toISOString(),
      status: 'LIVE_DEPLOYED',
      mintAddress: mint.toBase58(),
      deployerAddress: deployer.publicKey.toBase58(),
      treasuryAta: treasuryAta.toBase58(),
      createMintTx: mintTxSignature,
      mintTokensTx: mintToSignature,
      totalSupply: '1000000000',
      network: 'mainnet-beta',
      programId: TOKEN_2022_PROGRAM_ID.toBase58()
    };
    
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/live-mainnet-deployment.json', JSON.stringify(liveDeployment, null, 2));
    
    console.log('🎉 LIVE MAINNET DEPLOYMENT COMPLETE!');
    console.log('📊 LIVE CONTRACT DATA:');
    console.log(`   🪙 MINT: ${mint.toBase58()}`);
    console.log(`   💰 SUPPLY: 1,000,000,000 OMEGA`);
    console.log(`   🏦 TREASURY: ${treasuryAta.toBase58()}`);
    console.log(`   📝 CREATE TX: ${mintTxSignature}`);
    console.log(`   📝 MINT TX: ${mintToSignature}`);
    console.log('🌐 NETWORK: Solana Mainnet-Beta LIVE');
    
    return liveDeployment;
    
  } catch (error) {
    console.error('❌ LIVE DEPLOYMENT FAILED:', error.message);
    throw error;
  }
}

async function attemptRelayerDeploy(connection, deployer) {
  console.log('🔄 ATTEMPTING RELAYER DEPLOYMENT');
  console.log('⚡ Zero-cost deployment via relayer');
  
  // This would use actual relayer service
  console.log('❌ Relayer deployment requires proper configuration');
  console.log('💡 Configure RELAYER_URL and RELAYER_PUBKEY in .env');
  
  return {
    status: 'RELAYER_NEEDED',
    message: 'Deployment requires SOL funding or working relayer',
    deployer: deployer.publicKey.toBase58(),
    balance: 0
  };
}

deployMainnetNow().catch(console.error);