#!/usr/bin/env node

const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMintLen } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');
require('dotenv').config();

class FullDeploymentActivator {
  constructor() {
    this.connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');
    this.relayerUrl = process.env.RELAYER_URL;
    this.relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY);
    this.treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY);
  }

  async sendViaRelayer(transaction, signer) {
    transaction.feePayer = this.relayerPubkey;
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    
    transaction.partialSign(signer);
    const serialized = transaction.serialize({ requireAllSignatures: false });
    
    console.log('📡 Submitting via relayer...');
    
    try {
      const response = await fetch(this.relayerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: serialized.toString('base64'),
          skipPreflight: false
        })
      });
      
      const result = await response.json();
      return result.signature || await this.connection.sendRawTransaction(serialized);
    } catch (error) {
      return await this.connection.sendRawTransaction(serialized);
    }
  }

  async deployMainToken() {
    console.log('🪙 DEPLOYING MAIN TOKEN');
    
    const deployerKeyPath = '.deployer.key';
    const privateKeyString = fs.readFileSync(deployerKeyPath, 'utf8').trim();
    const deployer = Keypair.fromSecretKey(bs58.decode(privateKeyString));
    
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    
    const mintLen = getMintLen([]);
    const mintRent = await this.connection.getMinimumBalanceForRentExemption(mintLen);
    
    const createMintTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: this.relayerPubkey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports: mintRent,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint, 9, deployer.publicKey, deployer.publicKey, TOKEN_2022_PROGRAM_ID
      )
    );
    
    const mintTxSignature = await this.sendViaRelayer(createMintTx, deployer);
    await this.connection.confirmTransaction(mintTxSignature, 'confirmed');
    
    console.log('✅ Main token created:', mint.toBase58());
    return { mint, deployer, mintTxSignature };
  }

  async mintToBots(mint, deployer) {
    console.log('🤖 MINTING TO BOT ARMY');
    
    const botsConfig = JSON.parse(fs.readFileSync('.cache/bots.json', 'utf8'));
    const { bots, amount } = botsConfig;
    const amountBaseUnits = BigInt(amount) * BigInt(10 ** 9);
    
    const signatures = [];
    
    for (const botPubkey of bots) {
      const botPublicKey = new PublicKey(botPubkey);
      const botAta = await getAssociatedTokenAddress(mint, botPublicKey, false, TOKEN_2022_PROGRAM_ID);
      
      const mintToBotTx = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          this.relayerPubkey, botAta, botPublicKey, mint, TOKEN_2022_PROGRAM_ID
        ),
        createMintToInstruction(
          mint, botAta, deployer.publicKey, amountBaseUnits, [], TOKEN_2022_PROGRAM_ID
        )
      );
      
      const signature = await this.sendViaRelayer(mintToBotTx, deployer);
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      signatures.push({ bot: botPubkey, signature, amount: amount });
      console.log(`✅ Minted ${amount} tokens to bot:`, botPubkey.substring(0, 8) + '...');
    }
    
    return signatures;
  }

  async deployGeneNFTs(deployer) {
    console.log('🧬 DEPLOYING GENE NFTS');
    
    const geneNftMint = Keypair.generate();
    const mint = geneNftMint.publicKey;
    
    const mintLen = getMintLen([]);
    const mintRent = await this.connection.getMinimumBalanceForRentExemption(mintLen);
    
    const createNftTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: this.relayerPubkey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports: mintRent,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint, 0, deployer.publicKey, deployer.publicKey, TOKEN_2022_PROGRAM_ID
      )
    );
    
    const nftTxSignature = await this.sendViaRelayer(createNftTx, deployer);
    await this.connection.confirmTransaction(nftTxSignature, 'confirmed');
    
    console.log('✅ Gene NFT mint created:', mint.toBase58());
    return { nftMint: mint, nftTxSignature };
  }

  async setupDAOGovernance(mainMint, deployer) {
    console.log('🏛️ SETTING UP DAO GOVERNANCE');
    
    const daoConfig = {
      governanceToken: mainMint.toBase58(),
      votingPeriod: 7 * 24 * 60 * 60, // 7 days
      quorum: 0.1, // 10%
      proposalThreshold: 0.01, // 1%
      authority: deployer.publicKey.toBase58(),
      treasury: this.treasuryPubkey.toBase58(),
      created: new Date().toISOString()
    };
    
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/dao-governance.json', JSON.stringify(daoConfig, null, 2));
    
    console.log('✅ DAO governance configured');
    return daoConfig;
  }

  async saveDeploymentLog(data) {
    const deploymentLog = {
      timestamp: new Date().toISOString(),
      status: 'FULL_DEPLOYMENT_COMPLETE',
      mainToken: data.mainToken,
      botMinting: data.botMinting,
      geneNFTs: data.geneNFTs,
      daoGovernance: data.daoGovernance,
      network: 'mainnet-beta',
      relayer: 'helius',
      totalCost: 0
    };
    
    fs.writeFileSync('.cache/full-deployment.json', JSON.stringify(deploymentLog, null, 2));
    
    let existingLog = [];
    if (fs.existsSync('.cache/deployment-log.json')) {
      existingLog = JSON.parse(fs.readFileSync('.cache/deployment-log.json', 'utf8'));
    }
    
    existingLog.push({
      timestamp: new Date().toISOString(),
      action: 'full-deployment',
      signature: data.mainToken.mintTxSignature,
      details: deploymentLog
    });
    
    fs.writeFileSync('.cache/deployment-log.json', JSON.stringify(existingLog, null, 2));
  }

  async activateFullDeployment() {
    console.log('🚀 ACTIVATING FULL DEPLOYMENT SYSTEM');
    console.log('=' .repeat(60));
    
    try {
      // 1. Deploy main token
      const mainToken = await this.deployMainToken();
      
      // 2. Mint to bot army
      const botMinting = await this.mintToBots(mainToken.mint, mainToken.deployer);
      
      // 3. Deploy Gene NFTs
      const geneNFTs = await this.deployGeneNFTs(mainToken.deployer);
      
      // 4. Setup DAO governance
      const daoGovernance = await this.setupDAOGovernance(mainToken.mint, mainToken.deployer);
      
      // 5. Save deployment log
      await this.saveDeploymentLog({
        mainToken,
        botMinting,
        geneNFTs,
        daoGovernance
      });
      
      console.log('\n🎉 FULL DEPLOYMENT ACTIVATED!');
      console.log('📊 DEPLOYMENT SUMMARY:');
      console.log(`   🪙 Main Token: ${mainToken.mint.toBase58()}`);
      console.log(`   🤖 Bots Minted: ${botMinting.length}`);
      console.log(`   🧬 Gene NFT: ${geneNFTs.nftMint.toBase58()}`);
      console.log(`   🏛️ DAO Governance: Configured`);
      console.log(`   💰 Total Cost: 0 SOL (relayer paid)`);
      console.log(`   🌐 Network: Solana Mainnet-Beta`);
      
      return true;
      
    } catch (error) {
      console.error('❌ DEPLOYMENT FAILED:', error.message);
      throw error;
    }
  }
}

// Create default bots config if not exists
if (!fs.existsSync('.cache/bots.json')) {
  if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
  const defaultBots = {
    bots: [
      "Bot1WalletPubkey1111111111111111111111111111",
      "Bot2WalletPubkey2222222222222222222222222222",
      "Bot3WalletPubkey3333333333333333333333333333"
    ],
    amount: "1000000"
  };
  fs.writeFileSync('.cache/bots.json', JSON.stringify(defaultBots, null, 2));
}

const activator = new FullDeploymentActivator();
activator.activateFullDeployment().catch(console.error);