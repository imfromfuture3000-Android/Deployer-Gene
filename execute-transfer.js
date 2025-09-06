const web3 = require("@solana/web3.js");

async function executeActualTransfer() {
  console.log("?? OMEGA PRIME - EXECUTING FUND TRANSFER");
  console.log("=======================================");
  
  try {
    const connection = new web3.Connection("https://mainnet.helius-rpc.com/?api-key=16b9324a-5b8c-47b9-9b02-6efa868958e5");
    
    const sourceAddress = "CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ";
    const targetAddress = "4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a";
    
    // REPLACE THIS WITH YOUR ACTUAL PRIVATE KEY
    const privateKeyArray = [
      // INSERT YOUR 64-BYTE PRIVATE KEY ARRAY HERE
      // Example: [123, 45, 67, 89, 101, 112, 134, 156, ...]
    ];
    
    if (privateKeyArray.length === 0) {
      console.log("??  PRIVATE KEY REQUIRED");
      console.log("Please add your private key array to execute the transfer");
      console.log("Example format: [123, 45, 67, 89, 101, 112, ...]");
      return;
    }
    
    const payer = web3.Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    
    console.log("?? Transfer Details:");
    console.log("From:", sourceAddress);
    console.log("To:", targetAddress);
    console.log("Payer Public Key:", payer.publicKey.toBase58());
    
    // Get current balance
    const currentBalance = await connection.getBalance(payer.publicKey);
    const currentBalanceSOL = currentBalance / web3.LAMPORTS_PER_SOL;
    
    console.log("?? Current Balance:", currentBalanceSOL, "SOL");
    
    if (currentBalance < 6000) {
      console.log("? Insufficient balance for transfer");
      return;
    }
    
    // Calculate transfer amount (leave small amount for rent)
    const feeEstimate = 5000; // lamports
    const transferAmount = currentBalance - feeEstimate;
    
    console.log("?? Transfer Amount:", transferAmount / web3.LAMPORTS_PER_SOL, "SOL");
    console.log("?? Estimated Fee:", feeEstimate / web3.LAMPORTS_PER_SOL, "SOL");
    
    // Create transfer instruction
    const transferInstruction = web3.SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: new web3.PublicKey(targetAddress),
      lamports: transferAmount
    });
    
    // Create and send transaction
    const transaction = new web3.Transaction().add(transferInstruction);
    
    console.log("?? Sending transaction to mainnet...");
    
    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );
    
    console.log("? TRANSFER SUCCESSFUL!");
    console.log("?? Transaction Hash:", signature);
    console.log("?? Explorer:", `https://explorer.solana.com/tx/${signature}`);
    
    // Check new balances
    const newSourceBalance = await connection.getBalance(payer.publicKey);
    const newTargetBalance = await connection.getBalance(new web3.PublicKey(targetAddress));
    
    console.log("");
    console.log("?? FINAL BALANCES:");
    console.log("Source:", newSourceBalance / web3.LAMPORTS_PER_SOL, "SOL");
    console.log("Target:", newTargetBalance / web3.LAMPORTS_PER_SOL, "SOL");
    
    console.log("");
    console.log("?? FUND TRANSFER COMPLETE!");
    console.log("Ready for OMEGA token deployment!");
    
    return {
      signature,
      transferAmountSOL: transferAmount / web3.LAMPORTS_PER_SOL,
      newTargetBalance: newTargetBalance / web3.LAMPORTS_PER_SOL
    };
    
  } catch (error) {
    console.error("? Transfer Error:", error.message);
    throw error;
  }
}

console.log(`
??  EXECUTION INSTRUCTIONS:

1. Add your private key array to the privateKeyArray variable
2. Ensure you have SOL in the source wallet
3. Run: node execute-transfer.js

?? This will transfer ~0.332 SOL to the target address
?? Cost: ~0.000005 SOL transaction fee
?? Your private key stays local and secure
`);

// Uncomment to execute (after adding private key):
// executeActualTransfer().then(result => {
//   console.log("Transfer completed with hash:", result.signature);
// }).catch(console.error);
