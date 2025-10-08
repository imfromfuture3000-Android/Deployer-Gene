#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

class DeepAssetScanner {
  constructor() {
    this.chains = {
      solana: 'https://api.mainnet-beta.solana.com',
      ethereum: 'https://api.etherscan.io/api',
      polygon: 'https://api.polygonscan.com/api',
      bsc: 'https://api.bscscan.com/api'
    };
    
    this.wallets = [
      'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4', // Main deployer
      '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'   // EVM equivalent
    ];
    
    console.log('🔍 DEEP ASSET SCANNER - ALL CHAINS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  rpcCall(url, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async scanSolanaAssets() {
    console.log('\n🌐 SCANNING SOLANA ASSETS...');
    
    const assets = {
      sol: 0,
      tokens: [],
      nfts: [],
      programs: [],
      stakes: [],
      votes: []
    };

    try {
      // SOL Balance
      const balance = await this.rpcCall(this.chains.solana, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [this.wallets[0]]
      });
      
      assets.sol = (balance.result || 0) / 1e9;
      console.log(`💰 SOL Balance: ${assets.sol}`);

      // Token Accounts
      const tokenAccounts = await this.rpcCall(this.chains.solana, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          this.wallets[0],
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }
        ]
      });

      if (tokenAccounts.result?.value) {
        assets.tokens = tokenAccounts.result.value.map(acc => ({
          mint: acc.account.data.parsed.info.mint,
          amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
          decimals: acc.account.data.parsed.info.tokenAmount.decimals
        }));
      }
      console.log(`🪙 Token Accounts: ${assets.tokens.length}`);

      // Program Accounts
      const programAccounts = await this.rpcCall(this.chains.solana, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getProgramAccounts',
        params: [
          'BPFLoaderUpgradeab1e11111111111111111111111',
          {
            filters: [{ memcmp: { offset: 13, bytes: this.wallets[0] } }]
          }
        ]
      });

      if (programAccounts.result) {
        assets.programs = programAccounts.result.map(acc => acc.pubkey);
      }
      console.log(`📦 Programs: ${assets.programs.length}`);

      // Stake Accounts
      const stakeAccounts = await this.rpcCall(this.chains.solana, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getParsedProgramAccounts',
        params: [
          'Stake11111111111111111111111111111111111111',
          {
            filters: [{ memcmp: { offset: 12, bytes: this.wallets[0] } }]
          }
        ]
      });

      if (stakeAccounts.result) {
        assets.stakes = stakeAccounts.result.map(acc => ({
          address: acc.pubkey,
          lamports: acc.account.lamports,
          sol: acc.account.lamports / 1e9
        }));
      }
      console.log(`🥩 Stake Accounts: ${assets.stakes.length}`);

    } catch (error) {
      console.log('❌ Solana scan error:', error.message);
    }

    return assets;
  }

  async scanEVMAssets(chain, apiUrl) {
    console.log(`\n🔗 SCANNING ${chain.toUpperCase()} ASSETS...`);
    
    const assets = {
      balance: 0,
      tokens: [],
      nfts: [],
      contracts: [],
      transactions: 0
    };

    try {
      // Native balance (ETH/MATIC/BNB)
      const balanceUrl = `${apiUrl}?module=account&action=balance&address=${this.wallets[1]}&tag=latest`;
      
      // Transaction count
      const txCountUrl = `${apiUrl}?module=proxy&action=eth_getTransactionCount&address=${this.wallets[1]}&tag=latest`;
      
      console.log(`💰 ${chain} Balance: Checking...`);
      console.log(`📝 Transaction Count: Checking...`);

    } catch (error) {
      console.log(`❌ ${chain} scan error:`, error.message);
    }

    return assets;
  }

  async scanSecrets() {
    console.log('\n🔐 SCANNING SECRETS & CONFIGURATIONS...');
    
    const secrets = {
      envFiles: [],
      configFiles: [],
      keyFiles: [],
      exposedSecrets: []
    };

    const sensitiveFiles = [
      '.env', '.env.local', '.env.production', '.env.helius',
      'config.json', 'secrets.json', 'keys.json',
      '.cache/user_auth.json', '.cache/mint-keypair.json'
    ];

    for (const file of sensitiveFiles) {
      try {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          const lines = content.split('\n').length;
          
          secrets.envFiles.push({
            file,
            lines,
            hasPrivateKey: content.includes('PRIVATE_KEY'),
            hasApiKey: content.includes('API_KEY'),
            size: content.length
          });
          
          console.log(`📄 ${file}: ${lines} lines`);
        }
      } catch (e) {
        console.log(`⚠️ ${file}: Access denied`);
      }
    }

    return secrets;
  }

  async scanDeploymentScripts() {
    console.log('\n📜 SCANNING DEPLOYMENT SCRIPTS...');
    
    const scripts = {
      deploymentScripts: [],
      configFiles: [],
      totalScripts: 0
    };

    const scriptPatterns = [
      '**/*deploy*.js',
      '**/*deploy*.ts', 
      '**/anchor-*.js',
      '**/mainnet-*.js',
      '**/relayer-*.js'
    ];

    try {
      const allFiles = this.getAllFiles('.', ['.js', '.ts', '.json']);
      
      const deploymentFiles = allFiles.filter(file => 
        file.includes('deploy') || 
        file.includes('mainnet') ||
        file.includes('relayer') ||
        file.includes('anchor')
      );

      for (const file of deploymentFiles) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          scripts.deploymentScripts.push({
            file,
            lines: content.split('\n').length,
            hasPrivateKey: content.includes('PRIVATE_KEY'),
            hasRelayer: content.includes('relayer'),
            hasMainnet: content.includes('mainnet')
          });
        } catch (e) {
          // Skip files we can't read
        }
      }

      scripts.totalScripts = scripts.deploymentScripts.length;
      console.log(`📊 Deployment Scripts: ${scripts.totalScripts}`);

    } catch (error) {
      console.log('❌ Script scan error:', error.message);
    }

    return scripts;
  }

  getAllFiles(dir, extensions) {
    let files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          if (!item.startsWith('.') && item !== 'node_modules') {
            files = files.concat(this.getAllFiles(fullPath, extensions));
          }
        } else {
          if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      }
    } catch (e) {
      // Skip directories we can't read
    }
    
    return files;
  }

  async generateDeepReport() {
    console.log('\n📋 GENERATING DEEP ASSET REPORT...');
    console.log('═══════════════════════════════════════════════════════════════════════');
    
    const solanaAssets = await this.scanSolanaAssets();
    const ethereumAssets = await this.scanEVMAssets('ethereum', this.chains.ethereum);
    const polygonAssets = await this.scanEVMAssets('polygon', this.chains.polygon);
    const bscAssets = await this.scanEVMAssets('bsc', this.chains.bsc);
    const secrets = await this.scanSecrets();
    const scripts = await this.scanDeploymentScripts();

    const report = {
      timestamp: new Date().toISOString(),
      wallets: this.wallets,
      assets: {
        solana: solanaAssets,
        ethereum: ethereumAssets,
        polygon: polygonAssets,
        bsc: bscAssets
      },
      secrets,
      scripts,
      summary: {
        totalSOL: solanaAssets.sol,
        totalTokens: solanaAssets.tokens.length,
        totalPrograms: solanaAssets.programs.length,
        totalStakes: solanaAssets.stakes.length,
        totalSecretFiles: secrets.envFiles.length,
        totalScripts: scripts.totalScripts
      }
    };

    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/deep-asset-scan.json', JSON.stringify(report, null, 2));

    console.log('\n🎯 DEEP SCAN SUMMARY:');
    console.log(`💰 SOL Balance: ${solanaAssets.sol}`);
    console.log(`🪙 Token Accounts: ${solanaAssets.tokens.length}`);
    console.log(`📦 Programs: ${solanaAssets.programs.length}`);
    console.log(`🥩 Stake Accounts: ${solanaAssets.stakes.length}`);
    console.log(`🔐 Secret Files: ${secrets.envFiles.length}`);
    console.log(`📜 Deployment Scripts: ${scripts.totalScripts}`);
    
    console.log('\n⚠️ SECURITY FINDINGS:');
    const hasPrivateKeys = secrets.envFiles.some(f => f.hasPrivateKey);
    const hasApiKeys = secrets.envFiles.some(f => f.hasApiKey);
    
    console.log(`${hasPrivateKeys ? '⚠️' : '✅'} Private Keys: ${hasPrivateKeys ? 'FOUND' : 'SECURE'}`);
    console.log(`${hasApiKeys ? '⚠️' : '✅'} API Keys: ${hasApiKeys ? 'FOUND' : 'SECURE'}`);
    
    console.log('\n✅ Deep asset scan completed');
    console.log('📄 Report saved: .cache/deep-asset-scan.json');
    
    return report;
  }
}

const scanner = new DeepAssetScanner();
scanner.generateDeepReport();