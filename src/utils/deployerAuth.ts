import { Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { join } from 'path';

let deployerKeypair: Keypair | null = null;

export function loadDeployerAuth(): Keypair {
  if (deployerKeypair) return deployerKeypair;
  
  try {
    const keyPath = join(process.cwd(), '.deployer.key');
    const privateKeyString = readFileSync(keyPath, 'utf8').trim();
    const privateKeyBytes = Buffer.from(privateKeyString, 'base64');
    deployerKeypair = Keypair.fromSecretKey(privateKeyBytes);
    return deployerKeypair;
  } catch (error) {
    throw new Error('Deployer key not found or invalid');
  }
}

export function getDeployerPublicKey(): string {
  return loadDeployerAuth().publicKey.toBase58();
}