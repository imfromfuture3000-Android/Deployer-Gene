const web3 = require("@solana/web3.js");
require('dotenv').config();

async function checkTransactions() {
  console.log("?? CHECKING WALLET TRANSACTIONS");
  
  // Use environment variables for secure configuration
  const heliusApiKey = process.env.HELIUS_API_KEY;
  const rpcUrl = heliusApiKey 
    ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
    : process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    
  const connection = new web3.Connection(rpcUrl);
  
  const sourceAddress = process.env.SOURCE_WALLET_ADDRESS;
  const targetAddress = process.env.TARGET_WALLET_ADDRESS;
  
  if (!sourceAddress || !targetAddress) {
    console.error("❌ ERROR: Wallet addresses not configured in environment variables");
    console.log("Please set SOURCE_WALLET_ADDRESS and TARGET_WALLET_ADDRESS in your .env file");
    return;
  }
  
  try {
    const sourceSignatures = await connection.getSignaturesForAddress(
      new web3.PublicKey(sourceAddress), 
      { limit: 3 }
    );
    
    const targetSignatures = await connection.getSignaturesForAddress(
      new web3.PublicKey(targetAddress), 
      { limit: 3 }
    );
    
    console.log("SOURCE WALLET TRANSACTIONS:");
    sourceSignatures.forEach((sig, i) => {
      console.log(`TX ${i + 1}: ${sig.signature}`);
      console.log(`Explorer: https://explorer.solana.com/tx/${sig.signature}`);
    });
    
    console.log("TARGET WALLET TRANSACTIONS:");
    targetSignatures.forEach((sig, i) => {
      console.log(`TX ${i + 1}: ${sig.signature}`);
      console.log(`Explorer: https://explorer.solana.com/tx/${sig.signature}`);
    });
    
    if (sourceSignatures.length > 0) {
      console.log("LATEST TX HASH:", sourceSignatures[0].signature);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkTransactions();
