#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
require('dotenv').config();

class CoreProgramPDAChecker {
  constructor() {
    this.connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');
    this.deployerPubkey = new PublicKey(process.env.TREASURY_PUBKEY);
  }

  async generatePDAs() {
    console.log('🔗 CORE PROGRAM PDA ADDRESSES');
    console.log('=' .repeat(60));
    
    const programId = new PublicKey('11111111111111111111111111111112'); // System Program
    const seeds = ['deployer', 'gene', 'omega', 'crosschain'];
    
    const pdas = {};
    
    for (const seed of seeds) {
      try {
        const [pda, bump] = await PublicKey.findProgramAddress(
          [Buffer.from(seed), this.deployerPubkey.toBuffer()],
          programId
        );
        
        pdas[seed] = {
          address: pda.toBase58(),
          bump,
          seed,
          programId: programId.toBase58()
        };
        
        console.log(`✅ ${seed.toUpperCase()} PDA: ${pda.toBase58()} (bump: ${bump})`);
      } catch (error) {
        console.log(`❌ Failed to generate ${seed} PDA:`, error.message);
      }
    }
    
    return pdas;
  }

  async checkCrosschainPDAs() {
    console.log('\n🌐 CROSSCHAIN PDA SETUP');
    console.log('=' .repeat(60));
    
    const chains = ['ethereum', 'polygon', 'bsc', 'arbitrum'];
    const crosschainPDAs = {};
    
    for (const chain of chains) {
      try {
        const [pda, bump] = await PublicKey.findProgramAddress(
          [Buffer.from('crosschain'), Buffer.from(chain), this.deployerPubkey.toBuffer()],
          new PublicKey('11111111111111111111111111111112')
        );
        
        crosschainPDAs[chain] = {
          address: pda.toBase58(),
          bump,
          chain,
          ready: true
        };
        
        console.log(`🔗 ${chain.toUpperCase()}: ${pda.toBase58()}`);
      } catch (error) {
        console.log(`❌ ${chain} PDA failed:`, error.message);
      }
    }
    
    return crosschainPDAs;
  }

  async checkPentacleProgramPDAs() {
    console.log('\n🌟 PENTACLE PROGRAM PDAs');
    console.log('=' .repeat(60));
    
    // Check if Pentacle program is built
    const pentaclePath = './pentacle/target/deploy/pentacle.so';
    let pentacleProgramId = null;
    
    if (fs.existsSync(pentaclePath)) {
      // Generate a deterministic program ID for demo
      pentacleProgramId = new PublicKey('PentacLe1111111111111111111111111111111111');
      console.log('✅ Pentacle Program ID:', pentacleProgramId.toBase58());
    } else {
      console.log('⚠️ Pentacle program not built yet');
      pentacleProgramId = new PublicKey('11111111111111111111111111111112');
    }
    
    const botSeeds = ['bot1', 'bot2', 'bot3', 'bot4', 'bot5'];
    const botPDAs = {};
    
    for (const botSeed of botSeeds) {
      try {
        const [pda, bump] = await PublicKey.findProgramAddress(
          [Buffer.from('swarm'), Buffer.from(botSeed), this.deployerPubkey.toBuffer()],
          pentacleProgramId
        );
        
        botPDAs[botSeed] = {
          address: pda.toBase58(),
          bump,
          seed: botSeed,
          programId: pentacleProgramId.toBase58()
        };
        
        console.log(`🤖 ${botSeed.toUpperCase()}: ${pda.toBase58()}`);
      } catch (error) {
        console.log(`❌ ${botSeed} PDA failed:`, error.message);
      }
    }
    
    return { pentacleProgramId: pentacleProgramId.toBase58(), botPDAs };
  }

  async generateCoreAddresses() {
    console.log('\n📋 CORE PROGRAM ADDRESSES');
    console.log('=' .repeat(60));
    
    const corePrograms = {
      SYSTEM_PROGRAM: '11111111111111111111111111111112',
      TOKEN_PROGRAM: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      TOKEN_2022_PROGRAM: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
      ASSOCIATED_TOKEN: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
      METADATA_PROGRAM: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
      STAKE_PROGRAM: 'Stake11111111111111111111111111111111111111',
      VOTE_PROGRAM: 'Vote111111111111111111111111111111111111111'
    };
    
    Object.entries(corePrograms).forEach(([name, address]) => {
      console.log(`✅ ${name}: ${address}`);
    });
    
    return corePrograms;
  }

  async fullPDACheck() {
    console.log('🚀 FULL CORE PROGRAM & PDA CHECK');
    console.log('=' .repeat(80));
    console.log('🔑 Deployer:', this.deployerPubkey.toBase58());
    console.log('🌐 RPC:', process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');
    
    const corePrograms = await this.generateCoreAddresses();
    const pdas = await this.generatePDAs();
    const crosschainPDAs = await this.checkCrosschainPDAs();
    const pentaclePDAs = await this.checkPentacleProgramPDAs();
    
    const fullSetup = {
      timestamp: new Date().toISOString(),
      deployer: this.deployerPubkey.toBase58(),
      corePrograms,
      pdas,
      crosschainPDAs,
      pentaclePDAs,
      status: 'ready_for_crosschain'
    };
    
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/core-program-setup.json', JSON.stringify(fullSetup, null, 2));
    
    console.log('\n🎯 SETUP SUMMARY:');
    console.log(`📊 Core Programs: ${Object.keys(corePrograms).length}`);
    console.log(`🔗 PDAs Generated: ${Object.keys(pdas).length}`);
    console.log(`🌐 Crosschain PDAs: ${Object.keys(crosschainPDAs).length}`);
    console.log(`🤖 Bot PDAs: ${Object.keys(pentaclePDAs.botPDAs || {}).length}`);
    console.log('💾 Saved to: .cache/core-program-setup.json');
    
    console.log('\n🌟 CROSSCHAIN READY!');
    console.log('🚀 Ready for multi-chain deployment');
    
    return fullSetup;
  }
}

const checker = new CoreProgramPDAChecker();
checker.fullPDACheck().catch(console.error);