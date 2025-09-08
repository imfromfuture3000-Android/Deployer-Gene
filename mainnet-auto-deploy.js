// MAINNET AUTO-DEPLOYMENT MONITOR
require('dotenv').config();

console.log("MONITORING MAINNET WALLET FOR FUNDING");
console.log("==============================================");

const targetWalletAddress = process.env.TARGET_WALLET_ADDRESS;
if (!targetWalletAddress) {
  console.error("❌ ERROR: TARGET_WALLET_ADDRESS not set in environment variables");
  process.exit(1);
}

console.log("Target:", targetWalletAddress);
console.log("Network: mainnet-beta ONLY");
console.log("Required: 0.002 SOL minimum");
console.log("");

const { Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMinimumBalanceForRentExemptMint, MINT_SIZE, sendAndConfirmTransaction } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");

let monitorActive = true;
let checkCount = 0;

async function monitorAndExecute() {
  try {
    const keypairPath = path.join(process.cwd(), ".cache", "user_auth.json");
    const keypairJson = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    const userKeypair = Keypair.fromSecretKey(new Uint8Array(keypairJson));
    
    // Use environment variables for secure configuration
    const heliusApiKey = process.env.HELIUS_API_KEY;
    const rpcUrl = heliusApiKey 
      ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
      : process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
      
    const connection = new Connection(rpcUrl, "confirmed");
    
    console.log("Monitoring:", userKeypair.publicKey.toBase58());
    console.log("Checking every 5 seconds...");
    console.log("");
    
    const targetWallet = new PublicKey(process.env.TARGET_WALLET_ADDRESS);
    
    const checkBalance = async () => {
      if (!monitorActive) return;
      
      checkCount++;
      const balance = await connection.getBalance(userKeypair.publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      process.stdout.write("[Check " + checkCount + "] Balance: " + solBalance.toFixed(6) + " SOL\\r");
      
      if (balance >= 2000000) {
        console.log("\\nFUNDING DETECTED - EXECUTING MAINNET DEPLOYMENT!");
        console.log("===================================================");
        
        monitorActive = false;
        
        try {
          const mint = Keypair.generate();
          console.log("IMPULSE Mint:", mint.publicKey.toBase58());
          
          const rentMint = await getMinimumBalanceForRentExemptMint(connection);
          console.log("Rent required:", rentMint / LAMPORTS_PER_SOL, "SOL");
          
          const targetATA = await getAssociatedTokenAddress(
            mint.publicKey,
            targetWallet,
            false,
            TOKEN_2022_PROGRAM_ID
          );
          console.log("Target ATA:", targetATA.toBase58());
          
          console.log("Building transaction...");
          
          const { blockhash } = await connection.getLatestBlockhash("confirmed");
          
          const tx = new Transaction();
          tx.recentBlockhash = blockhash;
          tx.feePayer = userKeypair.publicKey;
          
          tx.add(
            SystemProgram.createAccount({
              fromPubkey: userKeypair.publicKey,
              newAccountPubkey: mint.publicKey,
              space: MINT_SIZE,
              lamports: rentMint,
              programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMintInstruction(
              mint.publicKey,
              6,
              userKeypair.publicKey,
              userKeypair.publicKey,
              TOKEN_2022_PROGRAM_ID
            ),
            createAssociatedTokenAccountInstruction(
              userKeypair.publicKey,
              targetATA,
              targetWallet,
              mint.publicKey,
              TOKEN_2022_PROGRAM_ID
            ),
            createMintToInstruction(
              mint.publicKey,
              targetATA,
              userKeypair.publicKey,
              1000000000n * 1000000n,
              [],
              TOKEN_2022_PROGRAM_ID
            )
          );
          
          console.log("EXECUTING ON MAINNET...");
          console.log("Deploying + Minting 1,000,000,000 IMPULSE...");
          
          const signature = await sendAndConfirmTransaction(
            connection,
            tx,
            [userKeypair, mint],
            { commitment: "confirmed" }
          );
          
          console.log("");
          console.log("MAINNET DEPLOYMENT SUCCESSFUL!");
          console.log("=======================================");
          console.log("IMPULSE Mint:", mint.publicKey.toBase58());
          console.log("Target Wallet:", targetWallet.toBase58());
          console.log("Token Account:", targetATA.toBase58());
          console.log("Minted Amount: 1,000,000,000 IMPULSE");
          console.log("Transaction:", signature);
          console.log("Network: mainnet-beta");
          console.log("");
          console.log("LIVE VERIFICATION LINKS:");
          console.log("Token Mint: https://explorer.solana.com/address/" + mint.publicKey.toBase58());
          console.log("Target Wallet: https://explorer.solana.com/address/" + targetWallet.toBase58());
          console.log("Transaction: https://explorer.solana.com/tx/" + signature);
          console.log("Jupiter Trading: https://jup.ag/swap/SOL-" + mint.publicKey.toBase58());
          console.log("DEXScreener: https://dexscreener.com/solana/" + mint.publicKey.toBase58());
          console.log("");
          console.log("1 billion IMPULSE tokens deployed to mainnet.");
          console.log("Target wallet funded. Mission accomplished.");
          
          const deploymentRecord = {
            token: "IMPULSE",
            mint: mint.publicKey.toBase58(),
            target_wallet: targetWallet.toBase58(),
            target_ata: targetATA.toBase58(),
            amount: "1000000000",
            decimals: 6,
            signature: signature,
            authority: userKeypair.publicKey.toBase58(),
            network: "mainnet-beta",
            deployed_at: new Date().toISOString(),
            status: "LIVE_ON_MAINNET",
            funded_balance: solBalance
          };
          
          fs.writeFileSync(".cache/impulse-mainnet-SUCCESS.json", JSON.stringify(deploymentRecord, null, 2));
          console.log("Deployment success recorded");
          
          console.log("");
          console.log("IMPULSE IS NOW LIVE AND TRADEABLE ON SOLANA MAINNET!");
          
        } catch (deployError) {
          console.error("Deployment error:", deployError.message);
          monitorActive = true;
        }
      }
    };
    
    await checkBalance();
    
    const monitor = setInterval(async () => {
      if (monitorActive) {
        await checkBalance();
      } else {
        clearInterval(monitor);
      }
    }, 5000);
    
    console.log("FUNDING ADDRESS:");
    console.log("   " + userKeypair.publicKey.toBase58());
    console.log("");
    console.log("Send 0.002+ SOL to trigger instant deployment");
    console.log("Monitoring active. Deployment inevitable.");
    
  } catch (error) {
    console.error("Monitor error:", error.message);
  }
}

monitorAndExecute();
