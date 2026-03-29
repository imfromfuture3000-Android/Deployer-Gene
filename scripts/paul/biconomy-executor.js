#!/usr/bin/env node

/**
 * BICONOMY TRANSACTION EXECUTOR
 * Uses ETH private key for signing gasless transactions
 */

require('dotenv').config({ path: '/workspaces/Deployer-Gene/.env.local' });
const { ethers } = require('ethers');
const fetch = require('node-fetch');

class BiconomyExecutor {
  constructor() {
    this.privateKey = process.env.ETH_BICONOMY_SIGNER;
    this.apiKey = process.env.BICONOMY_API_KEY;
    this.projectId = process.env.BICONOMY_PROJECT_ID;
    
    if (!this.privateKey) {
      throw new Error('ETH_BICONOMY_SIGNER not found in .env.local');
    }
    
    // Create wallet from private key
    this.wallet = new ethers.Wallet(this.privateKey);
    this.ownerAddress = this.wallet.address;
    
    console.log(`✓ Wallet initialized: ${this.ownerAddress}`);
  }

  async executeVaultDeposit(params = {}) {
    const {
      srcChainId = 8453,  // Base
      srcToken = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',  // USDC
      dstChainId = 8453,
      dstVault = '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB',  // AAVE vault
      amount = '1000000000',  // 1,000 USDC
      slippage = 0.01
    } = params;

    console.log('\n🔄 Requesting quote from Biconomy...');
    
    // Step 1: Get quote
    const quote = await fetch('https://api.biconomy.io/v1/quote', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify({
        mode: 'eoa',
        ownerAddress: this.ownerAddress,
        composeFlows: [{
          type: '/instructions/intent-vault',
          data: {
            srcChainId,
            srcToken,
            dstChainId,
            dstVault,
            amount,
            slippage
          }
        }]
      })
    }).then(r => r.json());

    if (quote.error) {
      throw new Error(`Quote failed: ${quote.error}`);
    }

    console.log('✓ Quote received');
    console.log(`  Amount: ${amount}`);
    console.log(`  Vault: ${dstVault}`);

    // Step 2: Sign the typed data
    console.log('\n✍️  Signing transaction...');
    const signature = await this.wallet.signTypedData(
      quote.typedDataToSign.domain,
      quote.typedDataToSign.types,
      quote.typedDataToSign.message
    );

    console.log('✓ Transaction signed');

    // Step 3: Execute
    console.log('\n🚀 Executing transaction...');
    const result = await fetch('https://api.biconomy.io/v1/execute', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify({
        signedQuote: quote,
        signature
      })
    }).then(r => r.json());

    if (result.error) {
      throw new Error(`Execution failed: ${result.error}`);
    }

    console.log('✓ Transaction executed');
    console.log(`\n📊 Track at: https://meescan.biconomy.io/details/${result.supertxHash}`);

    return {
      supertxHash: result.supertxHash,
      trackingUrl: `https://meescan.biconomy.io/details/${result.supertxHash}`,
      quote,
      result
    };
  }

  async executeCustomIntent(intentData) {
    console.log('\n🔄 Requesting custom intent quote...');
    
    const quote = await fetch('https://api.biconomy.io/v1/quote', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify({
        mode: 'eoa',
        ownerAddress: this.ownerAddress,
        composeFlows: [intentData]
      })
    }).then(r => r.json());

    if (quote.error) {
      throw new Error(`Quote failed: ${quote.error}`);
    }

    console.log('✓ Quote received');

    const signature = await this.wallet.signTypedData(
      quote.typedDataToSign.domain,
      quote.typedDataToSign.types,
      quote.typedDataToSign.message
    );

    console.log('✓ Transaction signed');

    const result = await fetch('https://api.biconomy.io/v1/execute', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify({
        signedQuote: quote,
        signature
      })
    }).then(r => r.json());

    if (result.error) {
      throw new Error(`Execution failed: ${result.error}`);
    }

    console.log('✓ Transaction executed');
    console.log(`\n📊 Track at: https://meescan.biconomy.io/details/${result.supertxHash}`);

    return {
      supertxHash: result.supertxHash,
      trackingUrl: `https://meescan.biconomy.io/details/${result.supertxHash}`,
      result
    };
  }

  getWalletInfo() {
    return {
      address: this.ownerAddress,
      apiKey: this.apiKey ? 'configured' : 'missing',
      projectId: this.projectId
    };
  }
}

// Demo execution
async function main() {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║         BICONOMY GASLESS TRANSACTION EXECUTOR                  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const executor = new BiconomyExecutor();
    
    console.log('📋 Wallet Info:');
    const info = executor.getWalletInfo();
    console.log(`  Address: ${info.address}`);
    console.log(`  API Key: ${info.apiKey}`);
    console.log(`  Project: ${info.projectId}`);

    // Example: Execute vault deposit
    // Uncomment to run actual transaction
    /*
    const result = await executor.executeVaultDeposit({
      amount: '1000000000',  // 1,000 USDC
      slippage: 0.01
    });
    
    console.log('\n✅ Transaction Complete!');
    console.log(`   Hash: ${result.supertxHash}`);
    console.log(`   URL: ${result.trackingUrl}`);
    */

    console.log('\n✅ Executor ready for transactions');
    console.log('\nTo execute a transaction, call:');
    console.log('  executor.executeVaultDeposit({ amount: "1000000000" })');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = BiconomyExecutor;
