// SEND ALL REMAINING FUNDS TO TARGET ADDRESS
const web3 = require('@solana/web3.js');
require('dotenv').config();

async function sendRemainingFunds() {
  console.log('?? SENDING ALL REMAINING FUNDS');
  console.log('='.repeat(50));
  
  const connection = new web3.Connection('${process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : (process.env.RPC_URL || "https://api.mainnet-beta.solana.com")}`');
  
  // ADDRESSES
  const sourceAddress = process.env.SOURCE_WALLET_ADDRESS; // Your primary wallet
  const targetAddress = process.env.TARGET_WALLET_ADDRESS; // Target address
  
  console.log('?? FROM:', sourceAddress);
  console.log('?? TO:', targetAddress);
  
  try {
    // Check current balance of source wallet
    const sourcePublicKey = new web3.PublicKey(sourceAddress);
    const currentBalance = await connection.getBalance(sourcePublicKey);
    const currentBalanceSOL = currentBalance / web3.LAMPORTS_PER_SOL;
    
    console.log('\\n?? SOURCE WALLET STATUS:');
    console.log('Current Balance:', currentBalanceSOL.toFixed(6), 'SOL');
    console.log('Estimated USD Value: $' + (currentBalanceSOL * 150).toFixed(2));
    
    // Calculate transfer amount (leave small amount for transaction fee)
    const transactionFee = 0.000005; // Standard transaction fee
    const transferAmount = currentBalanceSOL - transactionFee;
    const transferLamports = Math.floor(transferAmount * web3.LAMPORTS_PER_SOL);
    
    console.log('\\n?? TRANSFER CALCULATION:');
    console.log('Transaction Fee:', transactionFee, 'SOL');
    console.log('Transfer Amount:', transferAmount.toFixed(6), 'SOL');
    console.log('USD Value: $' + (transferAmount * 150).toFixed(2));
    console.log('Remaining in Source: ~0.000005 SOL (dust)');
    
    if (transferAmount <= 0) {
      console.log('? Insufficient funds for transfer');
      return;
    }
    
    // Check target address current status
    console.log('\\n?? TARGET ADDRESS STATUS:');
    try {
      const targetPublicKey = new web3.PublicKey(targetAddress);
      const targetBalance = await connection.getAccountInfo(targetPublicKey);
      
      if (targetBalance) {
        const targetBalanceSOL = targetBalance.lamports / web3.LAMPORTS_PER_SOL;
        console.log('Current Balance:', targetBalanceSOL.toFixed(6), 'SOL');
        console.log('After Transfer:', (targetBalanceSOL + transferAmount).toFixed(6), 'SOL');
      } else {
        console.log('Current Balance: 0 SOL (new address)');
        console.log('After Transfer:', transferAmount.toFixed(6), 'SOL');
      }
    } catch (error) {
      console.log('Status: New address, will be created');
    }
    
    // Create transfer instruction
    const transferInstruction = web3.SystemProgram.transfer({
      fromPubkey: sourcePublicKey,
      toPubkey: new web3.PublicKey(targetAddress),
      lamports: transferLamports
    });
    
    const transaction = new web3.Transaction().add(transferInstruction);
    
    console.log('\\n? TRANSFER READY:');
    console.log('? Transaction prepared');
    console.log('? Amount:', transferAmount.toFixed(6), 'SOL');
    console.log('? Fee:', transactionFee, 'SOL');
    console.log('? Total moved:', transferAmount.toFixed(6), 'SOL');
    
    console.log('\\n?? FINAL RESULT:');
    console.log('Source Wallet: ~0.000005 SOL (minimum for account)');
    console.log('Target Wallet: ' + transferAmount.toFixed(6) + ' SOL (~$' + (transferAmount * 150).toFixed(2) + ')');
    console.log('Funds Available: Full balance moved to target');
    
    console.log('\\n?? TARGET ADDRESS WILL HAVE:');
    console.log('� Previous funding: ~0.167 SOL ()');
    console.log('� New transfer: ' + transferAmount.toFixed(6) + ' SOL');
    console.log('� Total balance: ~' + (0.167 + transferAmount).toFixed(6) + ' SOL');
    console.log('� Estimated USD: ~$' + ((0.167 + transferAmount) * 150).toFixed(2));
    
    console.log('\\n?? TO EXECUTE:');
    console.log('1. Replace with your private key for source address');
    console.log('2. Sign and send the transaction');
    console.log('3. All funds will be transferred to target address');
    
    console.log('\\n? READY FOR EXECUTION');
    
    return {
      sourceAddress,
      targetAddress,
      transferAmountSOL: transferAmount,
      transferAmountUSD: transferAmount * 150,
      transactionFee,
      transaction
    };
    
  } catch (error) {
    console.error('? Error:', error.message);
    throw error;
  }
}

sendRemainingFunds().then(result => {
  console.log('\\n?? FUND TRANSFER READY');
  console.log('All remaining funds prepared for transfer');
}).catch(console.error);
