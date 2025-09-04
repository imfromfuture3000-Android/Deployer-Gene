import { PublicKey } from '@solana/web3.js';

export function findMetadataPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(), mint.toBuffer()],
    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  )[0];
}

export function findAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(), mint.toBuffer()],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  )[0];
}
