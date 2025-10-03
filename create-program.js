#!/usr/bin/env node
/**
 * Program Creation & Deployment
 */

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');

class ProgramCreator {
  constructor() {
    this.connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');
    this.authority = new PublicKey(process.env.TREASURY_PUBKEY);
  }

  async createProgram() {
    console.log('🚀 CREATING SOLANA PROGRAM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Generate program keypair
    const programKeypair = Keypair.generate();
    const programId = programKeypair.publicKey;
    
    console.log(`📋 Program ID: ${programId.toString()}`);
    console.log(`🔑 Authority: ${this.authority.toString()}`);
    
    // Save program keypair
    const programData = {
      programId: programId.toString(),
      authority: this.authority.toString(),
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('.cache/program-keypair.json', JSON.stringify(Array.from(programKeypair.secretKey)));
    fs.writeFileSync('.cache/program-info.json', JSON.stringify(programData, null, 2));
    
    console.log('✅ Program keypair saved to .cache/');
    console.log('✅ Program info saved');
    
    return programId;
  }

  async deployProgram(programPath = './pentacle/target/deploy/pentacle.so') {
    console.log(`📦 Deploying program from: ${programPath}`);
    
    if (!fs.existsSync(programPath)) {
      console.log('❌ Program binary not found. Build with: cargo build-bpf');
      return false;
    }
    
    console.log('✅ Program binary found');
    console.log('💡 Use: solana program deploy for actual deployment');
    
    return true;
  }
}

async function main() {
  const creator = new ProgramCreator();
  
  // Create program
  const programId = await creator.createProgram();
  
  // Check for deployment
  await creator.deployProgram();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Build Rust program: cd pentacle && cargo build-bpf');
  console.log('2. Deploy: solana program deploy target/deploy/pentacle.so');
  console.log(`3. Use Program ID: ${programId.toString()}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ProgramCreator };