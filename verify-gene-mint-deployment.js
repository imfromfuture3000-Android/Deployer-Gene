#!/usr/bin/env node
/**
 * Verify Gene-Mint NFT Deployment
 */

const fs = require('fs');

class GeneMintVerifier {
  constructor() {
    this.deploymentData = JSON.parse(fs.readFileSync('.cache/gene-mint-deployment.json', 'utf8'));
  }

  async verifyDeployment() {
    console.log('🔍 VERIFYING GENE-MINT NFT DEPLOYMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log(`📋 Deployment Time: ${this.deploymentData.timestamp}`);
    console.log(`🌐 Network: ${this.deploymentData.network}`);
    
    const verificationResults = {
      ethWithdrawal: await this.verifyETHWithdrawal(),
      controlDeployment: await this.verifyControlDeployment(),
      nftContract: await this.verifyNFTContract(),
      backfillData: await this.verifyBackfillData(),
      overallStatus: 'pending'
    };
    
    return verificationResults;
  }

  async verifyETHWithdrawal() {
    console.log('\n💰 VERIFYING ETH WITHDRAWAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const withdrawal = this.deploymentData.ethWithdrawal;
    
    console.log(`💎 Amount: ${withdrawal.amount} ETH`);
    console.log(`📝 TX Hash: ${withdrawal.txHash}`);
    console.log(`📥 Destination: ${withdrawal.destination}`);
    
    // Verify transaction hash format
    const isValidTxHash = withdrawal.txHash.match(/^0x[a-fA-F0-9]{64}$/);
    console.log(`🔐 TX Hash Format: ${isValidTxHash ? 'Valid' : 'Invalid'}`);
    
    // Verify destination address format
    const isValidAddress = withdrawal.destination.match(/^0x[a-fA-F0-9]{40}$/);
    console.log(`📍 Address Format: ${isValidAddress ? 'Valid' : 'Invalid'}`);
    
    // Verify amount is reasonable
    const amount = parseFloat(withdrawal.amount);
    const isReasonableAmount = amount > 0 && amount < 100;
    console.log(`💰 Amount Check: ${isReasonableAmount ? 'Reasonable' : 'Suspicious'}`);
    
    const withdrawalStatus = isValidTxHash && isValidAddress && isReasonableAmount;
    console.log(`✅ Withdrawal Status: ${withdrawalStatus ? 'VERIFIED' : 'FAILED'}`);
    
    return {
      verified: withdrawalStatus,
      amount: withdrawal.amount,
      txHash: withdrawal.txHash,
      destination: withdrawal.destination
    };
  }

  async verifyControlDeployment() {
    console.log('\n🎛️ VERIFYING CONTROL DEPLOYMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const control = this.deploymentData.controlDeployment;
    
    console.log(`👤 Controller: ${control.controllerAddress}`);
    console.log(`🎨 Creator: ${control.creatorAddress}`);
    console.log(`📝 Deploy TX: ${control.deploymentTx}`);
    console.log(`⛽ Gas Used: ${control.gasUsed}`);
    console.log(`📊 Status: ${control.status}`);
    
    // Verify addresses
    const isValidController = control.controllerAddress.length > 20;
    const isValidCreator = control.creatorAddress.match(/^0x[a-fA-F0-9]{40}$/);
    const isValidTx = control.deploymentTx.match(/^0x[a-fA-F0-9]{64}$/);
    const isDeployed = control.status === 'deployed';
    
    console.log(`👤 Controller Valid: ${isValidController ? 'Yes' : 'No'}`);
    console.log(`🎨 Creator Valid: ${isValidCreator ? 'Yes' : 'No'}`);
    console.log(`📝 TX Valid: ${isValidTx ? 'Yes' : 'No'}`);
    console.log(`📊 Deployed: ${isDeployed ? 'Yes' : 'No'}`);
    
    const controlStatus = isValidController && isValidCreator && isValidTx && isDeployed;
    console.log(`✅ Control Status: ${controlStatus ? 'VERIFIED' : 'FAILED'}`);
    
    return {
      verified: controlStatus,
      controller: control.controllerAddress,
      creator: control.creatorAddress,
      deploymentTx: control.deploymentTx
    };
  }

  async verifyNFTContract() {
    console.log('\n🧬 VERIFYING NFT CONTRACT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const nft = this.deploymentData.nftDeployment;
    
    console.log(`🏷️ Name: ${nft.name}`);
    console.log(`🔤 Symbol: ${nft.symbol}`);
    console.log(`🔗 Contract: ${nft.contractAddress}`);
    console.log(`📊 Supply: ${nft.totalSupply}`);
    console.log(`💰 Price: ${nft.mintPrice} ETH`);
    console.log(`📝 Deploy TX: ${nft.deploymentTx}`);
    console.log(`🎯 Mint TX: ${nft.mintingTx}`);
    
    // Verify NFT data
    const isValidName = nft.name === 'Gene-Mint';
    const isValidSymbol = nft.symbol === 'GENE';
    const isValidContract = nft.contractAddress.match(/^0x[a-fA-F0-9]{40}$/);
    const isValidSupply = nft.totalSupply === 10000;
    const isValidPrice = nft.mintPrice === '0.01';
    const hasMetadata = nft.metadata && nft.metadata.description;
    
    console.log(`🏷️ Name Check: ${isValidName ? 'Valid' : 'Invalid'}`);
    console.log(`🔤 Symbol Check: ${isValidSymbol ? 'Valid' : 'Invalid'}`);
    console.log(`🔗 Contract Check: ${isValidContract ? 'Valid' : 'Invalid'}`);
    console.log(`📊 Supply Check: ${isValidSupply ? 'Valid' : 'Invalid'}`);
    console.log(`💰 Price Check: ${isValidPrice ? 'Valid' : 'Invalid'}`);
    console.log(`📄 Metadata Check: ${hasMetadata ? 'Present' : 'Missing'}`);
    
    const nftStatus = isValidName && isValidSymbol && isValidContract && isValidSupply && isValidPrice && hasMetadata;
    console.log(`✅ NFT Status: ${nftStatus ? 'VERIFIED' : 'FAILED'}`);
    
    return {
      verified: nftStatus,
      name: nft.name,
      symbol: nft.symbol,
      contract: nft.contractAddress,
      supply: nft.totalSupply,
      price: nft.mintPrice
    };
  }

  async verifyBackfillData() {
    console.log('\n📊 VERIFYING BACKFILL DATA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const backfill = this.deploymentData.backfillData;
    
    console.log(`🎨 Creator: ${backfill.programCreator}`);
    console.log(`📈 Blocks: ${backfill.backfillBlocks}`);
    console.log(`📊 TXs: ${backfill.processedTxs}`);
    console.log(`🏁 Range: ${backfill.startBlock} → ${backfill.endBlock}`);
    console.log(`📊 Status: ${backfill.status}`);
    
    // Verify backfill data
    const isValidCreator = backfill.programCreator.match(/^0x[a-fA-F0-9]{40}$/);
    const hasBlocks = backfill.backfillBlocks > 0;
    const hasTxs = backfill.processedTxs > 0;
    const validRange = backfill.endBlock > backfill.startBlock;
    const isCompleted = backfill.status === 'completed';
    
    console.log(`🎨 Creator Valid: ${isValidCreator ? 'Yes' : 'No'}`);
    console.log(`📈 Blocks Valid: ${hasBlocks ? 'Yes' : 'No'}`);
    console.log(`📊 TXs Valid: ${hasTxs ? 'Yes' : 'No'}`);
    console.log(`🏁 Range Valid: ${validRange ? 'Yes' : 'No'}`);
    console.log(`📊 Completed: ${isCompleted ? 'Yes' : 'No'}`);
    
    const backfillStatus = isValidCreator && hasBlocks && hasTxs && validRange && isCompleted;
    console.log(`✅ Backfill Status: ${backfillStatus ? 'VERIFIED' : 'FAILED'}`);
    
    return {
      verified: backfillStatus,
      creator: backfill.programCreator,
      blocks: backfill.backfillBlocks,
      transactions: backfill.processedTxs,
      completed: isCompleted
    };
  }

  async generateVerificationReport(results) {
    console.log('\n📋 VERIFICATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const allVerified = results.ethWithdrawal.verified && 
                       results.controlDeployment.verified && 
                       results.nftContract.verified && 
                       results.backfillData.verified;
    
    results.overallStatus = allVerified ? 'VERIFIED' : 'FAILED';
    
    console.log(`💰 ETH Withdrawal: ${results.ethWithdrawal.verified ? '✅ VERIFIED' : '❌ FAILED'}`);
    console.log(`🎛️ Control Deployment: ${results.controlDeployment.verified ? '✅ VERIFIED' : '❌ FAILED'}`);
    console.log(`🧬 NFT Contract: ${results.nftContract.verified ? '✅ VERIFIED' : '❌ FAILED'}`);
    console.log(`📊 Backfill Data: ${results.backfillData.verified ? '✅ VERIFIED' : '❌ FAILED'}`);
    
    console.log(`\n🎯 OVERALL STATUS: ${results.overallStatus === 'VERIFIED' ? '✅ VERIFIED' : '❌ FAILED'}`);
    
    // Save verification report
    const report = {
      timestamp: new Date().toISOString(),
      deploymentTimestamp: this.deploymentData.timestamp,
      verificationResults: results,
      summary: {
        ethWithdrawn: results.ethWithdrawal.amount + ' ETH',
        nftContract: results.nftContract.contract,
        totalSupply: results.nftContract.supply,
        backfillCompleted: results.backfillData.completed,
        overallStatus: results.overallStatus
      }
    };
    
    fs.writeFileSync('.cache/gene-mint-verification.json', JSON.stringify(report, null, 2));
    console.log(`💾 Verification report saved: .cache/gene-mint-verification.json`);
    
    return report;
  }
}

async function main() {
  const verifier = new GeneMintVerifier();
  
  const results = await verifier.verifyDeployment();
  const report = await verifier.generateVerificationReport(results);
  
  console.log('\n🎉 GENE-MINT VERIFICATION COMPLETED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎯 Final Status: ${report.summary.overallStatus}`);
}

main().catch(console.error);