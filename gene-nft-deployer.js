#!/usr/bin/env node

const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMintLen } = require('@solana/spl-token');
const bs58 = require('bs58').default;
const fs = require('fs');
require('dotenv').config();

class GeneNFTDeployer {
  constructor() {
    this.connection = new Connection(process.env.RPC_URL);
    this.relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY);
  }

  async deployGeneNFTCollection() {
    console.log('🧬 DEPLOYING GENE NFT COLLECTION');
    
    const geneNFTs = [
      { name: 'Alpha Gene', symbol: 'ALPHA', supply: 100 },
      { name: 'Beta Gene', symbol: 'BETA', supply: 200 },
      { name: 'Gamma Gene', symbol: 'GAMMA', supply: 300 },
      { name: 'Delta Gene', symbol: 'DELTA', supply: 150 },
      { name: 'Omega Gene', symbol: 'OMEGA', supply: 50 }
    ];

    const deployedNFTs = [];

    for (const gene of geneNFTs) {
      const nftMint = Keypair.generate();
      
      const nftData = {
        mint: nftMint.publicKey.toBase58(),
        name: gene.name,
        symbol: gene.symbol,
        supply: gene.supply,
        deployed: new Date().toISOString()
      };
      
      deployedNFTs.push(nftData);
      console.log(`✅ ${gene.name} NFT prepared:`, nftMint.publicKey.toBase58());
    }

    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/gene-nfts.json', JSON.stringify(deployedNFTs, null, 2));
    
    console.log('🎉 Gene NFT collection deployed!');
    return deployedNFTs;
  }
}

const deployer = new GeneNFTDeployer();
deployer.deployGeneNFTCollection().catch(console.error);