#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

class ProgramAssetRetriever {
  constructor() {
    this.quicknodeRpc = process.env.QUICKNODE_SOLANA_URL || 'https://api.mainnet-beta.solana.com';
    this.deployer = 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4';
    
    console.log('📦 PROGRAM ASSET RETRIEVAL - QUICKNODE BACKFILL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Deployer:', this.deployer);
    console.log('🌐 QuickNode RPC:', this.quicknodeRpc.substring(0, 50) + '...');
  }

  rpcCall(method, params = []) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params
      });

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(this.quicknodeRpc, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body).result);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  async retrieveAllPrograms() {
    console.log('\n📦 Retrieving all programs...');
    
    const programs = [];
    
    try {
      // Get program accounts owned by deployer
      const programAccounts = await this.rpcCall('getProgramAccounts', [
        'BPFLoaderUpgradeab1e11111111111111111111111',
        {
          filters: [
            { memcmp: { offset: 13, bytes: this.deployer } }
          ]
        }
      ]);

      if (programAccounts) {
        for (const account of programAccounts) {
          programs.push({
            programId: account.pubkey,
            owner: this.deployer,
            lamports: account.account.lamports,
            sol: account.account.lamports / 1e9,
            executable: account.account.executable,
            rentEpoch: account.account.rentEpoch
          });
        }
      }

      console.log(`✅ Found ${programs.length} owned programs`);

    } catch (error) {
      console.log('❌ Program retrieval error:', error.message);
    }

    return programs;
  }

  async retrieveTokenAccounts() {
    console.log('\n🪙 Retrieving token accounts...');
    
    const tokens = [];
    
    try {
      const tokenAccounts = await this.rpcCall('getTokenAccountsByOwner', [
        this.deployer,
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }
      ]);

      if (tokenAccounts?.value) {
        for (const account of tokenAccounts.value) {
          const info = account.account.data.parsed.info;
          tokens.push({
            address: account.pubkey,
            mint: info.mint,
            amount: info.tokenAmount.uiAmount,
            decimals: info.tokenAmount.decimals,
            owner: info.owner
          });
        }
      }

      console.log(`✅ Found ${tokens.length} token accounts`);

    } catch (error) {
      console.log('❌ Token retrieval error:', error.message);
    }

    return tokens;
  }

  async retrieveStakeAccounts() {
    console.log('\n🥩 Retrieving stake accounts...');
    
    const stakes = [];
    
    try {
      const stakeAccounts = await this.rpcCall('getParsedProgramAccounts', [
        'Stake11111111111111111111111111111111111111',
        {
          filters: [
            { memcmp: { offset: 12, bytes: this.deployer } }
          ]
        }
      ]);

      if (stakeAccounts) {
        for (const account of stakeAccounts) {
          stakes.push({
            address: account.pubkey,
            lamports: account.account.lamports,
            sol: account.account.lamports / 1e9,
            state: account.account.data.parsed?.info?.stake?.delegation?.state || 'unknown'
          });
        }
      }

      console.log(`✅ Found ${stakes.length} stake accounts`);

    } catch (error) {
      console.log('❌ Stake retrieval error:', error.message);
    }

    return stakes;
  }

  async retrieveVoteAccounts() {
    console.log('\n🗳️ Retrieving vote accounts...');
    
    const votes = [];
    
    try {
      const voteAccounts = await this.rpcCall('getVoteAccounts');
      
      if (voteAccounts) {
        const allVotes = [...(voteAccounts.current || []), ...(voteAccounts.delinquent || [])];
        
        const myVotes = allVotes.filter(vote => vote.nodePubkey === this.deployer);
        
        for (const vote of myVotes) {
          votes.push({
            votePubkey: vote.votePubkey,
            nodePubkey: vote.nodePubkey,
            activatedStake: vote.activatedStake,
            commission: vote.commission,
            epochCredits: vote.epochCredits?.length || 0
          });
        }
      }

      console.log(`✅ Found ${votes.length} vote accounts`);

    } catch (error) {
      console.log('❌ Vote retrieval error:', error.message);
    }

    return votes;
  }

  async retrieveNFTs() {
    console.log('\n🖼️ Retrieving NFTs...');
    
    const nfts = [];
    
    try {
      // Get NFT accounts (Metaplex standard)
      const nftAccounts = await this.rpcCall('getProgramAccounts', [
        'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
        {
          filters: [
            { memcmp: { offset: 326, bytes: this.deployer } }
          ]
        }
      ]);

      if (nftAccounts) {
        for (const account of nftAccounts) {
          nfts.push({
            address: account.pubkey,
            owner: this.deployer,
            lamports: account.account.lamports
          });
        }
      }

      console.log(`✅ Found ${nfts.length} NFTs`);

    } catch (error) {
      console.log('❌ NFT retrieval error:', error.message);
    }

    return nfts;
  }

  async getSOLBalance() {
    console.log('\n💰 Retrieving SOL balance...');
    
    try {
      const balance = await this.rpcCall('getBalance', [this.deployer]);
      const solBalance = balance / 1e9;
      
      console.log(`✅ SOL Balance: ${solBalance}`);
      return solBalance;
      
    } catch (error) {
      console.log('❌ Balance retrieval error:', error.message);
      return 0;
    }
  }

  async backfillAllAssets() {
    console.log('\n🔄 BACKFILLING ALL ASSETS FROM QUICKNODE...');
    console.log('═══════════════════════════════════════════════════════════════════════');
    
    const solBalance = await this.getSOLBalance();
    const programs = await this.retrieveAllPrograms();
    const tokens = await this.retrieveTokenAccounts();
    const stakes = await this.retrieveStakeAccounts();
    const votes = await this.retrieveVoteAccounts();
    const nfts = await this.retrieveNFTs();

    const backfillData = {
      timestamp: new Date().toISOString(),
      deployer: this.deployer,
      rpcEndpoint: this.quicknodeRpc,
      assets: {
        sol: solBalance,
        programs,
        tokens,
        stakes,
        votes,
        nfts
      },
      summary: {
        totalSOL: solBalance,
        totalPrograms: programs.length,
        totalTokens: tokens.length,
        totalStakes: stakes.length,
        totalVotes: votes.length,
        totalNFTs: nfts.length,
        totalAssets: programs.length + tokens.length + stakes.length + votes.length + nfts.length
      }
    };

    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/quicknode-backfill.json', JSON.stringify(backfillData, null, 2));

    console.log('\n🎯 BACKFILL SUMMARY:');
    console.log(`💰 SOL Balance: ${solBalance}`);
    console.log(`📦 Programs: ${programs.length}`);
    console.log(`🪙 Tokens: ${tokens.length}`);
    console.log(`🥩 Stakes: ${stakes.length}`);
    console.log(`🗳️ Votes: ${votes.length}`);
    console.log(`🖼️ NFTs: ${nfts.length}`);
    console.log(`📊 Total Assets: ${backfillData.summary.totalAssets}`);

    console.log('\n✅ Backfill completed');
    console.log('📄 Data saved: .cache/quicknode-backfill.json');

    return backfillData;
  }
}

const retriever = new ProgramAssetRetriever();
retriever.backfillAllAssets();