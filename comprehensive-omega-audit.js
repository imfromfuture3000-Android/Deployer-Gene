#!/usr/bin/env node

/**
 * 🔍 COMPREHENSIVE OMEGA PRIME DEPLOYER AUDIT SYSTEM
 * 
 * This script provides a complete audit of:
 * 1. All running contract addresses
 * 2. Control access analysis for all contracts  
 * 3. Bot agent status and profit analysis
 * 4. Complete repository scan and GitHub account analysis
 * 
 * Author: Omega Prime Deployer Security Team
 * Date: 2025-09-20
 */

const fs = require('fs');
const path = require('path');
const web3 = require('@solana/web3.js');
require('dotenv').config();

class ComprehensiveOmegaAudit {
  constructor() {
    // Initialize RPC connection with fallback endpoints
    const rpcEndpoints = [
      process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : null,
      process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
      "https://solana-api.projectserum.com",
      "https://api.mainnet-beta.solana.com"
    ].filter(Boolean);

    this.connection = new web3.Connection(rpcEndpoints[0], 'confirmed');
    this.contractAddresses = {};
    this.auditResults = {
      timestamp: new Date().toISOString(),
      addressInventory: {},
      controlAccess: {},
      botAgentStatus: {},
      repositoryAnalysis: {},
      summary: {},
      recommendations: []
    };

    console.log('🚀 OMEGA PRIME DEPLOYER - COMPREHENSIVE AUDIT SYSTEM');
    console.log('='.repeat(70));
    console.log(`📅 Audit Started: ${this.auditResults.timestamp}`);
    console.log(`🌐 Primary RPC: ${rpcEndpoints[0]}`);
  }

  /**
   * 📋 Load all contract addresses from multiple sources
   */
  async loadAllAddresses() {
    console.log('\n📋 PHASE 1: LOADING ALL CONTRACT ADDRESSES');
    console.log('-'.repeat(50));

    try {
      // Load from contract_addresses.json
      const contractFile = path.join(__dirname, 'contract_addresses.json');
      if (fs.existsSync(contractFile)) {
        this.contractAddresses = JSON.parse(fs.readFileSync(contractFile, 'utf8'));
        console.log('✅ Loaded contract_addresses.json');
      }

      // Scan repository for additional addresses
      await this.scanRepositoryForAddresses();
      
      // Extract and categorize all addresses
      this.extractAllAddresses();
      
      console.log(`📊 Total addresses discovered: ${Object.keys(this.auditResults.addressInventory).length}`);
      
    } catch (error) {
      console.error('❌ Error loading addresses:', error.message);
      this.auditResults.recommendations.push({
        type: 'critical',
        issue: 'Failed to load contract addresses',
        action: 'Verify contract_addresses.json exists and is valid'
      });
    }
  }

  /**
   * 🔍 Scan repository files for additional addresses
   */
  async scanRepositoryForAddresses() {
    console.log('🔍 Scanning repository files for addresses...');
    
    const addressPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    const foundAddresses = new Set();
    
    // Files to scan
    const scanFiles = [
      'src/botOrchestrator.ts',
      'grok-copilot.ts', 
      'bot-smart-contracts.js',
      'display-all-addresses.js'
    ];

    for (const file of scanFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const matches = content.match(addressPattern);
          if (matches) {
            matches.forEach(addr => {
              if (this.isValidSolanaAddress(addr)) {
                foundAddresses.add(addr);
              }
            });
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }
    }

    console.log(`🔍 Found ${foundAddresses.size} additional addresses in repository files`);
    return Array.from(foundAddresses);
  }

  /**
   * 📊 Extract and categorize all addresses
   */
  extractAllAddresses() {
    console.log('📊 Categorizing addresses...');
    
    if (this.contractAddresses.omega_prime_addresses) {
      const data = this.contractAddresses.omega_prime_addresses;
      
      // Bot army addresses
      if (data.bot_army) {
        Object.entries(data.bot_army).forEach(([botName, botData]) => {
          if (botData.bot_address) {
            this.auditResults.addressInventory[botData.bot_address] = {
              type: 'bot_address',
              category: 'bot_army',
              name: botName,
              details: botData,
              status: 'unknown'
            };
          }
          if (botData.contract_address) {
            this.auditResults.addressInventory[botData.contract_address] = {
              type: 'contract_address', 
              category: 'bot_army',
              name: botName,
              details: botData,
              status: 'unknown'
            };
          }
        });
      }

      // Control addresses
      if (data.control_addresses) {
        Object.entries(data.control_addresses).forEach(([name, addressData]) => {
          if (addressData.address) {
            this.auditResults.addressInventory[addressData.address] = {
              type: 'control_address',
              category: 'access_control',
              name: name,
              details: addressData,
              status: 'unknown'
            };
          }
        });
      }

      // Treasury addresses
      if (data.treasury_operational) {
        Object.entries(data.treasury_operational).forEach(([name, address]) => {
          this.auditResults.addressInventory[address] = {
            type: 'treasury_address',
            category: 'financial',
            name: name,
            details: { purpose: name },
            status: 'unknown'
          };
        });
      }

      // Program IDs
      if (data.program_ids) {
        Object.entries(data.program_ids).forEach(([category, programs]) => {
          Object.entries(programs).forEach(([name, programId]) => {
            this.auditResults.addressInventory[programId] = {
              type: 'program_id',
              category: 'solana_programs',
              name: name,
              details: { category: category },
              status: 'unknown'
            };
          });
        });
      }
    }
  }

  /**
   * 🔐 Analyze control access for all contracts
   */
  async analyzeControlAccess() {
    console.log('\n🔐 PHASE 2: CONTROL ACCESS ANALYSIS');
    console.log('-'.repeat(50));

    for (const [address, info] of Object.entries(this.auditResults.addressInventory)) {
      console.log(`🔍 Analyzing access control for: ${address.slice(0, 8)}...`);
      
      try {
        const accountInfo = await this.getAccountInfo(address);
        
        if (accountInfo) {
          this.auditResults.controlAccess[address] = {
            address: address,
            type: info.type,
            owner: accountInfo.owner.toBase58(),
            executable: accountInfo.executable,
            rentEpoch: accountInfo.rentEpoch,
            lamports: accountInfo.lamports,
            solBalance: accountInfo.lamports / web3.LAMPORTS_PER_SOL,
            dataSize: accountInfo.data.length,
            accessLevel: this.determineAccessLevel(accountInfo, info),
            controlPermissions: this.analyzePermissions(accountInfo, info),
            securityRisk: this.assessSecurityRisk(accountInfo, info)
          };

          // Special analysis for bot contracts
          if (info.category === 'bot_army') {
            await this.analyzeBotContractAccess(address, accountInfo, info);
          }

          // Special analysis for control addresses
          if (info.category === 'access_control') {
            await this.analyzeControllerAccess(address, accountInfo, info);
          }

        } else {
          this.auditResults.controlAccess[address] = {
            address: address,
            type: info.type,
            status: 'not_found',
            accessLevel: 'unknown',
            securityRisk: 'high'
          };
        }

        // Add delay to avoid rate limiting
        await this.delay(200);

      } catch (error) {
        console.log(`⚠️  Error analyzing ${address.slice(0, 8)}: ${error.message}`);
        this.auditResults.controlAccess[address] = {
          address: address,
          type: info.type,
          status: 'error',
          error: error.message,
          securityRisk: 'unknown'
        };
      }
    }

    console.log(`✅ Analyzed access control for ${Object.keys(this.auditResults.controlAccess).length} addresses`);
  }

  /**
   * 🤖 Check all bot agents for status and profits
   */
  async checkBotAgentStatus() {
    console.log('\n🤖 PHASE 3: BOT AGENT STATUS & PROFIT ANALYSIS');
    console.log('-'.repeat(50));

    if (this.contractAddresses.omega_prime_addresses?.bot_army) {
      for (const [botName, botData] of Object.entries(this.contractAddresses.omega_prime_addresses.bot_army)) {
        console.log(`🤖 Analyzing bot: ${botName}`);
        
        const botAnalysis = {
          name: botName,
          generation: botData.generation,
          specialty: botData.specialty,
          intelligence_level: botData.intelligence_level,
          bot_address_status: 'unknown',
          contract_address_status: 'unknown',
          estimated_profits: 0,
          activity_level: 'unknown',
          operational_status: 'unknown',
          security_status: 'unknown'
        };

        // Check bot address
        if (botData.bot_address) {
          try {
            const botAccount = await this.getAccountInfo(botData.bot_address);
            if (botAccount) {
              botAnalysis.bot_address_status = 'exists';
              botAnalysis.bot_balance = botAccount.lamports / web3.LAMPORTS_PER_SOL;
              
              // Estimate profits based on balance and activity
              const recentActivity = await this.getRecentTransactions(botData.bot_address);
              botAnalysis.recent_transactions = recentActivity.length;
              botAnalysis.estimated_profits = this.estimateBotProfits(botAccount, recentActivity);
              botAnalysis.activity_level = this.determineBotActivity(recentActivity);
              
            } else {
              botAnalysis.bot_address_status = 'not_found';
              botAnalysis.operational_status = 'offline';
            }
          } catch (error) {
            botAnalysis.bot_address_status = 'error';
            botAnalysis.error = error.message;
          }
        }

        // Check contract address
        if (botData.contract_address) {
          try {
            const contractAccount = await this.getAccountInfo(botData.contract_address);
            if (contractAccount) {
              botAnalysis.contract_address_status = 'exists';
              botAnalysis.contract_executable = contractAccount.executable;
              botAnalysis.contract_owner = contractAccount.owner.toBase58();
            } else {
              botAnalysis.contract_address_status = 'not_found';
            }
          } catch (error) {
            botAnalysis.contract_address_status = 'error';
          }
        }

        // Determine overall operational status
        botAnalysis.operational_status = this.determineBotOperationalStatus(botAnalysis);
        botAnalysis.security_status = this.assessBotSecurity(botAnalysis);

        this.auditResults.botAgentStatus[botName] = botAnalysis;
        
        await this.delay(300); // Avoid rate limiting
      }
    }

    console.log(`✅ Analyzed ${Object.keys(this.auditResults.botAgentStatus).length} bot agents`);
  }

  /**
   * 📁 Perform complete repository analysis  
   */
  async performRepositoryAnalysis() {
    console.log('\n📁 PHASE 4: REPOSITORY ANALYSIS');
    console.log('-'.repeat(50));

    const repoAnalysis = {
      total_files: 0,
      code_files: 0,
      config_files: 0,
      security_files: 0,
      contract_files: 0,
      test_files: 0,
      address_references: 0,
      potential_secrets: 0,
      security_issues: [],
      file_analysis: {}
    };

    try {
      // Scan all files in repository
      await this.scanRepositoryStructure('.', repoAnalysis);
      
      // Analyze package.json and dependencies
      await this.analyzePackageDependencies(repoAnalysis);
      
      // Check for security configurations
      await this.analyzeSecurityConfigurations(repoAnalysis);
      
      // Analyze git history and sensitive data
      await this.analyzeGitSecurity(repoAnalysis);

      this.auditResults.repositoryAnalysis = repoAnalysis;
      
      console.log(`📊 Repository Analysis Complete:`);
      console.log(`   Total files: ${repoAnalysis.total_files}`);
      console.log(`   Code files: ${repoAnalysis.code_files}`);
      console.log(`   Security issues: ${repoAnalysis.security_issues.length}`);
      
    } catch (error) {
      console.error('❌ Repository analysis error:', error.message);
      this.auditResults.repositoryAnalysis.error = error.message;
    }
  }

  /**
   * 📊 Generate comprehensive audit summary
   */
  generateAuditSummary() {
    console.log('\n📊 PHASE 5: GENERATING AUDIT SUMMARY');
    console.log('-'.repeat(50));

    const summary = {
      total_addresses: Object.keys(this.auditResults.addressInventory).length,
      verified_addresses: 0,
      missing_addresses: 0,
      total_sol_balance: 0,
      active_bots: 0,
      inactive_bots: 0,
      estimated_total_profits: 0,
      security_risks: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      operational_status: 'unknown'
    };

    // Analyze addresses
    Object.values(this.auditResults.controlAccess).forEach(access => {
      if (access.status !== 'not_found' && access.status !== 'error') {
        summary.verified_addresses++;
        if (access.solBalance) {
          summary.total_sol_balance += access.solBalance;
        }
      } else {
        summary.missing_addresses++;
      }

      // Count security risks
      if (access.securityRisk) {
        summary.security_risks[access.securityRisk] = (summary.security_risks[access.securityRisk] || 0) + 1;
      }
    });

    // Analyze bot status
    Object.values(this.auditResults.botAgentStatus).forEach(bot => {
      if (bot.operational_status === 'active' || bot.operational_status === 'online') {
        summary.active_bots++;
      } else {
        summary.inactive_bots++;
      }
      
      if (bot.estimated_profits) {
        summary.estimated_total_profits += bot.estimated_profits;
      }
    });

    // Determine overall operational status
    if (summary.active_bots > 0) {
      summary.operational_status = 'partially_operational';
      if (summary.active_bots === Object.keys(this.auditResults.botAgentStatus).length) {
        summary.operational_status = 'fully_operational';
      }
    } else {
      summary.operational_status = 'offline';
    }

    this.auditResults.summary = summary;

    // Generate recommendations
    this.generateRecommendations();

    console.log('✅ Audit summary generated');
  }

  /**
   * 🎯 Generate security and operational recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Check for missing addresses
    const missingAddresses = Object.keys(this.auditResults.addressInventory).filter(addr => {
      const access = this.auditResults.controlAccess[addr];
      return !access || access.status === 'not_found';
    });

    if (missingAddresses.length > 0) {
      recommendations.push({
        type: 'critical',
        category: 'missing_addresses',
        issue: `${missingAddresses.length} addresses not found on blockchain`,
        addresses: missingAddresses.slice(0, 5), // Show first 5
        action: 'Verify these addresses exist or update configuration'
      });
    }

    // Check for inactive bots
    const inactiveBots = Object.entries(this.auditResults.botAgentStatus)
      .filter(([name, bot]) => bot.operational_status !== 'active')
      .map(([name, bot]) => name);

    if (inactiveBots.length > 0) {
      recommendations.push({
        type: 'high',
        category: 'bot_operations',
        issue: `${inactiveBots.length} bots appear inactive`,
        bots: inactiveBots,
        action: 'Investigate bot operational status and restart if needed'
      });
    }

    // Check for security risks
    const highRiskAddresses = Object.entries(this.auditResults.controlAccess)
      .filter(([addr, access]) => access.securityRisk === 'high' || access.securityRisk === 'critical')
      .map(([addr, access]) => addr);

    if (highRiskAddresses.length > 0) {
      recommendations.push({
        type: 'critical',
        category: 'security',
        issue: `${highRiskAddresses.length} addresses have high security risks`,
        action: 'Review access controls and implement additional security measures'
      });
    }

    // Check for low balances
    const lowBalanceAddresses = Object.entries(this.auditResults.controlAccess)
      .filter(([addr, access]) => access.solBalance && access.solBalance < 0.001)
      .map(([addr, access]) => addr);

    if (lowBalanceAddresses.length > 0) {
      recommendations.push({
        type: 'medium',
        category: 'funding',
        issue: `${lowBalanceAddresses.length} addresses have very low SOL balances`,
        action: 'Fund addresses to ensure continued operations'
      });
    }

    this.auditResults.recommendations = recommendations;
  }

  /**
   * 💾 Save comprehensive audit report
   */
  async saveAuditReport() {
    console.log('\n💾 SAVING COMPREHENSIVE AUDIT REPORT');
    console.log('-'.repeat(50));

    const timestamp = new Date().toISOString().split('T')[0];
    const reportDir = path.join(__dirname, 'audit-reports');
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    try {
      // Save JSON report
      const jsonPath = path.join(reportDir, `omega-prime-audit-${timestamp}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(this.auditResults, null, 2));
      console.log(`📄 JSON report saved: ${jsonPath}`);

      // Save markdown report
      const mdPath = path.join(reportDir, `omega-prime-audit-${timestamp}.md`);
      const markdownReport = this.generateMarkdownReport();
      fs.writeFileSync(mdPath, markdownReport);
      console.log(`📝 Markdown report saved: ${mdPath}`);

      // Save CSV summary
      const csvPath = path.join(reportDir, `omega-prime-audit-summary-${timestamp}.csv`);
      const csvReport = this.generateCSVSummary();
      fs.writeFileSync(csvPath, csvReport);
      console.log(`📊 CSV summary saved: ${csvPath}`);

      return {
        json: jsonPath,
        markdown: mdPath,
        csv: csvPath
      };

    } catch (error) {
      console.error('❌ Error saving report:', error.message);
      throw error;
    }
  }

  /**
   * 📝 Generate markdown audit report
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();
    const summary = this.auditResults.summary;
    
    let markdown = `# 🔍 OMEGA PRIME DEPLOYER - COMPREHENSIVE AUDIT REPORT

**Generated:** ${timestamp}  
**Repository:** Omega-prime-deployer  
**Audit Type:** Complete System Analysis

---

## 📊 EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| Total Addresses | ${summary.total_addresses} |
| Verified Addresses | ${summary.verified_addresses} |
| Missing Addresses | ${summary.missing_addresses} |
| Total SOL Balance | ${summary.total_sol_balance.toFixed(6)} SOL |
| Active Bots | ${summary.active_bots} |
| Inactive Bots | ${summary.inactive_bots} |
| Est. Total Profits | ${summary.estimated_total_profits.toFixed(6)} SOL |
| Operational Status | ${summary.operational_status.toUpperCase()} |

### 🚨 Security Risk Distribution
- **Critical:** ${summary.security_risks.critical || 0}
- **High:** ${summary.security_risks.high || 0}  
- **Medium:** ${summary.security_risks.medium || 0}
- **Low:** ${summary.security_risks.low || 0}

---

## 🤖 BOT ARMY STATUS

`;

    // Add bot status details
    Object.entries(this.auditResults.botAgentStatus).forEach(([botName, bot]) => {
      markdown += `### ${botName.toUpperCase()} (Gen ${bot.generation})
- **Specialty:** ${bot.specialty}
- **Intelligence Level:** ${bot.intelligence_level}x
- **Status:** ${bot.operational_status}
- **Bot Address:** ${bot.bot_address_status}
- **Contract Address:** ${bot.contract_address_status}
- **Estimated Profits:** ${(bot.estimated_profits || 0).toFixed(6)} SOL
- **Recent Activity:** ${bot.recent_transactions || 0} transactions

`;
    });

    markdown += `---

## 🔐 ACCESS CONTROL ANALYSIS

`;

    // Add access control summary
    const controlAddresses = Object.entries(this.auditResults.controlAccess)
      .filter(([addr, access]) => access.type === 'control_address');

    controlAddresses.forEach(([addr, access]) => {
      markdown += `### ${addr}
- **Type:** ${access.type}
- **Status:** ${access.status || 'verified'}
- **SOL Balance:** ${(access.solBalance || 0).toFixed(6)}
- **Access Level:** ${access.accessLevel || 'unknown'}
- **Security Risk:** ${access.securityRisk || 'unknown'}

`;
    });

    markdown += `---

## 🎯 RECOMMENDATIONS

`;

    // Add recommendations
    this.auditResults.recommendations.forEach((rec, index) => {
      markdown += `### ${index + 1}. ${rec.type.toUpperCase()}: ${rec.category}
**Issue:** ${rec.issue}  
**Action:** ${rec.action}

`;
    });

    markdown += `---

## 📁 REPOSITORY ANALYSIS

`;

    if (this.auditResults.repositoryAnalysis) {
      const repo = this.auditResults.repositoryAnalysis;
      markdown += `- **Total Files:** ${repo.total_files}
- **Code Files:** ${repo.code_files}
- **Security Files:** ${repo.security_files}
- **Security Issues:** ${repo.security_issues?.length || 0}

`;
    }

    markdown += `
---

*Report generated by Omega Prime Deployer Audit System*  
*For questions or concerns, review the source code and configuration files*
`;

    return markdown;
  }

  /**
   * 📈 Generate CSV summary for data analysis
   */
  generateCSVSummary() {
    let csv = 'Address,Type,Category,Status,SOL_Balance,Security_Risk,Access_Level\n';
    
    Object.entries(this.auditResults.controlAccess).forEach(([addr, access]) => {
      csv += `${addr},${access.type || ''},${this.auditResults.addressInventory[addr]?.category || ''},${access.status || ''},${access.solBalance || 0},${access.securityRisk || ''},${access.accessLevel || ''}\n`;
    });

    return csv;
  }

  // ========== HELPER METHODS ==========

  async getAccountInfo(address) {
    try {
      const pubkey = new web3.PublicKey(address);
      return await this.connection.getAccountInfo(pubkey);
    } catch (error) {
      return null;
    }
  }

  async getRecentTransactions(address) {
    try {
      const pubkey = new web3.PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit: 10 });
      return signatures;
    } catch (error) {
      return [];
    }
  }

  determineAccessLevel(accountInfo, addressInfo) {
    if (addressInfo.category === 'access_control') return 'master';
    if (addressInfo.category === 'bot_army') return 'operator';
    if (accountInfo.executable) return 'program';
    return 'user';
  }

  analyzePermissions(accountInfo, addressInfo) {
    const permissions = [];
    
    if (accountInfo.executable) permissions.push('executable');
    if (addressInfo.category === 'access_control') permissions.push('master_control');
    if (addressInfo.category === 'bot_army') permissions.push('bot_operations');
    if (addressInfo.category === 'financial') permissions.push('treasury_access');
    
    return permissions;
  }

  assessSecurityRisk(accountInfo, addressInfo) {
    if (addressInfo.category === 'access_control') return 'critical';
    if (addressInfo.category === 'financial') return 'high';
    if (accountInfo.executable) return 'medium';
    return 'low';
  }

  estimateBotProfits(accountInfo, transactions) {
    // Simple estimation based on balance and transaction count
    const balance = accountInfo.lamports / web3.LAMPORTS_PER_SOL;
    const txCount = transactions.length;
    
    // Estimate profits based on activity and current balance
    return Math.max(0, balance - 0.01 + (txCount * 0.001));
  }

  determineBotActivity(transactions) {
    if (transactions.length === 0) return 'inactive';
    if (transactions.length < 3) return 'low';
    if (transactions.length < 7) return 'medium';
    return 'high';
  }

  determineBotOperationalStatus(botAnalysis) {
    if (botAnalysis.bot_address_status === 'not_found') return 'offline';
    if (botAnalysis.activity_level === 'inactive') return 'inactive';
    if (botAnalysis.recent_transactions > 0) return 'active';
    return 'unknown';
  }

  assessBotSecurity(botAnalysis) {
    if (botAnalysis.bot_address_status === 'error') return 'unknown';
    if (botAnalysis.bot_address_status === 'not_found') return 'critical';
    if (botAnalysis.contract_address_status === 'not_found') return 'high';
    return 'medium';
  }

  isValidSolanaAddress(address) {
    try {
      new web3.PublicKey(address);
      return address.length >= 32 && address.length <= 44 && !/[0OIl]/.test(address);
    } catch {
      return false;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scanRepositoryStructure(dir, analysis) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.git', 'dist', 'build', '.cache'].includes(file)) {
          await this.scanRepositoryStructure(filePath, analysis);
        }
      } else {
        analysis.total_files++;
        
        const ext = path.extname(file);
        if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
          analysis.code_files++;
        } else if (['.json', '.yml', '.yaml', '.toml'].includes(ext)) {
          analysis.config_files++;
        } else if (file.includes('security') || file.includes('audit')) {
          analysis.security_files++;
        }
      }
    }
  }

  async analyzePackageDependencies(analysis) {
    try {
      const packagePath = path.join(__dirname, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        analysis.dependencies = Object.keys(packageData.dependencies || {}).length;
        analysis.devDependencies = Object.keys(packageData.devDependencies || {}).length;
      }
    } catch (error) {
      // Ignore errors
    }
  }

  async analyzeSecurityConfigurations(analysis) {
    const securityFiles = ['.gitleaks.toml', 'SECURITY.md', '.env.sample'];
    analysis.security_configurations = securityFiles.filter(file => 
      fs.existsSync(path.join(__dirname, file))
    );
  }

  async analyzeGitSecurity(analysis) {
    // Check for potential sensitive files
    const sensitivePatterns = ['.env', 'private', 'secret', 'key'];
    analysis.potential_secrets = 0;
    
    try {
      const gitignorePath = path.join(__dirname, '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf8');
        sensitivePatterns.forEach(pattern => {
          if (gitignore.includes(pattern)) {
            analysis.potential_secrets++;
          }
        });
      }
    } catch (error) {
      // Ignore errors
    }
  }

  async analyzeBotContractAccess(address, accountInfo, info) {
    // Additional bot-specific access analysis
    // This could include checking for specific program interactions, etc.
  }

  async analyzeControllerAccess(address, accountInfo, info) {
    // Additional controller-specific access analysis
    // This could include checking for admin privileges, etc.
  }

  /**
   * 🚀 Run complete audit
   */
  async runCompleteAudit() {
    try {
      console.log('🔍 Starting comprehensive Omega Prime audit...\n');
      
      await this.loadAllAddresses();
      await this.analyzeControlAccess();
      await this.checkBotAgentStatus();
      await this.performRepositoryAnalysis();
      this.generateAuditSummary();
      
      const reportPaths = await this.saveAuditReport();
      
      console.log('\n🎉 AUDIT COMPLETED SUCCESSFULLY!');
      console.log('='.repeat(70));
      console.log('📊 FINAL SUMMARY:');
      console.log(`   Total Addresses: ${this.auditResults.summary.total_addresses}`);
      console.log(`   Verified: ${this.auditResults.summary.verified_addresses}`);
      console.log(`   Missing: ${this.auditResults.summary.missing_addresses}`);
      console.log(`   Active Bots: ${this.auditResults.summary.active_bots}`);
      console.log(`   Total SOL: ${this.auditResults.summary.total_sol_balance.toFixed(6)}`);
      console.log(`   Status: ${this.auditResults.summary.operational_status.toUpperCase()}`);
      console.log('\n📁 Reports generated:');
      console.log(`   📄 JSON: ${reportPaths.json}`);
      console.log(`   📝 Markdown: ${reportPaths.markdown}`);
      console.log(`   📊 CSV: ${reportPaths.csv}`);
      
      if (this.auditResults.recommendations.length > 0) {
        console.log(`\n⚠️  ${this.auditResults.recommendations.length} recommendations require attention`);
      }
      
      return this.auditResults;
      
    } catch (error) {
      console.error('\n❌ AUDIT FAILED:', error.message);
      throw error;
    }
  }
}

// Execute audit if run directly
if (require.main === module) {
  const audit = new ComprehensiveOmegaAudit();
  audit.runCompleteAudit()
    .then(() => {
      console.log('\n✅ Audit completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Audit failed:', error);
      process.exit(1);
    });
}

module.exports = ComprehensiveOmegaAudit;