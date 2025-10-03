const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('@solana/spl-token');
const fs = require('fs');
require('dotenv').config();

async function checkTokenBalances() {
  console.log('🔍 CHECKING TOKEN BALANCES');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  const deployer = new PublicKey('zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  
  // Check SOL balance
  const solBalance = await connection.getBalance(deployer);
  console.log('💰 SOL Balance:', solBalance / 1e9, 'SOL');
  
  // Check all token accounts
  const tokenAccounts = await connection.getTokenAccountsByOwner(deployer, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  });
  
  console.log('🪙 Token Accounts Found:', tokenAccounts.value.length);
  
  const tokens = [];
  for (const account of tokenAccounts.value) {
    const accountInfo = await connection.getTokenAccountBalance(account.pubkey);
    const mint = account.account.data.parsed.info.mint;
    
    tokens.push({
      mint,
      balance: accountInfo.value.uiAmount || 0,
      decimals: accountInfo.value.decimals,
      account: account.pubkey.toBase58()
    });
    
    console.log(`   Mint: ${mint}`);
    console.log(`   Balance: ${accountInfo.value.uiAmount || 0}`);
    console.log(`   Account: ${account.pubkey.toBase58()}`);
  }
  
  return { solBalance: solBalance / 1e9, tokens };
}

async function checkRealContracts() {
  console.log('📋 CHECKING REAL CONTRACT ADDRESSES');
  
  const contracts = {
    deployed: [],
    generated: [],
    failed: []
  };
  
  // Check deployment cache files
  const cacheFiles = [
    '.cache/mainnet-deployment.json',
    '.cache/live-deployment.json',
    '.cache/zero-cost-deployment.json'
  ];
  
  cacheFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (data.mintAddress) {
          contracts.deployed.push({
            file,
            mint: data.mintAddress,
            createTx: data.createMintTx || data.mintTxSignature,
            mintTx: data.mintTokensTx || data.vaultMintTx,
            status: 'deployed'
          });
        }
      }
    } catch (error) {
      console.log(`⚠️ Could not read ${file}`);
    }
  });
  
  // Generated addresses from previous runs
  const generatedAddresses = [
    'EoRJaGA4iVSQWDyv5Q3ThBXx1KGqYyos3gaXUFEiqUSN',
    '2YTrK8f6NwwUg7Tu6sYcCmRKYWpU8yYRYHPz87LTdcgx',
    'Cv7VMQ69c69arfYsiAjmTYsdz57BiPkxTXycbyuLYbmJ',
    '42Tra8cwfUyrkyjXkdjvza9wUEHHhy2HRpM1cpmH73i6',
    '9Z4hfVs6eoDhAsUEsp6c6xzCFtVd4Zs7QahUiyAzPE77'
  ];
  
  generatedAddresses.forEach(address => {
    contracts.generated.push({
      mint: address,
      status: 'generated_not_deployed',
      explorer: `https://explorer.solana.com/address/${address}`
    });
  });
  
  return contracts;
}

async function verifyOnChain() {
  console.log('🔗 VERIFYING ON-CHAIN STATUS');
  
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  const contracts = await checkRealContracts();
  
  const verification = [];
  
  // Check generated addresses on-chain
  for (const contract of contracts.generated) {
    try {
      const accountInfo = await connection.getAccountInfo(new PublicKey(contract.mint));
      verification.push({
        mint: contract.mint,
        exists: accountInfo !== null,
        owner: accountInfo?.owner?.toBase58() || 'none',
        status: accountInfo ? 'EXISTS_ON_CHAIN' : 'NOT_DEPLOYED'
      });
      
      console.log(`   ${contract.mint}: ${accountInfo ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    } catch (error) {
      verification.push({
        mint: contract.mint,
        exists: false,
        error: error.message,
        status: 'VERIFICATION_FAILED'
      });
      console.log(`   ${contract.mint}: ❌ VERIFICATION FAILED`);
    }
  }
  
  return verification;
}

async function fullTokenCheck() {
  console.log('🚀 FULL TOKEN & CONTRACT CHECK');
  console.log('🔑 Deployer:', 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
  console.log('=' .repeat(60));
  
  const balances = await checkTokenBalances();
  const contracts = await checkRealContracts();
  const verification = await verifyOnChain();
  
  console.log('=' .repeat(60));
  console.log('📊 SUMMARY:');
  console.log('💰 SOL Balance:', balances.solBalance, 'SOL');
  console.log('🪙 Token Accounts:', balances.tokens.length);
  console.log('📋 Generated Contracts:', contracts.generated.length);
  console.log('✅ Deployed Contracts:', contracts.deployed.length);
  console.log('🔗 On-Chain Verified:', verification.filter(v => v.exists).length);
  
  console.log('🎯 REAL CONTRACT STATUS:');
  if (contracts.deployed.length > 0) {
    contracts.deployed.forEach(contract => {
      console.log(`   ✅ DEPLOYED: ${contract.mint}`);
      console.log(`      Create TX: ${contract.createTx}`);
      console.log(`      Mint TX: ${contract.mintTx}`);
    });
  } else {
    console.log('   ❌ NO REAL CONTRACTS DEPLOYED');
    console.log('   💡 All addresses are generated but not deployed due to 0 SOL balance');
  }
  
  // Save results
  if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
  
  fs.writeFileSync('.cache/token-check.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    deployer: 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4',
    balances,
    contracts,
    verification,
    summary: {
      solBalance: balances.solBalance,
      tokenAccounts: balances.tokens.length,
      generatedContracts: contracts.generated.length,
      deployedContracts: contracts.deployed.length,
      realDeployments: contracts.deployed.length > 0
    }
  }, null, 2));
  
  console.log('💾 Results saved to .cache/token-check.json');
  
  return { balances, contracts, verification };
}

fullTokenCheck().catch(console.error);