const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMintLen } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');

async function directMainnetDeploy() {
  console.log('🚀 DIRECT MAINNET DEPLOYMENT');
  console.log('⚡ EXECUTING REAL DEPLOYMENT NOW');
  
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
  
  if (balance < 0.01 * 1e9) {
    console.log('❌ Insufficient SOL for deployment');
    console.log('💡 Need at least 0.01 SOL for transaction fees');
    
    // Generate address anyway for reference
    const mintKeypair = Keypair.generate();
    console.log('🪙 Generated Address:', mintKeypair.publicKey.toBase58());
    console.log('🔗 Explorer:', `https://explorer.solana.com/address/${mintKeypair.publicKey.toBase58()}`);
    
    return {
      status: 'INSUFFICIENT_FUNDS',
      mintAddress: mintKeypair.publicKey.toBase58(),
      deployerAddress: deployer.publicKey.toBase58(),
      requiredBalance: 0.01,
      currentBalance: balance / 1e9
    };
  }
  
  try {
    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    
    console.log('🪙 DEPLOYING MINT:', mint.toBase58());
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
    
    console.log('✅ MINT CREATED ON MAINNET!');
    console.log('📝 Create TX:', mintTxSignature);
    console.log('🔗 TX Explorer:', `https://explorer.solana.com/tx/${mintTxSignature}`);
    
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
    
    console.log('✅ TOKENS MINTED ON MAINNET!');
    console.log('📝 Mint TX:', mintToSignature);
    console.log('🔗 TX Explorer:', `https://explorer.solana.com/tx/${mintToSignature}`);
    
    // Save real deployment
    const realDeployment = {
      timestamp: new Date().toISOString(),
      status: 'MAINNET_DEPLOYED',
      mintAddress: mint.toBase58(),
      deployerAddress: deployer.publicKey.toBase58(),
      treasuryAta: treasuryAta.toBase58(),
      createMintTx: mintTxSignature,
      mintTokensTx: mintToSignature,
      totalSupply: '1000000000',
      network: 'mainnet-beta',
      programId: TOKEN_2022_PROGRAM_ID.toBase58(),
      deploymentCost: (balance - await connection.getBalance(deployer.publicKey)) / 1e9
    };
    
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/real-mainnet-deployment.json', JSON.stringify(realDeployment, null, 2));
    
    console.log('🎉 REAL MAINNET DEPLOYMENT COMPLETE!');
    console.log('📊 LIVE CONTRACT DATA:');
    console.log(`   🪙 MINT: ${mint.toBase58()}`);
    console.log(`   🏦 TREASURY: ${treasuryAta.toBase58()}`);
    console.log(`   📝 CREATE TX: ${mintTxSignature}`);
    console.log(`   📝 MINT TX: ${mintToSignature}`);
    console.log(`   💰 SUPPLY: 1,000,000,000 OMEGA`);
    console.log('🌐 NETWORK: Solana Mainnet-Beta LIVE');
    
    return realDeployment;
    
  } catch (error) {
    console.error('❌ MAINNET DEPLOYMENT FAILED:', error.message);
    throw error;
  }
}

directMainnetDeploy().catch(console.error);