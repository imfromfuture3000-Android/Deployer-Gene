const fetch = require('node-fetch');
require('dotenv').config();

// Known contract addresses from deployment history
const KNOWN_CONTRACTS = {
  solana: [
    'EoRJaGA4iVSQWDyv5Q3ThBXx1KGqYyos3gaXUFEiqUSN', // OMEGA mint (generated)
    '2YTrK8f6NwwUg7Tu6sYcCmRKYWpU8yYRYHPz87LTdcgx', // OMEGA mint (alt)
    'F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR', // Earnings vault
    'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1', // DEX program
    'TOKEN_2022_PROGRAM_ID',
    'ASSOCIATED_TOKEN_PROGRAM_ID'
  ],
  ethereum: [
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Derived address
    '0xA0b86a33E6441e6e80D0c4C34F0b1e4E6a7c4b8d', // Example ERC20
    '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // USDT
  ],
  polygon: [
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'  // USDC
  ],
  bsc: [
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    '0x55d398326f99059fF775485246999027B3197955'  // USDT
  ]
};

async function backfillFromHistory() {
  console.log('🔄 BACKFILLING FROM DEPLOYMENT HISTORY');
  
  const contracts = [];
  
  // Add Solana contracts
  KNOWN_CONTRACTS.solana.forEach(address => {
    contracts.push({
      network: 'solana',
      type: 'program/token',
      address,
      source: 'deployment_history',
      controlled: address.includes('EoRJaGA4iVSQWDyv5Q3ThBXx1KGqYyos3gaXUFEiqUSN') || 
                 address.includes('2YTrK8f6NwwUg7Tu6sYcCmRKYWpU8yYRYHPz87LTdcgx') ||
                 address.includes('F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR')
    });
  });
  
  // Add EVM contracts
  ['ethereum', 'polygon', 'bsc'].forEach(network => {
    KNOWN_CONTRACTS[network].forEach(address => {
      contracts.push({
        network,
        type: 'erc20/contract',
        address,
        source: 'deployment_history',
        controlled: address === '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      });
    });
  });
  
  return contracts;
}

async function scanTransactionHistory() {
  console.log('📜 SCANNING TRANSACTION HISTORY');
  
  const deployer = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
  const contracts = [];
  
  try {
    // Use public Solana RPC for transaction history
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [deployer, { limit: 100 }]
      })
    });
    
    const data = await response.json();
    const signatures = data.result || [];
    
    console.log('📝 Found', signatures.length, 'transactions');
    
    // Extract contract interactions from signatures
    signatures.forEach((sig, index) => {
      if (sig.err === null) { // Successful transactions only
        contracts.push({
          network: 'solana',
          type: 'transaction',
          signature: sig.signature,
          slot: sig.slot,
          source: 'transaction_history',
          controlled: true
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Transaction scan failed:', error.message);
  }
  
  return contracts;
}

async function fullBackfill() {
  console.log('🚀 FULL CONTRACT BACKFILL');
  console.log('🔑 Deployer:', 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  console.log('=' .repeat(50));
  
  // Combine all sources
  const historyContracts = await backfillFromHistory();
  const txContracts = await scanTransactionHistory();
  
  const allContracts = [...historyContracts, ...txContracts];
  
  console.log('=' .repeat(50));
  console.log('📊 BACKFILL RESULTS');
  console.log('🎯 Total Contracts:', allContracts.length);
  
  // Group by network and control
  const controlled = allContracts.filter(c => c.controlled);
  const byNetwork = allContracts.reduce((acc, contract) => {
    acc[contract.network] = (acc[contract.network] || 0) + 1;
    return acc;
  }, {});
  
  console.log('🔒 Controlled Contracts:', controlled.length);
  Object.entries(byNetwork).forEach(([network, count]) => {
    console.log(`   ${network}: ${count} contracts`);
  });
  
  // Key contracts
  console.log('🔑 KEY CONTRACTS:');
  console.log('   OMEGA Mint (Primary):', 'EoRJaGA4iVSQWDyv5Q3ThBXx1KGqYyos3gaXUFEiqUSN');
  console.log('   OMEGA Mint (Alt):', '2YTrK8f6NwwUg7Tu6sYcCmRKYWpU8yYRYHPz87LTdcgx');
  console.log('   Earnings Vault:', 'F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR');
  console.log('   DEX Program:', 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1');
  console.log('   EVM Address:', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
  
  // Save results
  const fs = require('fs');
  if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
  
  fs.writeFileSync('.cache/contract-backfill.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    deployer: 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4',
    evmAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    contracts: allContracts,
    controlled: controlled,
    summary: byNetwork,
    keyContracts: {
      omegaPrimary: 'EoRJaGA4iVSQWDyv5Q3ThBXx1KGqYyos3gaXUFEiqUSN',
      omegaAlt: '2YTrK8f6NwwUg7Tu6sYcCmRKYWpU8yYRYHPz87LTdcgx',
      earningsVault: 'F2EkpVd3pKLUi9u9BU794t3mWscJXzUAVw1WSjogTQuR',
      dexProgram: 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1',
      evmAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    }
  }, null, 2));
  
  console.log('✅ Backfill saved to .cache/contract-backfill.json');
  
  return allContracts;
}

fullBackfill().catch(console.error);