#!/usr/bin/env node

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjE2MjU2YzgxLWNlMDctNGNkMS1hNTYwLTU4ODI2MmZmZGIzYSIsIm9yZ0lkIjoiNDc0MzY4IiwidXNlcklkIjoiNDg4MDAzIiwidHlwZUlkIjoiNTM0OGY0YjItN2M2OC00ODgxLWJmZTMtMzU0MzM0NGE2YjhmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk3MzgzNDMsImV4cCI6NDkxNTQ5ODM0M30.QBahMKc7uaxlqFSWZkhJB3H560iNZxb1gpxkW7EQEck';

class MoralisIntegration {
  constructor() {
    this.headers = {
      'accept': 'application/json',
      'X-API-Key': MORALIS_API_KEY
    };
    
    this.networks = [
      {"name":"Ethereum","id":"0x1","wrappedTokenAddress":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"},
      {"name":"Polygon","id":"0x89","wrappedTokenAddress":"0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"},
      {"name":"Binance","id":"0x38","wrappedTokenAddress":"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"},
      {"name":"Avalanche","id":"0xa86a","wrappedTokenAddress":"0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"},
      {"name":"Fantom","id":"0xfa","wrappedTokenAddress":"0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"},
      {"name":"Cronos","id":"0x19","wrappedTokenAddress":"0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23"}
    ];
  }

  async getWalletBalance(address) {
    console.log(`🔍 Checking balance for: ${address}`);
    let totalValue = 0;
    
    for (const network of this.networks) {
      try {
        const balance = await fetch(
          `https://deep-index.moralis.io/api/v2/${address}/balance?chain=${network.id}`,
          { headers: this.headers }
        ).then(res => res.json());

        const tokenPrice = await fetch(
          `https://deep-index.moralis.io/api/v2/erc20/${network.wrappedTokenAddress}/price?chain=${network.id}`,
          { headers: this.headers }
        ).then(res => res.json());

        const balanceEth = balance.balance / 1e18;
        const value = balanceEth * tokenPrice.usdPrice;
        totalValue += value;

        console.log(`${network.name}: ${balanceEth.toFixed(3)} ${tokenPrice.nativePrice.symbol} ($${value.toFixed(2)})`);
      } catch (error) {
        console.error(`Error fetching ${network.name}:`, error.message);
      }
    }
    
    console.log(`💰 Total Portfolio Value: $${totalValue.toLocaleString()}`);
    return totalValue;
  }

  async getNFTs(address, chain = '0x1') {
    try {
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chain}&format=decimal`,
        { headers: this.headers }
      );
      const data = await response.json();
      
      console.log(`🖼️ NFTs found: ${data.total}`);
      data.result.slice(0, 5).forEach(nft => {
        console.log(`- ${nft.name || 'Unnamed'} (${nft.token_id})`);
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching NFTs:', error.message);
    }
  }

  async getTransactionHistory(address, chain = '0x1') {
    try {
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2/${address}?chain=${chain}`,
        { headers: this.headers }
      );
      const data = await response.json();
      
      console.log(`📊 Recent transactions: ${data.result.length}`);
      data.result.slice(0, 3).forEach(tx => {
        console.log(`- ${tx.hash.substring(0, 10)}... (${tx.value / 1e18} ETH)`);
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
    }
  }
}

async function main() {
  const moralis = new MoralisIntegration();
  const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  
  console.log('🚀 MORALIS INTEGRATION SETUP');
  console.log('============================');
  
  await moralis.getWalletBalance(testAddress);
  await moralis.getNFTs(testAddress);
  await moralis.getTransactionHistory(testAddress);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MoralisIntegration };