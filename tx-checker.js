const web3 = require("@solana/web3.js");

async function checkTransactions() {
  console.log("?? CHECKING WALLET TRANSACTIONS");
  
  const connection = new web3.Connection("https://mainnet.helius-rpc.com/?api-key=16b9324a-5b8c-47b9-9b02-6efa868958e5");
  
  const sourceAddress = "CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ";
  const targetAddress = "4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a";
  
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
