#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
require('dotenv').config();

const connection = new Connection(process.env.RPC_URL, 'confirmed');

async function scanDeployment() {
  console.log('🔍 DEPLOYMENT SCANNER INITIATED');
  
  try {
    // Read deployment data
    const deployment = JSON.parse(fs.readFileSync('.cache/full-deployment.json', 'utf8'));
    
    console.log(`🪙 Scanning Token: ${deployment.mint}`);
    
    // Check mint info
    const mintInfo = await connection.getParsedAccountInfo(new PublicKey(deployment.mint));
    const mintData = mintInfo.value?.data?.parsed?.info;
    
    console.log(`📊 Supply: ${mintData?.supply || 'Unknown'}`);
    console.log(`🔒 Mint Authority: ${mintData?.mintAuthority || 'Locked'}`);
    console.log(`❄️ Freeze Authority: ${mintData?.freezeAuthority || 'None'}`);
    
    // Check treasury balance
    const treasuryBalance = await connection.getTokenAccountBalance(new PublicKey(deployment.treasury));
    console.log(`💰 Treasury: ${treasuryBalance.value.uiAmount} tokens`);
    
    // Check allowlist distributions
    let totalDistributed = 0;
    for (const addr of deployment.allowlist) {
      try {
        const ata = await connection.getParsedTokenAccountsByOwner(
          new PublicKey(addr),
          { mint: new PublicKey(deployment.mint) }
        );
        
        if (ata.value.length > 0) {
          const balance = ata.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          console.log(`✅ ${addr.slice(0, 8)}: ${balance} tokens`);
          totalDistributed += balance;
        }
      } catch (error) {
        console.log(`⚠️ ${addr.slice(0, 8)}: Check failed`);
      }
    }
    
    console.log(`📈 Total Distributed: ${totalDistributed} tokens`);
    
    // Check MEV rebates
    const rebateBalance = await connection.getBalance(new PublicKey(deployment.rebateAddress));
    console.log(`💎 MEV Rebates: ${(rebateBalance / 1e9).toFixed(6)} SOL`);
    
    const scanReport = {
      timestamp: new Date().toISOString(),
      mint: deployment.mint,
      supply: mintData?.supply,
      mintAuthority: mintData?.mintAuthority,
      treasuryBalance: treasuryBalance.value.uiAmount,
      totalDistributed,
      rebateBalance: rebateBalance / 1e9,
      status: 'active'
    };
    
    fs.writeFileSync('.cache/scan-report.json', JSON.stringify(scanReport, null, 2));
    
    console.log('\n✅ SCAN COMPLETE');
    console.log(`📊 Report saved to .cache/scan-report.json`);
    
    return scanReport;
    
  } catch (error) {
    console.error('❌ Scan failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  scanDeployment().catch(console.error);
}

module.exports = { scanDeployment };