const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fullMainnetDeploy() {
  console.log('🚀 INITIATING FULL MAINNET DEPLOYMENT');
  console.log('⚡ OMEGA PRIME TOKEN - LIVE DEPLOYMENT');
  
  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  
  // Load deployer key
  const deployerKeyPath = path.join(process.cwd(), '.deployer.key');
  const privateKeyString = fs.readFileSync(deployerKeyPath, 'utf8').trim();
  const privateKeyBytes = bs58.decode(privateKeyString);
  const deployer = Keypair.fromSecretKey(privateKeyBytes);
  
  console.log('🔑 Deployer Address:', deployer.publicKey.toBase58());
  
  try {
    // Step 1: Create Mint
    console.log('📝 Creating OMEGA token mint...');
    const mint = await createMint(
      connection,
      deployer,
      deployer.publicKey,
      deployer.publicKey,
      9 // 9 decimals
    );
    
    console.log('✅ MINT CREATED:', mint.toBase58());
    console.log('🔗 Explorer:', `https://explorer.solana.com/address/${mint.toBase58()}`);
    
    // Step 2: Create Treasury ATA
    const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY || deployer.publicKey.toBase58());
    const treasuryAta = await getOrCreateAssociatedTokenAccount(
      connection,
      deployer,
      mint,
      treasuryPubkey
    );
    
    console.log('✅ TREASURY ATA:', treasuryAta.address.toBase58());
    
    // Step 3: Mint Initial Supply (1 billion tokens)
    const initialSupply = BigInt(1_000_000_000) * BigInt(10 ** 9);
    const mintTx = await mintTo(
      connection,
      deployer,
      mint,
      treasuryAta.address,
      deployer,
      initialSupply
    );
    
    console.log('✅ INITIAL MINT TX:', mintTx);
    console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${mintTx}`);
    console.log('💰 Minted: 1,000,000,000 OMEGA tokens');
    
    // Step 4: Set up earnings vault
    const earningsVault = new PublicKey('F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR');
    const vaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      deployer,
      mint,
      earningsVault
    );
    
    console.log('✅ EARNINGS VAULT ATA:', vaultAta.address.toBase58());
    
    // Step 5: Mint tokens to earnings vault (100M for distribution)
    const vaultSupply = BigInt(100_000_000) * BigInt(10 ** 9);
    const vaultMintTx = await mintTo(
      connection,
      deployer,
      mint,
      vaultAta.address,
      deployer,
      vaultSupply
    );
    
    console.log('✅ VAULT MINT TX:', vaultMintTx);
    console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${vaultMintTx}`);
    
    // Save deployment data
    const deploymentData = {
      timestamp: new Date().toISOString(),
      mintAddress: mint.toBase58(),
      deployerAddress: deployer.publicKey.toBase58(),
      treasuryAta: treasuryAta.address.toBase58(),
      earningsVaultAta: vaultAta.address.toBase58(),
      initialMintTx: mintTx,
      vaultMintTx: vaultMintTx,
      totalSupply: '1000000000',
      vaultAllocation: '100000000',
      network: 'mainnet-beta'
    };
    
    const cacheDir = path.join(process.cwd(), '.cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(cacheDir, 'mainnet-deployment.json'),
      JSON.stringify(deploymentData, null, 2)
    );
    
    console.log('🎉 FULL DEPLOYMENT COMPLETE!');
    console.log('📊 DEPLOYMENT SUMMARY:');
    console.log(`   Mint Address: ${mint.toBase58()}`);
    console.log(`   Total Supply: 1,000,000,000 OMEGA`);
    console.log(`   Treasury: ${treasuryAta.address.toBase58()}`);
    console.log(`   Earnings Vault: ${vaultAta.address.toBase58()}`);
    console.log(`   Initial Mint TX: ${mintTx}`);
    console.log(`   Vault Mint TX: ${vaultMintTx}`);
    console.log('🌐 Network: Solana Mainnet-Beta');
    
    return deploymentData;
    
  } catch (error) {
    console.error('❌ DEPLOYMENT FAILED:', error.message);
    throw error;
  }
}

fullMainnetDeploy().catch(console.error);