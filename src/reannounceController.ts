import { PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { appendDeploymentEvent } from './utils/txLogger';

dotenv.config();

/*
  Reannounce Controller / Co-Controller
  - Writes a JSON file capturing CONTROLLER_PUBKEY & COCREATOR_PUBKEY plus optional note
  - No on-chain tx (authorities already set by lockAuthorities), purely off-chain attestation for transparency
*/

function main() {
  const controller = process.env.CONTROLLER_PUBKEY;
  const cocreator = process.env.COCREATOR_PUBKEY;
  if (!controller || !cocreator) {
    console.error('Missing CONTROLLER_PUBKEY or COCREATOR_PUBKEY env vars.');
    process.exit(1);
  }
  try {
    new PublicKey(controller); new PublicKey(cocreator);
  } catch {
    console.error('Invalid public key format.');
    process.exit(1);
  }
  const cacheDir = path.join(process.cwd(), '.cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir,{recursive:true});
  const pathOut = path.join(cacheDir, 'controller-announcement.json');
  const payload = {
    timestamp: new Date().toISOString(),
    controller,
    cocreator,
    note: process.env.CONTROLLER_NOTE || 'Reannouncement of active authorities for transparency.'
  };
  fs.writeFileSync(pathOut, JSON.stringify(payload, null, 2));
  appendDeploymentEvent({ timestamp: new Date().toISOString(), action: 'controller-reannounce', signature: 'OFF_CHAIN', details: payload });
  console.log(`Controller reannouncement written to ${pathOut}`);
}

main();
