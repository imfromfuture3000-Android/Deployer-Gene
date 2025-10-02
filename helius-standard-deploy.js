const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMintLen } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');
require('dotenv').config();

async function heliusStandardDeploy() {
  console.log('🌟 HELIUS STANDARD DEPLOYMENT');
  console.log('🚫 No tips - Standard RPC deployment');
  
  // Use public Helius RPC (no API key required for basic usage)
  const connection = new Connection('https://mainnet.helius-rpc.com', 'confirmed');
  
  // Load deployer key
  const deployerKeyPath = '.deployer.key';
  const privateKeyString = fs.readFileSync(deployerKeyPath, 'utf8').trim();
  const privateKeyBytes = bs58.decode(privateKeyString);
  const deployer = Keypair.fromSecretKey(privateKeyBytes);
  
  console.log('🔑 Deployer:', deployer.publicKey.toBase58());
  console.log('🌟 RPC: Helius Enhanced RPC');
  
  // Check balance
  const balance = await connection.getBalance(deployer.publicKey);
  console.log('💰 Balance:', balance / 1e9, 'SOL');
  
  if (balance < 0.01 * 1e9) {
    console.log('❌ Insufficient SOL for deployment');
    console.log('💡 Need at least 0.01 SOL for transaction fees');
    
    // Generate address for reference
    const mintKeypair = Keypair.generate();
    console.log('🪙 Generated Address:', mintKeypair.publicKey.toBase58());
    
    return {
      status: 'INSUFFICIENT_FUNDS',
      mintAddress: mintKeypair.publicKey.toBase58(),
      rpc: 'helius'
    };
  }
  
  try {
    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    
    console.log('🪙 DEPLOYING MINT:', mint.toBase58());
    console.log('🔗 Explorer:', `https://explorer.solana.com/address/${mint.toBase58()}`);
    
    // Create mint transaction (NO TIPS)
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
    
    // Send via Helius RPC (standard deployment)
    const mintTxSignature = await connection.sendTransaction(createMintTx, [deployer, mintKeypair]);
    console.log('⏳ Confirming mint creation...');
    await connection.confirmTransaction(mintTxSignature, 'confirmed');
    
    console.log('✅ MINT CREATED VIA HELIUS!');
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
    
    console.log('✅ TOKENS MINTED VIA HELIUS!');
    console.log('📝 Mint TX:', mintToSignature);
    console.log('🔗 TX Explorer:', `https://explorer.solana.com/tx/${mintToSignature}`);
    
    // Save Helius deployment
    const heliusDeployment = {
      timestamp: new Date().toISOString(),
      status: 'HELIUS_DEPLOYED',
      mintAddress: mint.toBase58(),
      deployerAddress: deployer.publicKey.toBase58(),
      treasuryAta: treasuryAta.toBase58(),
      createMintTx: mintTxSignature,
      mintTokensTx: mintToSignature,
      totalSupply: '1000000000',
      rpc: 'helius-enhanced',
      tips: 'disabled',
      network: 'mainnet-beta',
      deploymentCost: 'standard_fees'
    };
    
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/helius-standard-deployment.json', JSON.stringify(heliusDeployment, null, 2));
    
    console.log('🎉 HELIUS DEPLOYMENT COMPLETE!');
    console.log('📊 LIVE CONTRACT DATA:');
    console.log(`   🪙 MINT: ${mint.toBase58()}`);
    console.log(`   🏦 TREASURY: ${treasuryAta.toBase58()}`);
    console.log(`   📝 CREATE TX: ${mintTxSignature}`);
    console.log(`   📝 MINT TX: ${mintToSignature}`);
    console.log(`   🌟 RPC: Helius Enhanced`);
    console.log(`   🚫 TIPS: Disabled`);
    console.log('🌐 NETWORK: Solana Mainnet-Beta');
    
    return heliusDeployment;
    
  } catch (error) {
    console.error('❌ HELIUS DEPLOYMENT FAILED:', error.message);
    throw error;
  }
}

heliusStandardDeploy().catch(console.error);