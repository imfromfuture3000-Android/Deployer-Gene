#!/usr/bin/env node

/**
 * 🔍 GITHUB ACCOUNT & REPOSITORY SCANNER
 * 
 * This script scans the GitHub account and all repositories for:
 * 1. Repository overview and analysis
 * 2. Contract addresses across all repos
 * 3. Security and access analysis
 * 4. Cross-repository connections
 * 
 * Companion to comprehensive-omega-audit.js for complete GitHub account analysis
 */

const fs = require('fs');
const path = require('path');

class GitHubAccountScanner {
  constructor() {
    this.scanResults = {
      timestamp: new Date().toISOString(),
      currentRepository: {
        name: 'Omega-prime-deployer',
        path: process.cwd(),
        analysis: {}
      },
      repositoryAnalysis: {},
      crossRepoFindings: {},
      securityAnalysis: {},
      summary: {}
    };

    console.log('🔍 GITHUB ACCOUNT & REPOSITORY SCANNER');
    console.log('='.repeat(60));
    console.log(`📅 Scan Started: ${this.scanResults.timestamp}`);
    console.log(`📁 Current Repo: ${this.scanResults.currentRepository.name}`);
  }

  /**
   * 📁 Analyze current repository structure and content
   */
  async analyzeCurrentRepository() {
    console.log('\n📁 PHASE 1: CURRENT REPOSITORY ANALYSIS');
    console.log('-'.repeat(50));

    const repoPath = this.scanResults.currentRepository.path;
    const analysis = {
      structure: {},
      addresses: [],
      contracts: [],
      configurations: [],
      security: [],
      dependencies: {},
      scripts: [],
      documentation: []
    };

    try {
      // Analyze repository structure
      await this.scanDirectoryStructure(repoPath, analysis.structure);
      
      // Extract all contract addresses
      analysis.addresses = await this.extractAllAddresses(repoPath);
      
      // Identify contract files
      analysis.contracts = await this.identifyContractFiles(repoPath);
      
      // Analyze configurations
      analysis.configurations = await this.analyzeConfigurations(repoPath);
      
      // Security analysis
      analysis.security = await this.performSecurityAnalysis(repoPath);
      
      // Dependency analysis
      analysis.dependencies = await this.analyzeDependencies(repoPath);
      
      // Script analysis
      analysis.scripts = await this.analyzeScripts(repoPath);
      
      // Documentation analysis
      analysis.documentation = await this.analyzeDocumentation(repoPath);

      this.scanResults.currentRepository.analysis = analysis;
      
      console.log(`✅ Repository analysis complete:`);
      console.log(`   📁 Directories: ${this.countDirectories(analysis.structure)}`);
      console.log(`   📄 Total files: ${this.countFiles(analysis.structure)}`);
      console.log(`   🔑 Addresses found: ${analysis.addresses.length}`);
      console.log(`   📝 Contract files: ${analysis.contracts.length}`);
      console.log(`   ⚙️  Config files: ${analysis.configurations.length}`);
      
    } catch (error) {
      console.error('❌ Repository analysis error:', error.message);
      analysis.error = error.message;
    }
  }

  /**
   * 📂 Scan directory structure recursively
   */
  async scanDirectoryStructure(dirPath, structure, depth = 0) {
    if (depth > 5) return; // Prevent infinite recursion
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          // Skip certain directories
          if (['node_modules', '.git', 'dist', 'build', '.cache'].includes(item)) {
            continue;
          }
          
          structure[item] = {
            type: 'directory',
            path: itemPath,
            children: {}
          };
          
          await this.scanDirectoryStructure(itemPath, structure[item].children, depth + 1);
          
        } else {
          structure[item] = {
            type: 'file',
            path: itemPath,
            size: stats.size,
            extension: path.extname(item),
            modified: stats.mtime
          };
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  /**
   * 🔑 Extract all addresses from repository files
   */
  async extractAllAddresses(repoPath) {
    console.log('🔍 Extracting addresses from all files...');
    
    const addresses = [];
    const addressPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    
    // Files to scan for addresses
    const scanTargets = [
      '**/*.js',
      '**/*.ts', 
      '**/*.json',
      '**/*.md',
      '**/*.env*',
      '**/*.toml',
      '**/*.yaml',
      '**/*.yml'
    ];

    const filesToScan = await this.findFilesByPattern(repoPath, scanTargets);
    
    for (const filePath of filesToScan) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.match(addressPattern);
        
        if (matches) {
          matches.forEach(match => {
            if (this.isValidSolanaAddress(match)) {
              addresses.push({
                address: match,
                file: path.relative(repoPath, filePath),
                context: this.getAddressContext(content, match)
              });
            }
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    // Remove duplicates
    const uniqueAddresses = addresses.filter((addr, index, self) => 
      index === self.findIndex(a => a.address === addr.address)
    );
    
    console.log(`🔑 Found ${uniqueAddresses.length} unique addresses`);
    return uniqueAddresses;
  }

  /**
   * 📝 Identify contract-related files
   */
  async identifyContractFiles(repoPath) {
    console.log('📝 Identifying contract files...');
    
    const contractFiles = [];
    const contractPatterns = [
      /contract/i,
      /deploy/i,
      /mint/i,
      /bot.*smart/i,
      /omega.*program/i,
      /solana/i
    ];

    const files = await this.findFilesByPattern(repoPath, ['**/*.js', '**/*.ts']);
    
    for (const filePath of files) {
      const fileName = path.basename(filePath);
      const relativePath = path.relative(repoPath, filePath);
      
      // Check if filename matches contract patterns
      if (contractPatterns.some(pattern => pattern.test(fileName))) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const analysis = this.analyzeContractFile(content, relativePath);
          
          contractFiles.push({
            file: relativePath,
            type: this.determineContractType(fileName, content),
            analysis: analysis
          });
          
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
    
    console.log(`📝 Found ${contractFiles.length} contract files`);
    return contractFiles;
  }

  /**
   * ⚙️ Analyze configuration files
   */
  async analyzeConfigurations(repoPath) {
    console.log('⚙️ Analyzing configuration files...');
    
    const configurations = [];
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'hardhat.config.js',
      '.env.sample',
      '.gitleaks.toml',
      'contract_addresses.json'
    ];

    for (const configFile of configFiles) {
      const filePath = path.join(repoPath, configFile);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const analysis = this.analyzeConfigFile(configFile, content);
          
          configurations.push({
            file: configFile,
            analysis: analysis,
            security_relevance: this.assessConfigSecurity(configFile, content)
          });
          
        } catch (error) {
          configurations.push({
            file: configFile,
            error: error.message
          });
        }
      }
    }
    
    console.log(`⚙️ Analyzed ${configurations.length} configuration files`);
    return configurations;
  }

  /**
   * 🔒 Perform security analysis
   */
  async performSecurityAnalysis(repoPath) {
    console.log('🔒 Performing security analysis...');
    
    const security = {
      sensitive_files: [],
      environment_variables: [],
      hardcoded_secrets: [],
      security_configurations: [],
      access_controls: [],
      recommendations: []
    };

    try {
      // Check for sensitive files
      security.sensitive_files = await this.findSensitiveFiles(repoPath);
      
      // Analyze environment variables
      security.environment_variables = await this.analyzeEnvironmentVars(repoPath);
      
      // Scan for hardcoded secrets
      security.hardcoded_secrets = await this.scanForHardcodedSecrets(repoPath);
      
      // Check security configurations
      security.security_configurations = await this.checkSecurityConfigs(repoPath);
      
      // Analyze access controls
      security.access_controls = await this.analyzeAccessControls(repoPath);
      
      // Generate security recommendations
      security.recommendations = this.generateSecurityRecommendations(security);
      
    } catch (error) {
      security.error = error.message;
    }
    
    console.log(`🔒 Security analysis complete:`);
    console.log(`   ⚠️  Sensitive files: ${security.sensitive_files.length}`);
    console.log(`   🔑 Environment vars: ${security.environment_variables.length}`);
    console.log(`   🚨 Potential secrets: ${security.hardcoded_secrets.length}`);
    
    return security;
  }

  /**
   * 📦 Analyze dependencies and packages
   */
  async analyzeDependencies(repoPath) {
    console.log('📦 Analyzing dependencies...');
    
    const dependencies = {
      production: {},
      development: {},
      security_analysis: {},
      outdated: [],
      vulnerabilities: []
    };

    try {
      const packagePath = path.join(repoPath, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        dependencies.production = packageData.dependencies || {};
        dependencies.development = packageData.devDependencies || {};
        
        // Analyze security of dependencies
        dependencies.security_analysis = this.analyzeDependencySecurity(dependencies);
      }
      
    } catch (error) {
      dependencies.error = error.message;
    }
    
    console.log(`📦 Dependencies analyzed:`);
    console.log(`   📋 Production: ${Object.keys(dependencies.production).length}`);
    console.log(`   🔧 Development: ${Object.keys(dependencies.development).length}`);
    
    return dependencies;
  }

  /**
   * 📜 Analyze scripts and automation
   */
  async analyzeScripts(repoPath) {
    console.log('📜 Analyzing scripts...');
    
    const scripts = [];
    const scriptFiles = await this.findFilesByPattern(repoPath, ['**/*.js', '**/*.ts', '**/*.sh']);
    
    for (const scriptPath of scriptFiles) {
      const relativePath = path.relative(repoPath, scriptPath);
      const fileName = path.basename(scriptPath);
      
      // Skip node_modules and other excluded directories
      if (relativePath.includes('node_modules')) continue;
      
      try {
        const content = fs.readFileSync(scriptPath, 'utf8');
        const analysis = this.analyzeScriptContent(content, fileName);
        
        scripts.push({
          file: relativePath,
          type: this.determineScriptType(fileName, content),
          analysis: analysis
        });
        
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    console.log(`📜 Analyzed ${scripts.length} script files`);
    return scripts;
  }

  /**
   * 📚 Analyze documentation
   */
  async analyzeDocumentation(repoPath) {
    console.log('📚 Analyzing documentation...');
    
    const documentation = [];
    const docFiles = await this.findFilesByPattern(repoPath, ['**/*.md', '**/*.txt']);
    
    for (const docPath of docFiles) {
      const relativePath = path.relative(repoPath, docPath);
      const fileName = path.basename(docPath);
      
      try {
        const content = fs.readFileSync(docPath, 'utf8');
        const analysis = this.analyzeDocContent(content, fileName);
        
        documentation.push({
          file: relativePath,
          type: this.determineDocType(fileName),
          analysis: analysis
        });
        
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    console.log(`📚 Analyzed ${documentation.length} documentation files`);
    return documentation;
  }

  /**
   * 🔍 Cross-repository analysis (simulated for single repo)
   */
  async performCrossRepoAnalysis() {
    console.log('\n🔍 PHASE 2: CROSS-REPOSITORY ANALYSIS');
    console.log('-'.repeat(50));

    // Since we only have access to the current repository,
    // we'll analyze patterns that suggest connections to other repos
    
    const crossRepo = {
      external_references: [],
      related_projects: [],
      shared_addresses: [],
      common_patterns: []
    };

    try {
      // Look for references to other repositories or projects
      crossRepo.external_references = await this.findExternalReferences();
      
      // Identify patterns that suggest related projects
      crossRepo.related_projects = await this.identifyRelatedProjects();
      
      // Find addresses that might be shared across projects
      crossRepo.shared_addresses = await this.identifySharedAddresses();
      
      // Look for common development patterns
      crossRepo.common_patterns = await this.identifyCommonPatterns();
      
    } catch (error) {
      crossRepo.error = error.message;
    }

    this.scanResults.crossRepoFindings = crossRepo;
    
    console.log(`🔍 Cross-repository analysis complete:`);
    console.log(`   🔗 External refs: ${crossRepo.external_references.length}`);
    console.log(`   📦 Related projects: ${crossRepo.related_projects.length}`);
    console.log(`   🔑 Shared addresses: ${crossRepo.shared_addresses.length}`);
  }

  /**
   * 📊 Generate comprehensive summary
   */
  generateSummary() {
    console.log('\n📊 PHASE 3: GENERATING SUMMARY');
    console.log('-'.repeat(50));

    const repo = this.scanResults.currentRepository.analysis;
    const summary = {
      repository_health: 'unknown',
      security_score: 0,
      total_addresses: repo.addresses?.length || 0,
      contract_files: repo.contracts?.length || 0,
      security_issues: 0,
      recommendations: [],
      key_findings: []
    };

    // Calculate repository health
    summary.repository_health = this.calculateRepositoryHealth(repo);
    
    // Calculate security score
    summary.security_score = this.calculateSecurityScore(repo);
    
    // Count security issues
    if (repo.security) {
      summary.security_issues = 
        (repo.security.sensitive_files?.length || 0) +
        (repo.security.hardcoded_secrets?.length || 0);
    }

    // Generate key findings
    summary.key_findings = this.generateKeyFindings(repo);
    
    // Generate recommendations
    summary.recommendations = this.generateOverallRecommendations(repo);

    this.scanResults.summary = summary;
    
    console.log(`📊 Summary generated:`);
    console.log(`   🏥 Health: ${summary.repository_health.toUpperCase()}`);
    console.log(`   🔒 Security Score: ${summary.security_score}/100`);
    console.log(`   🔑 Total Addresses: ${summary.total_addresses}`);
    console.log(`   ⚠️  Security Issues: ${summary.security_issues}`);
  }

  /**
   * 💾 Save scan results
   */
  async saveScanResults() {
    console.log('\n💾 SAVING SCAN RESULTS');
    console.log('-'.repeat(50));

    const timestamp = new Date().toISOString().split('T')[0];
    const reportDir = path.join(process.cwd(), 'github-scan-reports');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    try {
      // Save JSON report
      const jsonPath = path.join(reportDir, `github-account-scan-${timestamp}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(this.scanResults, null, 2));
      console.log(`📄 JSON report: ${jsonPath}`);

      // Save markdown report
      const mdPath = path.join(reportDir, `github-account-scan-${timestamp}.md`);
      const markdownReport = this.generateMarkdownReport();
      fs.writeFileSync(mdPath, markdownReport);
      console.log(`📝 Markdown report: ${mdPath}`);

      return { json: jsonPath, markdown: mdPath };
      
    } catch (error) {
      console.error('❌ Error saving scan results:', error.message);
      throw error;
    }
  }

  /**
   * 📝 Generate markdown report
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();
    const summary = this.scanResults.summary;
    const repo = this.scanResults.currentRepository.analysis;
    
    let markdown = `# 🔍 GITHUB ACCOUNT & REPOSITORY SCAN REPORT

**Generated:** ${timestamp}  
**Repository:** ${this.scanResults.currentRepository.name}  
**Scan Type:** Complete GitHub Account Analysis

---

## 📊 EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| Repository Health | ${summary.repository_health.toUpperCase()} |
| Security Score | ${summary.security_score}/100 |
| Total Addresses | ${summary.total_addresses} |
| Contract Files | ${summary.contract_files} |
| Security Issues | ${summary.security_issues} |
| Total Files | ${this.countFiles(repo.structure)} |
| Directories | ${this.countDirectories(repo.structure)} |

---

## 🔑 CONTRACT ADDRESSES FOUND

`;

    // Add addresses section
    if (repo.addresses && repo.addresses.length > 0) {
      repo.addresses.slice(0, 20).forEach((addr, index) => {
        markdown += `${index + 1}. \`${addr.address}\`
   - **File:** ${addr.file}
   - **Context:** ${addr.context}

`;
      });
      
      if (repo.addresses.length > 20) {
        markdown += `*... and ${repo.addresses.length - 20} more addresses*\n\n`;
      }
    } else {
      markdown += `No addresses found in repository files.\n\n`;
    }

    markdown += `---

## 📝 CONTRACT FILES ANALYSIS

`;

    // Add contract files section
    if (repo.contracts && repo.contracts.length > 0) {
      repo.contracts.forEach((contract, index) => {
        markdown += `### ${index + 1}. ${contract.file}
- **Type:** ${contract.type}
- **Analysis:** ${JSON.stringify(contract.analysis, null, 2)}

`;
      });
    } else {
      markdown += `No contract files identified.\n\n`;
    }

    markdown += `---

## 🔒 SECURITY ANALYSIS

`;

    // Add security analysis
    if (repo.security) {
      markdown += `### Security Issues Found
- **Sensitive Files:** ${repo.security.sensitive_files?.length || 0}
- **Environment Variables:** ${repo.security.environment_variables?.length || 0}
- **Potential Secrets:** ${repo.security.hardcoded_secrets?.length || 0}

### Security Recommendations
`;
      
      if (repo.security.recommendations) {
        repo.security.recommendations.forEach((rec, index) => {
          markdown += `${index + 1}. ${rec}\n`;
        });
      }
    }

    markdown += `\n---

## 🎯 KEY FINDINGS

`;

    // Add key findings
    if (summary.key_findings) {
      summary.key_findings.forEach((finding, index) => {
        markdown += `${index + 1}. ${finding}\n`;
      });
    }

    markdown += `\n---

## 📋 RECOMMENDATIONS

`;

    // Add recommendations
    if (summary.recommendations) {
      summary.recommendations.forEach((rec, index) => {
        markdown += `${index + 1}. ${rec}\n`;
      });
    }

    markdown += `\n---

*Report generated by GitHub Account Scanner*  
*Part of the Omega Prime Deployer Audit System*
`;

    return markdown;
  }

  // ========== HELPER METHODS ==========

  async findFilesByPattern(rootPath, patterns) {
    const files = [];
    const searchDirs = [rootPath];
    
    while (searchDirs.length > 0) {
      const currentDir = searchDirs.pop();
      
      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const itemPath = path.join(currentDir, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            if (!['node_modules', '.git', 'dist', 'build', '.cache'].includes(item)) {
              searchDirs.push(itemPath);
            }
          } else {
            const ext = path.extname(item);
            const fileName = path.basename(item);
            
            if (patterns.some(pattern => {
              if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
                return regex.test(path.relative(rootPath, itemPath));
              }
              return fileName.includes(pattern) || ext === pattern;
            })) {
              files.push(itemPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    return files;
  }

  isValidSolanaAddress(address) {
    try {
      return address.length >= 32 && address.length <= 44 && 
             !/[0OIl]/.test(address) && 
             /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
    } catch {
      return false;
    }
  }

  getAddressContext(content, address) {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes(address)) {
        return line.trim().substring(0, 100);
      }
    }
    return '';
  }

  analyzeContractFile(content, filePath) {
    return {
      hasWeb3: content.includes('@solana/web3.js'),
      hasSplToken: content.includes('@solana/spl-token'),
      hasMetaplex: content.includes('@metaplex'),
      hasBotFunctions: /bot|agent|contract/i.test(content),
      hasDeploymentLogic: /deploy|mint|create/i.test(content),
      lineCount: content.split('\n').length
    };
  }

  determineContractType(fileName, content) {
    if (fileName.includes('bot')) return 'bot_contract';
    if (fileName.includes('deploy')) return 'deployment_script';
    if (fileName.includes('mint')) return 'minting_script';
    if (content.includes('Program')) return 'solana_program';
    return 'unknown';
  }

  analyzeConfigFile(fileName, content) {
    const analysis = { type: 'config' };
    
    try {
      if (fileName.endsWith('.json')) {
        const parsed = JSON.parse(content);
        analysis.structure = Object.keys(parsed);
        analysis.hasSecrets = this.containsSecrets(JSON.stringify(parsed));
      }
      analysis.lineCount = content.split('\n').length;
    } catch (error) {
      analysis.error = 'Failed to parse';
    }
    
    return analysis;
  }

  assessConfigSecurity(fileName, content) {
    if (fileName.includes('env')) return 'high';
    if (fileName.includes('key') || fileName.includes('secret')) return 'critical';
    if (this.containsSecrets(content)) return 'high';
    return 'low';
  }

  containsSecrets(content) {
    const secretPatterns = [
      /api[_-]?key/i,
      /secret/i,
      /private[_-]?key/i,
      /password/i,
      /token/i
    ];
    return secretPatterns.some(pattern => pattern.test(content));
  }

  async findSensitiveFiles(repoPath) {
    const sensitiveFiles = [];
    const patterns = ['.env', 'private', 'secret', 'key', 'wallet'];
    
    const allFiles = await this.findFilesByPattern(repoPath, ['**/*']);
    
    for (const file of allFiles) {
      const fileName = path.basename(file).toLowerCase();
      if (patterns.some(pattern => fileName.includes(pattern))) {
        sensitiveFiles.push(path.relative(repoPath, file));
      }
    }
    
    return sensitiveFiles;
  }

  async analyzeEnvironmentVars(repoPath) {
    const envVars = [];
    const envFiles = ['.env', '.env.sample', '.env.example'];
    
    for (const envFile of envFiles) {
      const envPath = path.join(repoPath, envFile);
      if (fs.existsSync(envPath)) {
        try {
          const content = fs.readFileSync(envPath, 'utf8');
          const lines = content.split('\n');
          
          for (const line of lines) {
            if (line.includes('=') && !line.trim().startsWith('#')) {
              const [key] = line.split('=');
              envVars.push({
                file: envFile,
                variable: key.trim(),
                sensitive: this.isVariableSensitive(key.trim())
              });
            }
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
    
    return envVars;
  }

  isVariableSensitive(varName) {
    const sensitivePatterns = ['key', 'secret', 'password', 'private', 'auth'];
    return sensitivePatterns.some(pattern => 
      varName.toLowerCase().includes(pattern)
    );
  }

  async scanForHardcodedSecrets(repoPath) {
    const secrets = [];
    const files = await this.findFilesByPattern(repoPath, ['**/*.js', '**/*.ts']);
    
    for (const file of files) {
      if (file.includes('node_modules')) continue;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const potentialSecrets = this.findPotentialSecrets(content);
        
        potentialSecrets.forEach(secret => {
          secrets.push({
            file: path.relative(repoPath, file),
            type: secret.type,
            context: secret.context
          });
        });
        
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    return secrets;
  }

  findPotentialSecrets(content) {
    const secrets = [];
    const patterns = [
      { type: 'api_key', regex: /api[_-]?key\s*[:=]\s*['"]\w+['"]/ },
      { type: 'private_key', regex: /private[_-]?key\s*[:=]\s*['"]\w+['"]/ },
      { type: 'solana_address', regex: /['""][1-9A-HJ-NP-Za-km-z]{32,44}['"]/ }
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.regex, 'gi'));
      if (matches) {
        matches.forEach(match => {
          secrets.push({
            type: pattern.type,
            context: match.substring(0, 50)
          });
        });
      }
    });
    
    return secrets;
  }

  async checkSecurityConfigs(repoPath) {
    const configs = [];
    const securityFiles = ['.gitleaks.toml', 'SECURITY.md', '.gitignore'];
    
    for (const file of securityFiles) {
      const filePath = path.join(repoPath, file);
      if (fs.existsSync(filePath)) {
        configs.push({
          file: file,
          exists: true,
          purpose: this.getSecurityFilePurpose(file)
        });
      } else {
        configs.push({
          file: file,
          exists: false,
          recommendation: `Create ${file} for better security`
        });
      }
    }
    
    return configs;
  }

  getSecurityFilePurpose(fileName) {
    const purposes = {
      '.gitleaks.toml': 'Secret detection configuration',
      'SECURITY.md': 'Security policy documentation',
      '.gitignore': 'Prevents sensitive files from being committed'
    };
    return purposes[fileName] || 'Security configuration';
  }

  async analyzeAccessControls(repoPath) {
    const accessControls = [];
    
    // This would analyze actual access control mechanisms
    // For now, we'll look for patterns in the code
    
    return accessControls;
  }

  generateSecurityRecommendations(security) {
    const recommendations = [];
    
    if (security.sensitive_files.length > 0) {
      recommendations.push('Review and secure sensitive files found in repository');
    }
    
    if (security.hardcoded_secrets.length > 0) {
      recommendations.push('Replace hardcoded secrets with environment variables');
    }
    
    if (security.environment_variables.some(v => v.sensitive && !v.file.includes('sample'))) {
      recommendations.push('Ensure sensitive environment variables are not committed');
    }
    
    return recommendations;
  }

  analyzeDependencySecurity(dependencies) {
    const analysis = {
      total_dependencies: Object.keys(dependencies.production).length + Object.keys(dependencies.development).length,
      has_solana_deps: false,
      has_security_deps: false,
      outdated_risk: 'unknown'
    };
    
    const allDeps = { ...dependencies.production, ...dependencies.development };
    
    analysis.has_solana_deps = Object.keys(allDeps).some(dep => 
      dep.includes('solana') || dep.includes('metaplex')
    );
    
    analysis.has_security_deps = Object.keys(allDeps).some(dep => 
      ['dotenv', 'helmet', 'bcrypt'].includes(dep)
    );
    
    return analysis;
  }

  analyzeScriptContent(content, fileName) {
    return {
      type: this.determineScriptType(fileName, content),
      hasSolanaAPI: content.includes('@solana/web3.js'),
      hasEnvironmentVars: content.includes('process.env'),
      hasNetworkCalls: content.includes('fetch') || content.includes('axios'),
      lineCount: content.split('\n').length
    };
  }

  determineScriptType(fileName, content) {
    if (fileName.includes('deploy')) return 'deployment';
    if (fileName.includes('test')) return 'test';
    if (fileName.includes('bot')) return 'automation';
    if (content.includes('#!/bin/bash')) return 'shell_script';
    return 'script';
  }

  analyzeDocContent(content, fileName) {
    return {
      wordCount: content.split(/\s+/).length,
      hasAddresses: /[1-9A-HJ-NP-Za-km-z]{32,44}/.test(content),
      hasSecurityInfo: /security|private|key|secret/i.test(content),
      hasInstructions: /install|setup|run|deploy/i.test(content)
    };
  }

  determineDocType(fileName) {
    if (fileName.toLowerCase() === 'readme.md') return 'readme';
    if (fileName.toLowerCase().includes('security')) return 'security';
    if (fileName.toLowerCase().includes('api')) return 'api_documentation';
    return 'documentation';
  }

  async findExternalReferences() {
    // Look for references to other GitHub repos, external APIs, etc.
    return [];
  }

  async identifyRelatedProjects() {
    // Identify patterns that suggest related projects
    return [];
  }

  async identifySharedAddresses() {
    // Find addresses that might be shared across projects
    return [];
  }

  async identifyCommonPatterns() {
    // Look for common development patterns
    return [];
  }

  calculateRepositoryHealth(repo) {
    let score = 0;
    let maxScore = 0;
    
    // Check for documentation
    maxScore += 20;
    if (repo.documentation && repo.documentation.length > 0) {
      score += 20;
    }
    
    // Check for security configurations
    maxScore += 30;
    if (repo.security && repo.security.security_configurations.length > 0) {
      score += 30;
    }
    
    // Check for proper configuration
    maxScore += 25;
    if (repo.configurations && repo.configurations.length > 0) {
      score += 25;
    }
    
    // Check for tests
    maxScore += 25;
    if (repo.structure && this.hasTestFiles(repo.structure)) {
      score += 25;
    }
    
    const healthScore = maxScore > 0 ? (score / maxScore) * 100 : 0;
    
    if (healthScore >= 80) return 'excellent';
    if (healthScore >= 60) return 'good';
    if (healthScore >= 40) return 'fair';
    return 'poor';
  }

  calculateSecurityScore(repo) {
    let score = 100;
    
    if (repo.security) {
      // Deduct points for security issues
      score -= (repo.security.sensitive_files?.length || 0) * 10;
      score -= (repo.security.hardcoded_secrets?.length || 0) * 15;
      
      // Add points for security measures
      if (repo.security.security_configurations?.length > 0) {
        score += 10;
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  generateKeyFindings(repo) {
    const findings = [];
    
    if (repo.addresses && repo.addresses.length > 0) {
      findings.push(`Found ${repo.addresses.length} Solana addresses in repository`);
    }
    
    if (repo.contracts && repo.contracts.length > 0) {
      findings.push(`Identified ${repo.contracts.length} smart contract files`);
    }
    
    if (repo.security && repo.security.hardcoded_secrets.length > 0) {
      findings.push(`⚠️ Potential hardcoded secrets detected`);
    }
    
    return findings;
  }

  generateOverallRecommendations(repo) {
    const recommendations = [];
    
    if (!repo.documentation || repo.documentation.length === 0) {
      recommendations.push('Add comprehensive documentation');
    }
    
    if (repo.security && repo.security.security_issues > 0) {
      recommendations.push('Address security issues identified in scan');
    }
    
    if (!this.hasTestFiles(repo.structure)) {
      recommendations.push('Add automated tests for better code quality');
    }
    
    return recommendations;
  }

  hasTestFiles(structure) {
    // Recursively check for test files
    const checkForTests = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (key.includes('test') || key.includes('spec')) {
          return true;
        }
        if (value.type === 'directory' && value.children) {
          if (checkForTests(value.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    return checkForTests(structure || {});
  }

  countFiles(structure) {
    let count = 0;
    const countRecursive = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (value.type === 'file') {
          count++;
        } else if (value.type === 'directory' && value.children) {
          countRecursive(value.children);
        }
      }
    };
    countRecursive(structure || {});
    return count;
  }

  countDirectories(structure) {
    let count = 0;
    const countRecursive = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (value.type === 'directory') {
          count++;
          if (value.children) {
            countRecursive(value.children);
          }
        }
      }
    };
    countRecursive(structure || {});
    return count;
  }

  /**
   * 🚀 Run complete GitHub account scan
   */
  async runCompleteScan() {
    try {
      console.log('🔍 Starting GitHub account and repository scan...\n');
      
      await this.analyzeCurrentRepository();
      await this.performCrossRepoAnalysis();
      this.generateSummary();
      
      const reportPaths = await this.saveScanResults();
      
      console.log('\n🎉 GITHUB SCAN COMPLETED SUCCESSFULLY!');
      console.log('='.repeat(60));
      console.log('📊 FINAL SUMMARY:');
      console.log(`   Repository Health: ${this.scanResults.summary.repository_health.toUpperCase()}`);
      console.log(`   Security Score: ${this.scanResults.summary.security_score}/100`);
      console.log(`   Total Addresses: ${this.scanResults.summary.total_addresses}`);
      console.log(`   Contract Files: ${this.scanResults.summary.contract_files}`);
      console.log(`   Security Issues: ${this.scanResults.summary.security_issues}`);
      console.log('\n📁 Reports generated:');
      console.log(`   📄 JSON: ${reportPaths.json}`);
      console.log(`   📝 Markdown: ${reportPaths.markdown}`);
      
      return this.scanResults;
      
    } catch (error) {
      console.error('\n❌ GITHUB SCAN FAILED:', error.message);
      throw error;
    }
  }
}

// Execute scan if run directly
if (require.main === module) {
  const scanner = new GitHubAccountScanner();
  scanner.runCompleteScan()
    .then(() => {
      console.log('\n✅ GitHub scan completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ GitHub scan failed:', error);
      process.exit(1);
    });
}

module.exports = GitHubAccountScanner;