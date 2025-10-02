const fetch = require('node-fetch');
require('dotenv').config();

const QUICKNODE_ENDPOINTS = {
  solana: 'https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e',
  ethereum: 'https://cosmopolitan-divine-glade.ethereum-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e',
  polygon: 'https://cosmopolitan-divine-glade.polygon-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e',
  bsc: 'https://cosmopolitan-divine-glade.bsc-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e'
};

const DEPLOYER_ADDRESS = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
const ETH_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Derived from Solana key

async function rpcCall(endpoint, method, params = []) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    })
  });
  return (await response.json()).result;
}

async function scanSolana() {
  console.log('🔍 SCANNING SOLANA ACCOUNT');
  
  try {
    // Get account info
    const accountInfo = await rpcCall(QUICKNODE_ENDPOINTS.solana, 'getAccountInfo', [DEPLOYER_ADDRESS]);
    console.log('📊 Account Balance:', accountInfo?.lamports / 1e9 || 0, 'SOL');
    
    // Get token accounts
    const tokenAccounts = await rpcCall(QUICKNODE_ENDPOINTS.solana, 'getTokenAccountsByOwner', [
      DEPLOYER_ADDRESS,
      { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }
    ]);
    
    console.log('🪙 Token Accounts:', tokenAccounts?.value?.length || 0);
    
    // Get NFTs using qn_fetchNFTs
    const nfts = await rpcCall(QUICKNODE_ENDPOINTS.solana, 'qn_fetchNFTs', [{
      wallet: DEPLOYER_ADDRESS,
      omitMetadata: false,
      page: 1,
      perPage: 100
    }]);
    
    console.log('🖼️ NFTs Found:', nfts?.assets?.length || 0);
    
    return {
      balance: accountInfo?.lamports / 1e9 || 0,
      tokenAccounts: tokenAccounts?.value || [],
      nfts: nfts?.assets || []
    };
    
  } catch (error) {
    console.error('❌ Solana scan failed:', error.message);
    return null;
  }
}

async function scanEVM(network, endpoint) {
  console.log(`🔍 SCANNING ${network.toUpperCase()}`);
  
  try {
    // Get ETH balance
    const balance = await rpcCall(endpoint, 'eth_getBalance', [ETH_ADDRESS, 'latest']);
    console.log('💰 Balance:', parseInt(balance, 16) / 1e18, network === 'ethereum' ? 'ETH' : network.toUpperCase());
    
    // Get transaction count
    const txCount = await rpcCall(endpoint, 'eth_getTransactionCount', [ETH_ADDRESS, 'latest']);
    console.log('📝 Transaction Count:', parseInt(txCount, 16));
    
    // Get NFTs using qn_fetchNFTs
    const nfts = await rpcCall(endpoint, 'qn_fetchNFTs', [{
      wallet: ETH_ADDRESS,
      omitMetadata: false,
      page: 1,
      perPage: 100
    }]);
    
    console.log('🖼️ NFTs Found:', nfts?.assets?.length || 0);
    
    // Get ERC20 tokens using qn_getWalletTokenBalance
    const tokens = await rpcCall(endpoint, 'qn_getWalletTokenBalance', [{
      wallet: ETH_ADDRESS
    }]);
    
    console.log('🪙 ERC20 Tokens:', tokens?.result?.length || 0);
    
    return {
      network,
      balance: parseInt(balance, 16) / 1e18,
      txCount: parseInt(txCount, 16),
      nfts: nfts?.assets || [],
      tokens: tokens?.result || []
    };
    
  } catch (error) {
    console.error(`❌ ${network} scan failed:`, error.message);
    return null;
  }
}

async function backfillContracts() {
  console.log('🔄 BACKFILLING CONTRACT ADDRESSES');
  
  const contracts = [];
  
  // Scan all networks
  const solanaData = await scanSolana();
  if (solanaData) {
    // Extract mint addresses from token accounts
    solanaData.tokenAccounts.forEach(account => {
      const mintAddress = account.account.data.parsed.info.mint;
      contracts.push({
        network: 'solana',
        type: 'token',
        address: mintAddress,
        balance: account.account.data.parsed.info.tokenAmount.uiAmount
      });
    });
    
    // Add NFT mint addresses
    solanaData.nfts.forEach(nft => {
      contracts.push({
        network: 'solana',
        type: 'nft',
        address: nft.mint,
        name: nft.name
      });
    });
  }
  
  // Scan EVM networks
  for (const [network, endpoint] of Object.entries(QUICKNODE_ENDPOINTS)) {
    if (network === 'solana') continue;
    
    const evmData = await scanEVM(network, endpoint);
    if (evmData) {
      // Add token contracts
      evmData.tokens.forEach(token => {
        contracts.push({
          network,
          type: 'erc20',
          address: token.address,
          symbol: token.symbol,
          balance: token.totalBalance
        });
      });
      
      // Add NFT contracts
      evmData.nfts.forEach(nft => {
        contracts.push({
          network,
          type: 'nft',
          address: nft.collectionAddress,
          tokenId: nft.tokenId,
          name: nft.name
        });
      });
    }
  }
  
  return contracts;
}

async function fullScan() {
  console.log('🚀 QUICKNODE FULL ACCOUNT SCAN');
  console.log('🔑 Solana Address:', DEPLOYER_ADDRESS);
  console.log('🔑 EVM Address:', ETH_ADDRESS);
  console.log('=' .repeat(50));
  
  const contracts = await backfillContracts();
  
  console.log('=' .repeat(50));
  console.log('📊 SCAN RESULTS');
  console.log('🎯 Total Contracts Found:', contracts.length);
  
  // Group by network
  const byNetwork = contracts.reduce((acc, contract) => {
    acc[contract.network] = (acc[contract.network] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(byNetwork).forEach(([network, count]) => {
    console.log(`   ${network}: ${count} contracts`);
  });
  
  // Save results
  const fs = require('fs');
  if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
  
  fs.writeFileSync('.cache/quicknode-scan.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    deployer: DEPLOYER_ADDRESS,
    evmAddress: ETH_ADDRESS,
    contracts,
    summary: byNetwork
  }, null, 2));
  
  console.log('✅ Results saved to .cache/quicknode-scan.json');
  
  return contracts;
}

fullScan().catch(console.error);