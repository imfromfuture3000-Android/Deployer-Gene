#!/usr/bin/env node

const { ethers } = require('ethers');

async function transferETH(privateKey, toAddress, amountETH) {
  // Connect to Ethereum mainnet
  const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`From: ${wallet.address}`);
  console.log(`To: ${toAddress}`);
  console.log(`Amount: ${amountETH} ETH`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  // Create transaction
  const tx = {
    to: toAddress,
    value: ethers.parseEther(amountETH),
    gasLimit: 21000,
    gasPrice: await provider.getGasPrice()
  };
  
  // Send transaction
  const txResponse = await wallet.sendTransaction(tx);
  console.log(`Transaction hash: ${txResponse.hash}`);
  
  // Wait for confirmation
  const receipt = await txResponse.wait();
  console.log(`✅ Transfer complete! Block: ${receipt.blockNumber}`);
  
  return txResponse.hash;
}

// Example usage (DO NOT USE REAL PRIVATE KEYS)
async function main() {
  const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY || 'your_private_key_here';
  const TO_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  const AMOUNT = '0.01'; // ETH amount
  
  if (PRIVATE_KEY === 'your_private_key_here') {
    console.log('⚠️ Set ETH_PRIVATE_KEY environment variable');
    console.log('Example: ETH_PRIVATE_KEY=0x... node transfer-eth.js');
    return;
  }
  
  await transferETH(PRIVATE_KEY, TO_ADDRESS, AMOUNT);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { transferETH };