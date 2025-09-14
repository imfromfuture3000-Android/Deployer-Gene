import * as fs from 'fs';
import * as path from 'path';

export interface DeploymentEvent {
  timestamp: string;
  action: string;
  signature: string | 'DRY_RUN_SIGNATURE';
  details?: Record<string, any>;
}

const cacheDir = path.join(process.cwd(), '.cache');
const logPath = path.join(cacheDir, 'deployment-log.json');

function ensure() { if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true }); }

export function appendDeploymentEvent(event: DeploymentEvent) {
  ensure();
  let existing: DeploymentEvent[] = [];
  if (fs.existsSync(logPath)) {
    try { existing = JSON.parse(fs.readFileSync(logPath,'utf-8')); } catch {}
  }
  existing.push(event);
  fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));
}

export function readDeploymentLog(): DeploymentEvent[] {
  if (!fs.existsSync(logPath)) return [];
  try { return JSON.parse(fs.readFileSync(logPath,'utf-8')); } catch { return []; }
}
