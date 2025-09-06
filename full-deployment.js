const web3 = require("@solana/web3.js");
const spl = require("@solana/spl-token");

async function fullOmegaDeployment() {
  console.log("?? OMEGA PRIME - COMPLETE DEPLOYMENT");
  console.log("===================================");
  
  try {
    const connection = new web3.Connection("https://mainnet.helius-rpc.com/?api-key=16b9324a-5b8c-47b9-9b02-6efa868958e5");
    
    // STEP 1: Fund Transfer
    console.log("\\n?? STEP 1: FUND TRANSFER");
    
    const sourcePrivateKey = [
      // INSERT SOURCE WALLET PRIVATE KEY HERE
    ];
    
    if (sourcePrivateKey.length === 0) {
      console.log("? Source private key required for fund transfer");
      return;
    }
    
    const sourcePayer = web3.Keypair.fromSecretKey(new Uint8Array(sourcePrivateKey));
    const targetAddress = "4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a";
    
    // Transfer funds
    const sourceBalance = await connection.getBalance(sourcePayer.publicKey);
    const transferAmount = sourceBalance - 5000; // Leave 5000 lamports
    
    const transferTx = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: sourcePayer.publicKey,
        toPubkey: new web3.PublicKey(targetAddress),
        lamports: transferAmount
      })
    );
    
    console.log("?? Executing fund transfer...");
    const transferSignature = await web3.sendAndConfirmTransaction(
      connection,
      transferTx,
      [sourcePayer],
      { commitment: "confirmed" }
    );
    
    console.log("? Funds transferred!");
    console.log("?? Transfer TX:", transferSignature);
    
    // STEP 2: Token Deployment
    console.log("\\n?? STEP 2: OMEGA TOKEN DEPLOYMENT");
    
    const targetPrivateKey = [
      // INSERT TARGET WALLET PRIVATE KEY HERE
    ];
    
    if (targetPrivateKey.length === 0) {
      console.log("? Target private key required for token deployment");
      console.log("? Fund transfer completed, add target key to continue");
      return { transferTx: transferSignature };
    }
    
    const targetPayer = web3.Keypair.fromSecretKey(new Uint8Array(targetPrivateKey));
    
    // Generate mint
    const mint = web3.Keypair.generate();
    
    console.log("?? Creating OMEGA mint:", mint.publicKey.toBase58());
    
    // Create mint account
    const rent = await spl.getMinimumBalanceForRentExemptMint(connection);
    
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
        targetPayer.publicKey,
        targetPayer.publicKey,
        spl.TOKEN_2022_PROGRAM_ID
      )
    );
    
    console.log("?? Creating mint...");
    const mintSignature = await web3.sendAndConfirmTransaction(
      connection,
      createMintTx,
      [targetPayer, mint],
      { commitment: "confirmed" }
    );
    
    console.log("? OMEGA mint created!");
    console.log("?? Mint TX:", mintSignature);
    
    // STEP 3: Mint Tokens
    console.log("\\n?? STEP 3: MINTING 1 BILLION OMEGA TOKENS");
    
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
    
    console.log("?? Minting tokens...");
    const mintTokensSignature = await web3.sendAndConfirmTransaction(
      connection,
      mintTokensTx,
      [targetPayer],
      { commitment: "confirmed" }
    );
    
    console.log("? Tokens minted!");
    console.log("?? Mint Tokens TX:", mintTokensSignature);
    
    // Final summary
    console.log("\\n?? OMEGA PRIME DEPLOYMENT COMPLETE!");
    console.log("====================================");
    console.log("?? Mint Address:", mint.publicKey.toBase58());
    console.log("?? Token Account:", associatedTokenAddress.toBase58());
    console.log("?? Owner:", targetPayer.publicKey.toBase58());
    console.log("?? Supply: 1,000,000,000 OMEGA");
    console.log("");
    console.log("?? TRANSACTION HASHES:");
    console.log("Transfer:", transferSignature);
    console.log("Mint:", mintSignature);
    console.log("Tokens:", mintTokensSignature);
    console.log("");
    console.log("?? EXPLORER LINKS:");
    console.log("Transfer: https://explorer.solana.com/tx/" + transferSignature);
    console.log("Mint: https://explorer.solana.com/tx/" + mintSignature);
    console.log("Tokens: https://explorer.solana.com/tx/" + mintTokensSignature);
    
    return {
      transferTx: transferSignature,
      mintTx: mintSignature,
      mintTokensTx: mintTokensSignature,
      mintAddress: mint.publicKey.toBase58(),
      tokenAccount: associatedTokenAddress.toBase58()
    };
    
  } catch (error) {
    console.error("? Deployment Error:", error.message);
    throw error;
  }
}

console.log(`
??  COMPLETE DEPLOYMENT INSTRUCTIONS:

1. Add source wallet private key (for fund transfer)
2. Add target wallet private key (for token deployment)
3. Run: node full-deployment.js

PROCESS:
? Transfer all SOL to target wallet
? Deploy OMEGA token from target wallet
? Mint 1 billion OMEGA tokens
? Get all transaction hashes

?? ONE SCRIPT = COMPLETE OMEGA DEPLOYMENT!
`);

// Uncomment to execute (after adding private keys):
// fullOmegaDeployment().then(result => {
//   console.log("?? Complete deployment finished!");
//   console.log("All transaction hashes available!");
// }).catch(console.error);
