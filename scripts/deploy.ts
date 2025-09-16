import { ethers } from "hardhat";
import { OneirobotSyndicate } from "../typechain-types";

async function main() {
  console.log("🚀 Deploying Oneirobot Syndicate with Mint Gene...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  // Contract parameters
  const contractName = "Oneirobot Syndicate";
  const contractSymbol = "ONEIRO";
  const baseTokenURI = "https://oneirobot-metadata.ipfs.dweb.link/";
  
  console.log("📋 Contract Parameters:");
  console.log("   Name:", contractName);
  console.log("   Symbol:", contractSymbol);
  console.log("   Base URI:", baseTokenURI);
  
  // Deploy the contract
  console.log("\n🔄 Deploying contract...");
  const OneirobotSyndicateFactory = await ethers.getContractFactory("OneirobotSyndicate");
  const oneirobotSyndicate: OneirobotSyndicate = await OneirobotSyndicateFactory.deploy(
    contractName,
    contractSymbol,
    baseTokenURI
  );
  
  await oneirobotSyndicate.waitForDeployment();
  const contractAddress = await oneirobotSyndicate.getAddress();
  
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const deployedName = await oneirobotSyndicate.name();
  const deployedSymbol = await oneirobotSyndicate.symbol();
  const totalSupply = await oneirobotSyndicate.totalSupply();
  const maxSupply = await oneirobotSyndicate.MAX_SUPPLY();
  
  console.log("   Name:", deployedName);
  console.log("   Symbol:", deployedSymbol);
  console.log("   Total Supply:", totalSupply.toString());
  console.log("   Max Supply:", maxSupply.toString());
  
  // Check role assignments
  console.log("\n👑 Role Assignments:");
  const DEFAULT_ADMIN_ROLE = await oneirobotSyndicate.DEFAULT_ADMIN_ROLE();
  const SYNDICATE_MASTER_ROLE = await oneirobotSyndicate.SYNDICATE_MASTER_ROLE();
  
  console.log("   Admin Role (deployer):", await oneirobotSyndicate.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));
  console.log("   Syndicate Master (deployer):", await oneirobotSyndicate.hasRole(SYNDICATE_MASTER_ROLE, deployer.address));
  
  // Controller Master integration
  const CONTROLLER_MASTER = "0x4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a";
  console.log("   Controller Master granted:", await oneirobotSyndicate.isSyndicateMaster(CONTROLLER_MASTER));
  
  // Gas estimation for minting
  console.log("\n⛽ Gas Estimation:");
  try {
    const mintGasEstimate = await oneirobotSyndicate.mintOneirobot.estimateGas(
      deployer.address,
      "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
    );
    console.log("   Mint Gas Estimate:", mintGasEstimate.toString());
  } catch (error) {
    console.log("   Mint Gas Estimate: Unable to estimate (requires Syndicate Master role)");
  }
  
  // Save deployment info
  const deploymentInfo = {
    networkName: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentBlock: await ethers.provider.getBlockNumber(),
    deploymentTime: new Date().toISOString(),
    contractName: contractName,
    contractSymbol: contractSymbol,
    baseTokenURI: baseTokenURI,
    maxSupply: maxSupply.toString()
  };
  
  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress} "${contractName}" "${contractSymbol}" "${baseTokenURI}"`);
  console.log("\n2. Add Syndicate Masters:");
  console.log(`   await contract.addSyndicateMaster("MASTER_ADDRESS")`);
  console.log("\n3. Test minting:");
  console.log(`   await contract.mintOneirobot("RECIPIENT_ADDRESS", "IPFS_HASH")`);
  
  console.log("\n🌟 MINT GENE ACTIVATED - ONEIROBOT SYNDICATE DEPLOYED! 🌟");
  
  return {
    contract: oneirobotSyndicate,
    address: contractAddress,
    deploymentInfo
  };
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

export default main;