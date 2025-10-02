const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, MINT_SIZE } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');

async function heliusLiveDeploy() {
  console.log('🌟 HELIUS LIVE DEPLOYMENT');
  console.log('⚡ Using working Helius RPC endpoint');
  
  // Use public Helius endpoint (no API key required)
  const connection = new Connection('https://mainnet.helius-rpc.com/', 'confirmed');
  
  // Load deployer key
  const deployerKeyPath = '.deployer.key';
  const privateKeyString = fs.readFileSync(deployerKeyPath, 'utf8').trim();
  const privateKeyBytes = bs58.decode(privateKeyString);
  const deployer = Keypair.fromSecretKey(privateKeyBytes);
  
  console.log('🔑 Deployer:', deployer.publicKey.toBase58());
  
  try {
    // Test connection first
    const latestBlockhash = await connection.getLatestBlockhash();
    console.log('✅ Helius RPC connected, latest blockhash:', latestBlockhash.blockhash.substring(0, 8) + '...');
    
    // Check balance
    const balance = await connection.getBalance(deployer.publicKey);
    console.log('💰 Balance:', balance / 1e9, 'SOL');
    
    if (balance < 0.01 * 1e9) {
      console.log('❌ Insufficient SOL for deployment');
      
      // Generate address for reference
      const mintKeypair = Keypair.generate();
      console.log('🪙 Generated Address:', mintKeypair.publicKey.toBase58());
      
      return {
        status: 'INSUFFICIENT_FUNDS',
        mintAddress: mintKeypair.publicKey.toBase58(),
        balance: balance / 1e9,
        rpc: 'helius-working'
      };
    }
    
    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    
    console.log('🪙 DEPLOYING MINT:', mint.toBase58());
    console.log('🔗 Explorer:', `https://explorer.solana.com/address/${mint.toBase58()}`);
    
    // Create mint transaction
    const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
    
    const createMintTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: deployer.publicKey,
        newAccountPubkey: mint,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint,
        9,
        deployer.publicKey,
        deployer.publicKey
      )
    );
    
    // Send transaction
    const mintTxSignature = await connection.sendTransaction(createMintTx, [deployer, mintKeypair]);
    console.log('⏳ Confirming mint creation...');
    await connection.confirmTransaction(mintTxSignature, 'confirmed');
    
    console.log('✅ MINT CREATED ON MAINNET!');
    console.log('📝 Create TX:', mintTxSignature);
    console.log('🔗 TX Explorer:', `https://explorer.solana.com/tx/${mintTxSignature}`);
    
    // Create treasury ATA and mint tokens
    const treasuryPubkey = deployer.publicKey;
    const treasuryAta = await getAssociatedTokenAddress(mint, treasuryPubkey);
    
    const mintToTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        deployer.publicKey,
        treasuryAta,
        treasuryPubkey,
        mint
      ),
      createMintToInstruction(
        mint,
        treasuryAta,
        deployer.publicKey,
        BigInt(1_000_000_000) * BigInt(10 ** 9)
      )
    );
    
    const mintToSignature = await connection.sendTransaction(mintToTx, [deployer]);
    console.log('⏳ Confirming token mint...');
    await connection.confirmTransaction(mintToSignature, 'confirmed');
    
    console.log('✅ TOKENS MINTED ON MAINNET!');
    console.log('📝 Mint TX:', mintToSignature);
    console.log('🔗 TX Explorer:', `https://explorer.solana.com/tx/${mintToSignature}`);
    
    // Save live deployment
    const liveDeployment = {
      timestamp: new Date().toISOString(),
      status: 'LIVE_MAINNET_DEPLOYED',
      mintAddress: mint.toBase58(),
      deployerAddress: deployer.publicKey.toBase58(),
      treasuryAta: treasuryAta.toBase58(),
      createMintTx: mintTxSignature,
      mintTokensTx: mintToSignature,
      totalSupply: '1000000000',
      rpc: 'helius-mainnet',
      network: 'mainnet-beta'
    };
    
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/helius-live-deployment.json', JSON.stringify(liveDeployment, null, 2));
    
    console.log('🎉 LIVE MAINNET DEPLOYMENT COMPLETE!');
    console.log('📊 REAL CONTRACT DATA:');
    console.log(`   🪙 MINT: ${mint.toBase58()}`);
    console.log(`   🏦 TREASURY: ${treasuryAta.toBase58()}`);
    console.log(`   📝 CREATE TX: ${mintTxSignature}`);
    console.log(`   📝 MINT TX: ${mintToSignature}`);
    console.log(`   🌟 RPC: Helius Mainnet`);
    console.log('🌐 NETWORK: Solana Mainnet-Beta LIVE');
    
    return liveDeployment;
    
  } catch (error) {
    console.error('❌ HELIUS LIVE DEPLOYMENT FAILED:', error.message);
    throw error;
  }
}

heliusLiveDeploy().catch(console.error);