const web3 = require('@solana/web3.js');

async function executeRemainingFunds() {
  console.log('🚀 EXECUTING REMAINING FUNDS TRANSFER');
  console.log('=======================================');
  
  try {
    // Connection
    const connection = new web3.Connection('https://mainnet.helius-rpc.com/?api-key=16b9324a-5b8c-47b9-9b02-6efa868958e5');
    
    // Source wallet (your current wallet)
    const sourceAddress = 'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ';
    const targetAddress = '4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a';
    
    // PLACEHOLDER - Replace with actual private key
    const sourcePrivateKey = new Uint8Array([
      // INSERT YOUR 64-BYTE PRIVATE KEY ARRAY HERE
      // Example: [123, 45, 67, 89, 101, 112, ...]
    ]);
    
    const payer = web3.Keypair.fromSecretKey(sourcePrivateKey);
    
    console.log('📍 FROM:', sourceAddress);
    console.log('�� TO:', targetAddress);
    
    // Get current balance
    const currentBalance = await connection.getBalance(payer.publicKey);
    const currentBalanceSOL = currentBalance / web3.LAMPORTS_PER_SOL;
    
    console.log('💰 Current Balance:', currentBalanceSOL, 'SOL');
    
    // Calculate transfer amount (leave minimum for rent)
    const transactionFee = 0.000005; // SOL
    const transferAmount = currentBalanceSOL - transactionFee;
    const transferLamports = Math.floor(transferAmount * web3.LAMPORTS_PER_SOL);
    
    console.log('💸 Transfer Amount:', transferAmount, 'SOL');
    console.log('💳 Transaction Fee:', transactionFee, 'SOL');
    
    // Create transfer instruction
    const transferInstruction = web3.SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: new web3.PublicKey(targetAddress),
      lamports: transferLamports
    });
    
    // Create transaction
    const transaction = new web3.Transaction().add(transferInstruction);
    
    console.log('📝 Transaction prepared...');
    console.log('🔄 Sending to mainnet...');
    
    // EXECUTE THE TRANSACTION
    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: 'confirmed' }
    );
    
    console.log('✅ TRANSACTION SUCCESSFUL!');
    console.log('🔗 TX HASH:', signature);
    console.log('🌐 Explorer:', https://explorer.solana.com/tx/);
    
    // Check new balances
    const newSourceBalance = await connection.getBalance(payer.publicKey);
    const newTargetBalance = await connection.getBalance(new web3.PublicKey(targetAddress));
    
    console.log('\\n📊 FINAL BALANCES:');
    console.log('Source:', newSourceBalance / web3.LAMPORTS_PER_SOL, 'SOL');
    console.log('Target:', newTargetBalance / web3.LAMPORTS_PER_SOL, 'SOL');
    
    return {
      signature,
      transferAmount,
      sourceBalance: newSourceBalance / web3.LAMPORTS_PER_SOL,
      targetBalance: newTargetBalance / web3.LAMPORTS_PER_SOL,
      explorerUrl: https://explorer.solana.com/tx/
    };
    
  } catch (error) {
    console.error('❌ Transfer Error:', error.message);
    throw error;
  }
}

// Instructions
console.log(
⚠️  FUND TRANSFER EXECUTION:

1. Replace the sourcePrivateKey array with your actual 64-byte private key
2. Ensure you have SOL in the source wallet
3. Run this script to execute the transfer

🎯 READY TO TRANSFER ~0.332 SOL TO TARGET ADDRESS
);

// Uncomment to execute (after adding private key):
// executeRemainingFunds().then(result => {
//   console.log('🎉 Transfer completed!');
//   console.log('TX Hash:', result.signature);
// }).catch(console.error);

module.exports = { executeRemainingFunds };
