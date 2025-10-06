
// Deployment Script for Gene Mint NFT
const { ethers } = require('ethers');

async function deploy() {
  const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await contractFactory.deploy();
  
  console.log('Contract deployed to:', contract.target);
  return contract.target;
}

deploy().catch(console.error);
    