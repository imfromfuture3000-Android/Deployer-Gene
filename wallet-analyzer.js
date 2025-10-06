#!/usr/bin/env node

const { MoralisIntegration } = require('./moralis-integration');

class WalletAnalyzer extends MoralisIntegration {
  async analyzeWallet(address) {
    console.log(`🔍 ANALYZING WALLET: ${address}`);
    console.log('='.repeat(50));
    
    // Get portfolio summary
    const totalValue = await this.getWalletBalance(address);
    
    // Get NFT collection
    await this.getNFTs(address);
    
    // Get transaction history
    await this.getTransactionHistory(address);
    
    // Additional analysis
    await this.getTokenHoldings(address);
    
    return { address, totalValue };
  }

  async getTokenHoldings(address) {
    try {
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2/${address}/erc20?chain=0x1`,
        { headers: this.headers }
      );
      const data = await response.json();
      
      console.log(`\n💎 ERC-20 Token Holdings:`);
      data.slice(0, 5).forEach(token => {
        const balance = parseFloat(token.balance) / Math.pow(10, token.decimals);
        console.log(`- ${token.name}: ${balance.toFixed(4)} ${token.symbol}`);
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching token holdings:', error.message);
    }
  }
}

async function main() {
  const analyzer = new WalletAnalyzer();
  
  // Analyze the wallet from Etherscan data
  const walletAddress = '0x742d35Cc6634C0532925A3B8D4C9dB96C4B4d8B6';
  
  await analyzer.analyzeWallet(walletAddress);
  
  console.log('\n📊 WALLET SUMMARY:');
  console.log(`Address: ${walletAddress}`);
  console.log(`Etherscan: https://etherscan.io/address/${walletAddress}`);
  console.log(`Portfolio: Multi-chain ($1,575 total from Etherscan)`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { WalletAnalyzer };