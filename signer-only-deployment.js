#!/usr/bin/env node

const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMintLen } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');
require('dotenv').config();

class SignerOnlyDeployer {
  constructor() {
    this.connection = new Connection(process.env.RPC_URL);
    this.relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY);
    this.treasuryPrivateKey = [28,115,77,97,38,152,210,242,27,197,74,110,208,115,247,207,166,146,13,2,243,70,167,241,92,127,12,83,16,204,1,8,122,182,189,116,83,81,250,33,216,200,74,112,115,7,63,124,250,105,32,208,47,52,106,122,244,21,188,124,5,49,16,204,1];
  }

  async sendViaRelayer(transaction, signer) {
    transaction.feePayer = this.relayerPubkey;
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    
    transaction.partialSign(signer);
    const serialized = transaction.serialize({ requireAllSignatures: false });
    
    console.log('📡 Submitting via relayer (signer-only mode)...');
    
    try {
      const response = await fetch(process.env.RELAYER_URL, {
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

  async deployWithTreasuryKey() {
    console.log('🔑 SIGNER-ONLY DEPLOYMENT');
    console.log('=' .repeat(50));
    
    const treasurySigner = Keypair.fromSecretKey(new Uint8Array(this.treasuryPrivateKey));
    
    console.log('✅ Treasury Signer:', treasurySigner.publicKey.toBase58());
    console.log('💸 Fee Payer (Relayer):', this.relayerPubkey.toBase58());
    console.log('🔒 Mode: Signer-only (relayer pays fees)');
    
    try {
      // Generate mint keypair
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;
      
      console.log('\n🪙 DEPLOYING MAIN TOKEN');
      console.log('🆔 Mint Address:', mint.toBase58());
      
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
          mint, 9, treasurySigner.publicKey, treasurySigner.publicKey, TOKEN_2022_PROGRAM_ID
        )
      );
      
      const mintTxSignature = await this.sendViaRelayer(createMintTx, treasurySigner);
      await this.connection.confirmTransaction(mintTxSignature, 'confirmed');
      
      console.log('✅ Main token deployed');
      console.log('📝 TX:', mintTxSignature);
      
      // Mint to bots
      console.log('\n🤖 MINTING TO BOT ARMY');
      const botsConfig = JSON.parse(fs.readFileSync('.cache/bots.json', 'utf8'));
      const signatures = [];
      
      for (const botPubkey of botsConfig.bots) {
        const botPublicKey = new PublicKey(botPubkey);
        const botAta = await getAssociatedTokenAddress(mint, botPublicKey, false, TOKEN_2022_PROGRAM_ID);
        
        const mintToBotTx = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            this.relayerPubkey, botAta, botPublicKey, mint, TOKEN_2022_PROGRAM_ID
          ),
          createMintToInstruction(
            mint, botAta, treasurySigner.publicKey, 
            BigInt(botsConfig.amount) * BigInt(10 ** 9), [], TOKEN_2022_PROGRAM_ID
          )
        );
        
        const signature = await this.sendViaRelayer(mintToBotTx, treasurySigner);
        await this.connection.confirmTransaction(signature, 'confirmed');
        
        signatures.push({ bot: botPubkey, signature, amount: botsConfig.amount });
        console.log(`✅ Minted ${botsConfig.amount} to:`, botPubkey.substring(0, 8) + '...');
      }
      
      const deploymentResult = {
        timestamp: new Date().toISOString(),
        status: 'SIGNER_ONLY_DEPLOYMENT_COMPLETE',
        signer: treasurySigner.publicKey.toBase58(),
        feePayer: this.relayerPubkey.toBase58(),
        mainToken: {
          mint: mint.toBase58(),
          mintTxSignature
        },
        botMinting: signatures,
        totalCost: 0,
        network: 'mainnet-beta'
      };
      
      if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
      fs.writeFileSync('.cache/signer-deployment.json', JSON.stringify(deploymentResult, null, 2));
      
      console.log('\n🎉 SIGNER-ONLY DEPLOYMENT COMPLETE!');
      console.log('📊 SUMMARY:');
      console.log(`   🪙 Main Token: ${mint.toBase58()}`);
      console.log(`   🤖 Bots Minted: ${signatures.length}`);
      console.log(`   🔑 Signer: ${treasurySigner.publicKey.toBase58()}`);
      console.log(`   💸 Fee Payer: ${this.relayerPubkey.toBase58()}`);
      console.log(`   💰 Cost: 0 SOL (relayer paid)`);
      
      return deploymentResult;
      
    } catch (error) {
      console.error('❌ DEPLOYMENT FAILED:', error.message);
      throw error;
    }
  }
}

const deployer = new SignerOnlyDeployer();
deployer.deployWithTreasuryKey().catch(console.error);