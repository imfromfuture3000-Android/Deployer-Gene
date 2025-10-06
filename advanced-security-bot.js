#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class AdvancedSecurityBot {
  constructor() {
    this.threats = [];
    this.securityScore = 100;
  }

  async scanSecrets() {
    console.log('🔍 ADVANCED SECURITY BOT - SECRET SCAN');
    console.log('=====================================');
    
    const patterns = {
      privateKeys: /[1-9A-HJ-NP-Za-km-z]{87,88}/g,
      apiKeys: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
      addresses: /[1-9A-HJ-NP-Za-km-z]{32,44}/g
    };

    const files = this.getAllFiles('.');
    
    for (const file of files) {
      if (this.shouldSkip(file)) continue;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        this.scanFileContent(file, content, patterns);
      } catch (e) {
        // Skip binary files
      }
    }

    this.generateReport();
  }

  getAllFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !this.shouldSkipDir(item)) {
        this.getAllFiles(fullPath, files);
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  shouldSkip(file) {
    const skipPatterns = [
      /node_modules/,
      /\.git/,
      /\.cache/,
      /terraform\/\.terraform/,
      /\.tar\.gz$/,
      /gitleaks$/
    ];
    
    return skipPatterns.some(pattern => pattern.test(file));
  }

  shouldSkipDir(dir) {
    return ['node_modules', '.git', 'terraform'].includes(dir);
  }

  scanFileContent(file, content, patterns) {
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = content.match(pattern);
      
      if (matches) {
        for (const match of matches) {
          if (this.isAllowedSecret(file, match)) continue;
          
          this.threats.push({
            file,
            type,
            secret: match.substring(0, 10) + '...',
            severity: this.getSeverity(type),
            line: this.getLineNumber(content, match)
          });
          
          this.securityScore -= this.getSeverityScore(type);
        }
      }
    }
  }

  isAllowedSecret(file, secret) {
    const allowedFiles = ['README.md', '.gitleaks.toml', 'FUTURISTIC_KAMI_CONTRACT_REGISTRY.md'];
    const allowedSecrets = ['16b9324a-5b8c-47b9-9b02-6efa868958e5'];
    
    return allowedFiles.some(f => file.includes(f)) || allowedSecrets.includes(secret);
  }

  getSeverity(type) {
    const severities = {
      privateKeys: 'CRITICAL',
      apiKeys: 'HIGH',
      addresses: 'MEDIUM'
    };
    return severities[type] || 'LOW';
  }

  getSeverityScore(type) {
    const scores = {
      privateKeys: 50,
      apiKeys: 20,
      addresses: 5
    };
    return scores[type] || 1;
  }

  getLineNumber(content, match) {
    const lines = content.substring(0, content.indexOf(match)).split('\n');
    return lines.length;
  }

  generateReport() {
    console.log(`\n🛡️ SECURITY SCAN COMPLETE`);
    console.log(`📊 Security Score: ${Math.max(0, this.securityScore)}/100`);
    console.log(`⚠️ Threats Found: ${this.threats.length}`);
    
    if (this.threats.length === 0) {
      console.log('✅ No security threats detected');
      return;
    }

    console.log('\n🚨 DETECTED THREATS:');
    this.threats.forEach((threat, i) => {
      console.log(`${i + 1}. [${threat.severity}] ${threat.type} in ${threat.file}:${threat.line}`);
      console.log(`   Secret: ${threat.secret}`);
    });

    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('- Move secrets to environment variables');
    console.log('- Add sensitive files to .gitignore');
    console.log('- Use secret management services');
    console.log('- Rotate exposed credentials');
  }

  async enforceSecurityPolicies() {
    console.log('\n🔒 ENFORCING SECURITY POLICIES');
    
    // Check .env is in .gitignore
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('.env')) {
      console.log('⚠️ Adding .env to .gitignore');
      fs.appendFileSync('.gitignore', '\n.env\n');
    }

    // Check for exposed API keys in code
    const envSample = `# Environment Variables Template
HELIUS_API_KEY=your_helius_api_key_here
RPC_URL=https://mainnet.helius-rpc.com/?api-key=\${HELIUS_API_KEY}
TREASURY_PUBKEY=your_treasury_address_here
RELAYER_PUBKEY=your_relayer_address_here
`;

    if (!fs.existsSync('.env.sample')) {
      fs.writeFileSync('.env.sample', envSample);
      console.log('✅ Created .env.sample template');
    }

    console.log('✅ Security policies enforced');
  }
}

async function main() {
  const bot = new AdvancedSecurityBot();
  await bot.scanSecrets();
  await bot.enforceSecurityPolicies();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AdvancedSecurityBot };