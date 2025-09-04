import { execSync } from 'child_process';
import { REQUIRED_EXTENSIONS } from './REQUIRED_EXTENSIONS';

function installVSCodeExtensions(): void {
  for (const ext of REQUIRED_EXTENSIONS) {
    try {
      console.log(`Installing VS Code extension: ${ext}`);
      execSync(`code --install-extension ${ext}`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to install extension ${ext}: ${(e as Error).message}`);
    }
  }
}
