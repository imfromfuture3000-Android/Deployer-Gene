const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMintLen } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function sendViaRelayer(connection, relayerPubkey, relayerUrl, tx, apiKey) {
  tx.feePayer = new PublicKey(relayerPubkey);
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;

  const b64 = tx.serialize({ requireAllSignatures: false }).toString('base64');
  
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const response = await fetch(relayerUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ signedTransactionBase64: b64 }),
  });
  
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Relayer failed');
  
  console.log(`✅ TX: https://explorer.solana.com/tx/${result.txSignature}`);
  return result.txSignature;
}

async function zeroCostDeploy() {
  console.log('🚀 ZERO-COST MAINNET DEPLOYMENT');
  console.log('⚡ OMEGA TOKEN - RELAYER POWERED');
  
  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  
  // Load deployer key (signer only)
  const deployerKeyPath = path.join(process.cwd(), '.deployer.key');
  const privateKeyString = fs.readFileSync(deployerKeyPath, 'utf8').trim();
  const privateKeyBytes = bs58.decode(privateKeyString);
  const deployer = Keypair.fromSecretKey(privateKeyBytes);
  
  console.log('🔑 Deployer (Signer):', deployer.publicKey.toBase58());
  console.log('💸 Fee Payer (Relayer):', process.env.RELAYER_PUBKEY);
  
  try {
    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    
    console.log('🪙 Mint Address:', mint.toBase58());
    
    // Get rent for mint account
    const mintLen = getMintLen([]);
    const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);
    
    // Create mint transaction
    const createMintTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: new PublicKey(process.env.RELAYER_PUBKEY),
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
    
    // Set fee payer and blockhash before signing
    createMintTx.feePayer = new PublicKey(process.env.RELAYER_PUBKEY);
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    createMintTx.recentBlockhash = blockhash;
    
    // Sign with both deployer and mint keypair
    createMintTx.partialSign(deployer, mintKeypair);
    
    // Send via relayer
    const mintTxSignature = await sendViaRelayer(
      connection,
      process.env.RELAYER_PUBKEY,
      process.env.RELAYER_URL,
      createMintTx,
      process.env.RELAYER_API_KEY
    );
    
    console.log('✅ MINT CREATED - ZERO COST!');
    console.log('📝 Signature:', mintTxSignature);
    
    // Create treasury ATA and mint tokens
    const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY || deployer.publicKey.toBase58());
    const treasuryAta = await getAssociatedTokenAddress(mint, treasuryPubkey, false, TOKEN_2022_PROGRAM_ID);
    
    const mintToTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        new PublicKey(process.env.RELAYER_PUBKEY),
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
    
    // Set fee payer and blockhash before signing
    mintToTx.feePayer = new PublicKey(process.env.RELAYER_PUBKEY);
    const { blockhash: blockhash2 } = await connection.getLatestBlockhash('confirmed');
    mintToTx.recentBlockhash = blockhash2;
    
    // Sign with deployer only
    mintToTx.partialSign(deployer);
    
    // Send via relayer
    const mintToSignature = await sendViaRelayer(
      connection,
      process.env.RELAYER_PUBKEY,
      process.env.RELAYER_URL,
      mintToTx,
      process.env.RELAYER_API_KEY
    );
    
    console.log('✅ TOKENS MINTED - ZERO COST!');
    console.log('📝 Signature:', mintToSignature);
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
      programId: TOKEN_2022_PROGRAM_ID.toBase58(),
      deploymentCost: '0 SOL (Relayer Powered)'
    };
    
    const cacheDir = path.join(process.cwd(), '.cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(cacheDir, 'zero-cost-deployment.json'),
      JSON.stringify(deploymentData, null, 2)
    );
    
    console.log('🎉 ZERO-COST DEPLOYMENT COMPLETE!');
    console.log('📊 LIVE CONTRACT DATA:');
    console.log(`   🪙 Mint: ${mint.toBase58()}`);
    console.log(`   💰 Supply: 1,000,000,000 OMEGA`);
    console.log(`   🏦 Treasury: ${treasuryAta.toBase58()}`);
    console.log(`   📝 Create TX: ${mintTxSignature}`);
    console.log(`   📝 Mint TX: ${mintToSignature}`);
    console.log(`   💸 Cost: 0 SOL (Relayer Powered)`);
    console.log('🌐 Network: Solana Mainnet-Beta');
    
    return deploymentData;
    
  } catch (error) {
    console.error('❌ DEPLOYMENT FAILED:', error.message);
    throw error;
  }
}

zeroCostDeploy().catch(console.error);