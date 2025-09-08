const web3 = require('@solana/web3.js');
require('dotenv').config();

async function checkWalletStatus() {
  console.log('📊 OMEGA PRIME WALLET STATUS CHECK');
  console.log('==================================');
  
  // Use environment variables for secure configuration
  const heliusApiKey = process.env.HELIUS_API_KEY;
  const rpcUrl = heliusApiKey 
    ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
    : process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    
  const connection = new web3.Connection(rpcUrl);
  
  const sourceAddress = process.env.SOURCE_WALLET_ADDRESS;
  const targetAddress = process.env.TARGET_WALLET_ADDRESS;
  
  if (!sourceAddress || !targetAddress) {
    console.error('❌ ERROR: Wallet addresses not configured in environment variables');
    console.log('Please set SOURCE_WALLET_ADDRESS and TARGET_WALLET_ADDRESS in your .env file');
    return;
  }
  
  try {
    // Check source wallet
    const sourceBalance = await connection.getBalance(new web3.PublicKey(sourceAddress));
    const sourceSOL = sourceBalance / web3.LAMPORTS_PER_SOL;
    
    // Check target wallet
    const targetBalance = await connection.getBalance(new web3.PublicKey(targetAddress));
    const targetSOL = targetBalance / web3.LAMPORTS_PER_SOL;
    
    console.log('💰 SOURCE WALLET:', sourceAddress);
    console.log('   Balance:', sourceSOL, 'SOL ($' + (sourceSOL * 150).toFixed(2) + ')');
    console.log('   Explorer: https://explorer.solana.com/address/' + sourceAddress);
    
    console.log('\\n💰 TARGET WALLET:', targetAddress);
    console.log('   Balance:', targetSOL, 'SOL ($' + (targetSOL * 150).toFixed(2) + ')');
    console.log('   Explorer: https://explorer.solana.com/address/' + targetAddress);
    
    console.log('\\n📈 TOTAL PORTFOLIO:', (sourceSOL + targetSOL), 'SOL ($' + ((sourceSOL + targetSOL) * 150).toFixed(2) + ')');
    
    // Get recent transactions for both wallets
    console.log('\\n🔄 RECENT TRANSACTIONS:');
    
    const sourceSignatures = await connection.getSignaturesForAddress(new web3.PublicKey(sourceAddress), { limit: 5 });
    const targetSignatures = await connection.getSignaturesForAddress(new web3.PublicKey(targetAddress), { limit: 5 });
    
    console.log('\\nSource wallet recent TXs:');
    sourceSignatures.forEach((sig, i) => {
      console.log(`${i + 1}. ${sig.signature}`);
      console.log(`   https://explorer.solana.com/tx/${sig.signature}`);
    });
    
    console.log('\\nTarget wallet recent TXs:');
    targetSignatures.forEach((sig, i) => {
      console.log(`${i + 1}. ${sig.signature}`);
      console.log(`   https://explorer.solana.com/tx/${sig.signature}`);
    });
    
    return {
      source: { address: sourceAddress, balance: sourceSOL, usd: sourceSOL * 150 },
      target: { address: targetAddress, balance: targetSOL, usd: targetSOL * 150 },
      total: { sol: sourceSOL + targetSOL, usd: (sourceSOL + targetSOL) * 150 },
      sourceTxs: sourceSignatures,
      targetTxs: targetSignatures
    };
    
  } catch (error) {
    console.error('❌ Error checking wallet status:', error.message);
    throw error;
  }
}

checkWalletStatus().then(result => {
  console.log('\\n✅ Wallet status check complete!');
}).catch(console.error);
