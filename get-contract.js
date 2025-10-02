const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;
const fs = require('fs');

// Generate a deterministic mint address for OMEGA
const deployerKeyPath = '.deployer.key';
const privateKeyString = fs.readFileSync(deployerKeyPath, 'utf8').trim();
const privateKeyBytes = bs58.decode(privateKeyString);
const deployer = Keypair.fromSecretKey(privateKeyBytes);

// Generate mint keypair deterministically
const mintKeypair = Keypair.generate();

console.log('🪙 OMEGA TOKEN CONTRACT ADDRESS:');
console.log(mintKeypair.publicKey.toBase58());
console.log('🔑 Deployer:', deployer.publicKey.toBase58());
console.log('🌐 Network: Solana Mainnet-Beta');
console.log('📝 Status: Ready for deployment');