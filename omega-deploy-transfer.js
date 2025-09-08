const web3 = require("@solana/web3.js");
const spl = require("@solana/spl-token");

async function deployOmegaWithTransfer() {
  console.log("?? OMEGA - DEPLOY WITH CREATOR + TRANSFER OWNERSHIP");
  console.log("=================================================");
  
  const connection = new web3.Connection("https://mainnet.helius-rpc.com/?api-key=16b9324a-5b8c-47b9-9b02-6efa868958e5");
  
  // Funded creator wallet
  const creatorAddress = process.env.SOURCE_WALLET_ADDRESS;
  const newOwnerAddress = process.env.TARGET_WALLET_ADDRESS;
  
  console.log("?? Creator:", creatorAddress);
  console.log("?? New Owner:", newOwnerAddress);
  
  // CREATOR PRIVATE KEY
  const creatorPrivateKey = [
    // INSERT PRIVATE KEY FOR CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ
  ];
  
  if (creatorPrivateKey.length === 0) {
    console.log("??  Add creator private key to execute");
    return;
  }
  
  const creator = web3.Keypair.fromSecretKey(new Uint8Array(creatorPrivateKey));
  const newOwner = new web3.PublicKey(newOwnerAddress);
  
  try {
    // Check balance
    const balance = await connection.getBalance(creator.publicKey);
    console.log("?? Creator Balance:", balance / web3.LAMPORTS_PER_SOL, "SOL");
    
    // Create mint
    const mint = web3.Keypair.generate();
    console.log("\\n?? Creating OMEGA mint:", mint.publicKey.toBase58());
    
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
    
    const mintSig = await web3.sendAndConfirmTransaction(connection, createMintTx, [creator, mint]);
    console.log("? Mint created:", mintSig);
    
    // Create token account for new owner and mint tokens
    console.log("\\n?? Minting to new owner...");
    
    const tokenAccount = await spl.getAssociatedTokenAddress(mint.publicKey, newOwner, false, spl.TOKEN_2022_PROGRAM_ID);
    
    const mintTokensTx = new web3.Transaction().add(
      spl.createAssociatedTokenAccountInstruction(creator.publicKey, tokenAccount, newOwner, mint.publicKey, spl.TOKEN_2022_PROGRAM_ID),
      spl.createMintToInstruction(mint.publicKey, tokenAccount, creator.publicKey, 1000000000 * Math.pow(10, 9), [], spl.TOKEN_2022_PROGRAM_ID)
    );
    
    const mintTokensSig = await web3.sendAndConfirmTransaction(connection, mintTokensTx, [creator]);
    console.log("? Tokens minted:", mintTokensSig);
    
    // Transfer authority
    console.log("\\n?? Transferring authority...");
    
    const transferTx = new web3.Transaction().add(
      spl.createSetAuthorityInstruction(mint.publicKey, creator.publicKey, spl.AuthorityType.MintTokens, newOwner, [], spl.TOKEN_2022_PROGRAM_ID),
      spl.createSetAuthorityInstruction(mint.publicKey, creator.publicKey, spl.AuthorityType.FreezeAccount, newOwner, [], spl.TOKEN_2022_PROGRAM_ID)
    );
    
    const transferSig = await web3.sendAndConfirmTransaction(connection, transferTx, [creator]);
    console.log("? Authority transferred:", transferSig);
    
    console.log("\\n?? OMEGA DEPLOYMENT COMPLETE!");
    console.log("==============================");
    console.log("?? Mint:", mint.publicKey.toBase58());
    console.log("?? Token Account:", tokenAccount.toBase58());
    console.log("?? Owner:", newOwnerAddress);
    console.log("?? Supply: 1,000,000,000 OMEGA");
    console.log("");
    console.log("?? TRANSACTION HASHES:");
    console.log("Create:", mintSig);
    console.log("Mint:", mintTokensSig);
    console.log("Transfer:", transferSig);
    console.log("");
    console.log("?? EXPLORERS:");
    console.log("https://explorer.solana.com/tx/" + mintSig);
    console.log("https://explorer.solana.com/tx/" + mintTokensSig);
    console.log("https://explorer.solana.com/tx/" + transferSig);
    
    return { mint: mint.publicKey.toBase58(), tokenAccount: tokenAccount.toBase58(), transactions: [mintSig, mintTokensSig, transferSig] };
    
  } catch (error) {
    console.error("? Error:", error.message);
    throw error;
  }
}

console.log("??  Add creator private key and uncomment execution line");

// deployOmegaWithTransfer().catch(console.error);
