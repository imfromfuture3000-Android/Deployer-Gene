const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
// const { Metaplex, keypairIdentity, bundlrStorage } = require('@metaplex-foundation/js');
const bs58 = require('bs58').default;
const fs = require('fs');
require('dotenv').config();

// Futuristic Gene NFT Configuration
const GENE_NFT_CONFIG = {
  collection: 'Futuristic Gene Collection',
  symbol: 'FGENE',
  totalSupply: 10000,
  mintPrice: 0.1, // SOL
  royalties: 500, // 5%
  traits: {
    dna: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega'],
    evolution: ['Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5'],
    rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
    power: ['Low', 'Medium', 'High', 'Ultra', 'Cosmic'],
    element: ['Fire', 'Water', 'Earth', 'Air', 'Void']
  }
};

function generateGeneticTraits() {
  const traits = {};
  
  Object.entries(GENE_NFT_CONFIG.traits).forEach(([category, options]) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    traits[category] = options[randomIndex];
  });
  
  // Calculate rarity score
  const rarityWeights = { Common: 1, Uncommon: 2, Rare: 5, Epic: 10, Legendary: 25 };
  traits.rarityScore = rarityWeights[traits.rarity] || 1;
  
  return traits;
}

function generateGeneNFTMetadata(tokenId) {
  const traits = generateGeneticTraits();
  
  return {
    name: `Futuristic Gene #${tokenId}`,
    symbol: GENE_NFT_CONFIG.symbol,
    description: `A genetically evolved NFT from the future. DNA: ${traits.dna}, Evolution: ${traits.evolution}, Power: ${traits.power}`,
    image: `https://futuristic-gene.com/images/${tokenId}.png`,
    external_url: 'https://futuristic-gene.com',
    attributes: [
      { trait_type: 'DNA Type', value: traits.dna },
      { trait_type: 'Evolution Stage', value: traits.evolution },
      { trait_type: 'Rarity', value: traits.rarity },
      { trait_type: 'Power Level', value: traits.power },
      { trait_type: 'Element', value: traits.element },
      { trait_type: 'Rarity Score', value: traits.rarityScore, display_type: 'number' }
    ],
    properties: {
      category: 'image',
      files: [{ uri: `https://futuristic-gene.com/images/${tokenId}.png`, type: 'image/png' }],
      creators: [{ address: 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4', share: 100 }]
    },
    collection: { name: GENE_NFT_CONFIG.collection, family: 'Futuristic Gene' }
  };
}

async function createGeneNFTCollection() {
  console.log('🧬 CREATING FUTURISTIC GENE NFT COLLECTION');
  
  const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Load deployer key
  const deployerKeyPath = '.deployer.key';
  const privateKeyString = fs.readFileSync(deployerKeyPath, 'utf8').trim();
  const privateKeyBytes = bs58.decode(privateKeyString);
  const deployer = Keypair.fromSecretKey(privateKeyBytes);
  
  console.log('🔑 Creator:', deployer.publicKey.toBase58());
  
  // Collection metadata
  const collectionMetadata = {
    name: GENE_NFT_CONFIG.collection,
    symbol: GENE_NFT_CONFIG.symbol,
    description: 'A collection of genetically evolved NFTs from the future, each with unique DNA traits and evolutionary stages.',
    image: 'https://futuristic-gene.com/collection.png',
    external_url: 'https://futuristic-gene.com',
    properties: {
      category: 'image',
      creators: [{ address: deployer.publicKey.toBase58(), share: 100 }]
    }
  };
  
  console.log('📊 Collection Details:');
  console.log('   Name:', collectionMetadata.name);
  console.log('   Symbol:', collectionMetadata.symbol);
  console.log('   Total Supply:', GENE_NFT_CONFIG.totalSupply);
  console.log('   Mint Price:', GENE_NFT_CONFIG.mintPrice, 'SOL');
  console.log('   Royalties:', GENE_NFT_CONFIG.royalties / 100, '%');
  
  return {
    metadata: collectionMetadata,
    creator: deployer.publicKey.toBase58(),
    config: GENE_NFT_CONFIG
  };
}

async function generateNFTBatch(batchSize = 10) {
  console.log('🎨 GENERATING NFT BATCH');
  console.log('📦 Batch Size:', batchSize);
  
  const nftBatch = [];
  
  for (let i = 1; i <= batchSize; i++) {
    const metadata = generateGeneNFTMetadata(i);
    const mintKeypair = Keypair.generate();
    
    nftBatch.push({
      tokenId: i,
      mint: mintKeypair.publicKey.toBase58(),
      metadata,
      mintKeypair: Array.from(mintKeypair.secretKey) // Store as array for JSON
    });
    
    console.log(`   NFT #${i}: ${metadata.name}`);
    console.log(`     DNA: ${metadata.attributes[0].value}`);
    console.log(`     Rarity: ${metadata.attributes[2].value}`);
    console.log(`     Mint: ${mintKeypair.publicKey.toBase58()}`);
  }
  
  return nftBatch;
}

async function calculateNFTEconomics() {
  console.log('💰 NFT ECONOMICS CALCULATION');
  
  const economics = {
    totalSupply: GENE_NFT_CONFIG.totalSupply,
    mintPrice: GENE_NFT_CONFIG.mintPrice,
    primarySales: GENE_NFT_CONFIG.totalSupply * GENE_NFT_CONFIG.mintPrice,
    royaltyRate: GENE_NFT_CONFIG.royalties / 100,
    estimatedSecondaryVolume: GENE_NFT_CONFIG.totalSupply * GENE_NFT_CONFIG.mintPrice * 5, // 5x turnover
    estimatedRoyalties: (GENE_NFT_CONFIG.totalSupply * GENE_NFT_CONFIG.mintPrice * 5) * (GENE_NFT_CONFIG.royalties / 10000),
    totalRevenue: 0
  };
  
  economics.totalRevenue = economics.primarySales + economics.estimatedRoyalties;
  
  console.log('📊 Revenue Projections:');
  console.log('   Primary Sales:', economics.primarySales, 'SOL');
  console.log('   Est. Secondary Volume:', economics.estimatedSecondaryVolume, 'SOL');
  console.log('   Est. Royalties:', economics.estimatedRoyalties, 'SOL');
  console.log('   Total Revenue:', economics.totalRevenue, 'SOL');
  
  return economics;
}

async function setupCandyMachine() {
  console.log('🍭 CANDY MACHINE SETUP');
  
  const candyMachineConfig = {
    price: GENE_NFT_CONFIG.mintPrice * 1e9, // Convert to lamports
    itemsAvailable: GENE_NFT_CONFIG.totalSupply,
    goLiveDate: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    endSettings: {
      endSettingType: 'amount',
      number: GENE_NFT_CONFIG.totalSupply
    },
    whitelistMintSettings: null,
    hiddenSettings: null,
    gatekeeper: null,
    creators: [{
      address: 'zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4',
      verified: true,
      share: 100
    }],
    retainAuthority: true,
    isMutable: true,
    maxSupply: GENE_NFT_CONFIG.totalSupply,
    symbol: GENE_NFT_CONFIG.symbol
  };
  
  console.log('🎛️ Candy Machine Config:');
  console.log('   Price:', candyMachineConfig.price / 1e9, 'SOL');
  console.log('   Items Available:', candyMachineConfig.itemsAvailable);
  console.log('   Go Live:', candyMachineConfig.goLiveDate);
  console.log('   Creator:', candyMachineConfig.creators[0].address);
  
  return candyMachineConfig;
}

async function fullGeneNFTSetup() {
  console.log('🚀 FULL FUTURISTIC GENE NFT SETUP');
  console.log('=' .repeat(60));
  
  const collection = await createGeneNFTCollection();
  const nftBatch = await generateNFTBatch(10);
  const economics = await calculateNFTEconomics();
  const candyMachine = await setupCandyMachine();
  
  console.log('=' .repeat(60));
  console.log('📊 GENE NFT SUMMARY:');
  console.log('🧬 Collection:', collection.metadata.name);
  console.log('🎨 Generated NFTs:', nftBatch.length);
  console.log('💰 Projected Revenue:', economics.totalRevenue, 'SOL');
  console.log('🍭 Candy Machine:', 'Configured');
  
  // Save all data
  if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
  
  const geneNFTData = {
    timestamp: new Date().toISOString(),
    collection,
    nftBatch,
    economics,
    candyMachine,
    status: 'configured_ready_to_deploy'
  };
  
  fs.writeFileSync('.cache/futuristic-gene-nft.json', JSON.stringify(geneNFTData, null, 2));
  
  console.log('💾 Data saved to .cache/futuristic-gene-nft.json');
  console.log('🎯 Ready for NFT deployment');
  
  return geneNFTData;
}

fullGeneNFTSetup().catch(console.error);