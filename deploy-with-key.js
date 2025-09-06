const web3 = require("@solana/web3.js");
const spl = require("@solana/spl-token");

async function deployOmega() {
  console.log("?? OMEGA DEPLOYMENT - READY TO EXECUTE");
  console.log("=====================================");
  
  const connection = new web3.Connection("https://mainnet.helius-rpc.com/?api-key=16b9324a-5b8c-47b9-9b02-6efa868958e5");
  
  // TARGET ADDRESSES
  const creatorAddress = "CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ"; // Funded wallet
  const newOwnerAddress = "4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a"; // Target owner
  
  console.log("?? Creator (Funded):", creatorAddress);
  console.log("?? New Owner:", newOwnerAddress);
  
  // ??  REPLACE THIS WITH YOUR ACTUAL PRIVATE KEY
  // Export private key from Phantom/Solflare for: CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ
  const creatorPrivateKey = [
    // PASTE YOUR 64-BYTE PRIVATE KEY ARRAY HERE
    // Example format: [123, 45, 67, 89, 101, 112, 134, 156, ...]
    // Get this from wallet export (Phantom > Settings > Export Private Key)
  ];
  
  // VALIDATION
  if (creatorPrivateKey.length === 0) {
    console.log("? PRIVATE KEY REQUIRED!");
    console.log("");
    console.log("?? HOW TO GET PRIVATE KEY:");
    console.log("1. Open Phantom/Solflare wallet");
    console.log("2. Go to Settings > Export Private Key");
    console.log("3. Copy the private key");
    console.log("4. Convert to array format [byte1, byte2, ...]");
    console.log("5. Paste into creatorPrivateKey array above");
    console.log("");
    console.log("?? Wallet to export: " + creatorAddress);
    return;
  }
  
  if (creatorPrivateKey.length !== 64) {
    console.log("? INVALID PRIVATE KEY LENGTH!");
    console.log("Expected: 64 bytes");
    console.log("Received:", creatorPrivateKey.length, "bytes");
    console.log("");
    console.log("?? TIP: Private key should be exactly 64 numbers");
    return;
  }
  
  try {
    const creator = web3.Keypair.fromSecretKey(new Uint8Array(creatorPrivateKey));
    
    // Verify correct wallet
    if (creator.publicKey.toBase58() !== creatorAddress) {
      console.log("? WRONG PRIVATE KEY!");
      console.log("Generated:", creator.publicKey.toBase58());
      console.log("Expected:", creatorAddress);
      return;
    }
    
    console.log("? Private key verified!");
    
    // Check balance
    const balance = await connection.getBalance(creator.publicKey);
    const balanceSOL = balance / web3.LAMPORTS_PER_SOL;
    
    console.log("?? Creator Balance:", balanceSOL, "SOL");
    
    if (balance < 15000000) {
      console.log("? Insufficient balance for deployment");
      console.log("Need: 0.015 SOL minimum");
      console.log("Have:", balanceSOL, "SOL");
      return;
    }
    
    // DEPLOYMENT STARTS HERE
    console.log("\\n?? STEP 1: CREATING OMEGA MINT");
    
    const mint = web3.Keypair.generate();
    console.log("Mint Address:", mint.publicKey.toBase58());
    
    const rent = await spl.getMinimumBalanceForRentExemptMint(connection);
    
    const createMintTx = new web3.Transaction().add(
      web3.SystemProgram.createAccount({
        fromPubkey: creator.publicKey,
        newAccountPubkey: mint.publicKey,
        space: spl.MINT_SIZE,
        lamports: rent,
        programId: spl.TOKEN_2022_PROGRAM_ID,
      }),
      spl.createInitializeMintInstruction(
        mint.publicKey, 9, creator.publicKey, creator.publicKey, spl.TOKEN_2022_PROGRAM_ID
      )
    );
    
    console.log("?? Creating OMEGA mint...");
    const mintSig = await web3.sendAndConfirmTransaction(connection, createMintTx, [creator, mint]);
    console.log("? Mint created! TX:", mintSig);
    
    // STEP 2: MINT TO NEW OWNER
    console.log("\\n?? STEP 2: MINTING TO NEW OWNER");
    
    const newOwner = new web3.PublicKey(newOwnerAddress);
    const tokenAccount = await spl.getAssociatedTokenAddress(mint.publicKey, newOwner, false, spl.TOKEN_2022_PROGRAM_ID);
    
    console.log("Token Account:", tokenAccount.toBase58());
    
    const mintTokensTx = new web3.Transaction().add(
      spl.createAssociatedTokenAccountInstruction(creator.publicKey, tokenAccount, newOwner, mint.publicKey, spl.TOKEN_2022_PROGRAM_ID),
      spl.createMintToInstruction(mint.publicKey, tokenAccount, creator.publicKey, 1000000000 * Math.pow(10, 9), [], spl.TOKEN_2022_PROGRAM_ID)
    );
    
    console.log("?? Minting 1 billion OMEGA tokens...");
    const mintTokensSig = await web3.sendAndConfirmTransaction(connection, mintTokensTx, [creator]);
    console.log("? Tokens minted! TX:", mintTokensSig);
    
    // STEP 3: TRANSFER AUTHORITY
    console.log("\\n?? STEP 3: TRANSFERRING AUTHORITY");
    
    const transferTx = new web3.Transaction().add(
      spl.createSetAuthorityInstruction(mint.publicKey, creator.publicKey, spl.AuthorityType.MintTokens, newOwner, [], spl.TOKEN_2022_PROGRAM_ID),
      spl.createSetAuthorityInstruction(mint.publicKey, creator.publicKey, spl.AuthorityType.FreezeAccount, newOwner, [], spl.TOKEN_2022_PROGRAM_ID)
    );
    
    console.log("?? Transferring mint authority...");
    const transferSig = await web3.sendAndConfirmTransaction(connection, transferTx, [creator]);
    console.log("? Authority transferred! TX:", transferSig);
    
    // SUCCESS SUMMARY
    console.log("\\n?? OMEGA DEPLOYMENT COMPLETE!");
    console.log("==============================");
    console.log("?? Mint Address:", mint.publicKey.toBase58());
    console.log("?? Token Account:", tokenAccount.toBase58());
    console.log("?? Owner:", newOwnerAddress);
    console.log("?? Supply: 1,000,000,000 OMEGA");
    console.log("");
    console.log("?? TRANSACTION HASHES:");
    console.log("1. Create Mint:", mintSig);
    console.log("2. Mint Tokens:", mintTokensSig);
    console.log("3. Transfer Authority:", transferSig);
    console.log("");
    console.log("?? EXPLORER LINKS:");
    console.log("Create: https://explorer.solana.com/tx/" + mintSig);
    console.log("Mint: https://explorer.solana.com/tx/" + mintTokensSig);
    console.log("Transfer: https://explorer.solana.com/tx/" + transferSig);
    console.log("Token: https://explorer.solana.com/address/" + mint.publicKey.toBase58());
    
    const finalBalance = await connection.getBalance(creator.publicKey);
    console.log("\\n?? Remaining Balance:", finalBalance / web3.LAMPORTS_PER_SOL, "SOL");
    
    return {
      mint: mint.publicKey.toBase58(),
      tokenAccount: tokenAccount.toBase58(),
      owner: newOwnerAddress,
      transactions: [mintSig, mintTokensSig, transferSig]
    };
    
  } catch (error) {
    console.error("? Deployment Error:", error.message);
    throw error;
  }
}

// Execute deployment
deployOmega().then(result => {
  console.log("\\n?? DEPLOYMENT SUCCESSFUL!");
  console.log("New OMEGA token created and transferred!");
}).catch(error => {
  console.error("? Deployment failed:", error.message);
});
