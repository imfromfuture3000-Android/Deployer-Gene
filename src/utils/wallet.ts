import { Keypair } from '@solana/web3.js';

import * as fs from 'fs';
import * as path from 'path';

export function loadOrCreateUserAuth(): Keypair {
	const cacheDir = path.join(process.cwd(), '.cache');
	const keypairPath = path.join(cacheDir, 'user_auth.json');
	if (fs.existsSync(keypairPath)) {
		const keypairJson = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
		return Keypair.fromSecretKey(Uint8Array.from(keypairJson));
	}
	const keypair = Keypair.generate();
	if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
	fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
	console.log(`Generated new USER_AUTH keypair: ${keypair.publicKey.toBase58()}`);
	return keypair;
}
