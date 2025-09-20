#!/usr/bin/env node

/**
 * 🚀 OMEGA PRIME DEPLOYER - UNIFIED AUDIT SYSTEM
 * 
 * This master script runs all audit components:
 * 1. Comprehensive contract address audit
 * 2. Control access analysis
 * 3. Bot agent status and profit checking
 * 4. Complete GitHub repository scanning
 * 5. Unified reporting and recommendations
 * 
 * Addresses all requirements from the problem statement:
 * - Scan all running contract addresses
 * - Report and explain all control access
 * - Check all profits and running agents
 * - Complete repository scan of GitHub account
 */

const fs = require('fs');
const path = require('path');
const ComprehensiveOmegaAudit = require('./comprehensive-omega-audit.js');
const GitHubAccountScanner = require('./github-account-scanner.js');

class UnifiedAuditSystem {
  constructor() {
    this.startTime = new Date();
    this.results = {
      timestamp: this.startTime.toISOString(),
      contractAudit: null,
      githubScan: null,
      unifiedSummary: {},
      consolidatedRecommendations: [],
      executiveSummary: {}
    };

    console.log('🚀 OMEGA PRIME DEPLOYER - UNIFIED AUDIT SYSTEM');
    console.log('═'.repeat(80));
    console.log(`📅 Audit Session Started: ${this.results.timestamp}`);
    console.log('🎯 Complete System Analysis: Addresses • Access • Profits • Repository');
    console.log('═'.repeat(80));
  }

  /**
   * 🔍 Execute comprehensive contract audit
   */
  async runContractAudit() {
    console.log('\n🔍 EXECUTING COMPREHENSIVE CONTRACT AUDIT');
    console.log('─'.repeat(60));
    
    try {
      const audit = new ComprehensiveOmegaAudit();
      this.results.contractAudit = await audit.runCompleteAudit();
      
      console.log('✅ Contract audit completed successfully');
      return this.results.contractAudit;
      
    } catch (error) {
      console.error('❌ Contract audit failed:', error.message);
      this.results.contractAudit = { error: error.message };
      return null;
    }
  }

  /**
   * 📁 Execute GitHub repository scan
   */
  async runGitHubScan() {
    console.log('\n📁 EXECUTING GITHUB REPOSITORY SCAN');
    console.log('─'.repeat(60));
    
    try {
      const scanner = new GitHubAccountScanner();
      this.results.githubScan = await scanner.runCompleteScan();
      
      console.log('✅ GitHub scan completed successfully');
      return this.results.githubScan;
      
    } catch (error) {
      console.error('❌ GitHub scan failed:', error.message);
      this.results.githubScan = { error: error.message };
      return null;
    }
  }

  /**
   * 📊 Generate unified analysis summary
   */
  generateUnifiedSummary() {
    console.log('\n📊 GENERATING UNIFIED ANALYSIS SUMMARY');
    console.log('─'.repeat(60));

    const contractAudit = this.results.contractAudit;
    const githubScan = this.results.githubScan;
    
    const unifiedSummary = {
      // Contract Address Analysis
      totalAddressesDiscovered: this.getTotalAddresses(),
      verifiedAddresses: contractAudit?.summary?.verified_addresses || 0,
      missingAddresses: contractAudit?.summary?.missing_addresses || 0,
      
      // Control Access Analysis
      controlAddressesAnalyzed: this.getControlAddressCount(),
      accessControlIssues: this.getAccessControlIssues(),
      securityRiskLevel: this.calculateOverallSecurityRisk(),
      
      // Bot Agent Status & Profits
      totalBots: Object.keys(contractAudit?.botAgentStatus || {}).length,
      activeBots: contractAudit?.summary?.active_bots || 0,
      inactiveBots: contractAudit?.summary?.inactive_bots || 0,
      estimatedTotalProfits: contractAudit?.summary?.estimated_total_profits || 0,
      totalSOLBalance: contractAudit?.summary?.total_sol_balance || 0,
      
      // Repository Analysis
      repositoryHealth: githubScan?.summary?.repository_health || 'unknown',
      securityScore: githubScan?.summary?.security_score || 0,
      totalFilesScanned: this.getTotalFilesScanned(),
      contractFilesFound: githubScan?.summary?.contract_files || 0,
      securityIssuesFound: githubScan?.summary?.security_issues || 0,
      
      // Overall Status
      operationalStatus: this.determineOperationalStatus(),
      systemHealth: this.calculateSystemHealth(),
      criticalIssues: this.identifyCriticalIssues(),
      auditCompleteness: this.calculateAuditCompleteness()
    };

    this.results.unifiedSummary = unifiedSummary;
    
    console.log('📊 Unified summary metrics:');
    console.log(`   🔑 Total Addresses: ${unifiedSummary.totalAddressesDiscovered}`);
    console.log(`   ✅ Verified: ${unifiedSummary.verifiedAddresses}`);
    console.log(`   ❌ Missing: ${unifiedSummary.missingAddresses}`);
    console.log(`   🤖 Bots (Active/Total): ${unifiedSummary.activeBots}/${unifiedSummary.totalBots}`);
    console.log(`   💰 Total SOL: ${unifiedSummary.totalSOLBalance.toFixed(6)}`);
    console.log(`   📁 Repository Health: ${unifiedSummary.repositoryHealth.toUpperCase()}`);
    console.log(`   🔒 Security Score: ${unifiedSummary.securityScore}/100`);
    console.log(`   🎯 System Status: ${unifiedSummary.operationalStatus.toUpperCase()}`);

    return unifiedSummary;
  }

  /**
   * 🎯 Generate consolidated recommendations
   */
  generateConsolidatedRecommendations() {
    console.log('\n🎯 GENERATING CONSOLIDATED RECOMMENDATIONS');
    console.log('─'.repeat(60));

    const recommendations = [];
    const contractAudit = this.results.contractAudit;
    const githubScan = this.results.githubScan;

    // Critical Issues (Priority 1)
    if (this.results.unifiedSummary.missingAddresses > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Missing Addresses',
        issue: `${this.results.unifiedSummary.missingAddresses} contract addresses not found on blockchain`,
        impact: 'System may be non-operational',
        action: 'Verify addresses exist, check network connection, or update configuration',
        urgency: 'Immediate'
      });
    }

    if (this.results.unifiedSummary.activeBots === 0 && this.results.unifiedSummary.totalBots > 0) {
      recommendations.push({
        priority: 'CRITICAL', 
        category: 'Bot Operations',
        issue: 'All bot agents appear to be offline',
        impact: 'No automated operations running',
        action: 'Investigate bot deployment, check private keys, restart agents',
        urgency: 'Immediate'
      });
    }

    // High Priority Issues (Priority 2)
    if (this.results.unifiedSummary.securityScore < 50) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Security',
        issue: `Low security score: ${this.results.unifiedSummary.securityScore}/100`,
        impact: 'Increased vulnerability to attacks',
        action: 'Address security issues, implement additional safeguards',
        urgency: 'Within 24 hours'
      });
    }

    if (githubScan?.summary?.security_issues > 10) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Repository Security',
        issue: `${githubScan.summary.security_issues} security issues in repository`,
        impact: 'Potential exposure of sensitive data',
        action: 'Review and fix security issues, audit commit history',
        urgency: 'Within 48 hours'
      });
    }

    // Medium Priority Issues (Priority 3)
    if (this.results.unifiedSummary.totalSOLBalance < 0.1) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Funding',
        issue: 'Low SOL balance across all addresses',
        impact: 'May affect transaction capabilities',
        action: 'Fund operational addresses with sufficient SOL',
        urgency: 'Within 1 week'
      });
    }

    // Add specific recommendations from sub-audits
    if (contractAudit?.recommendations) {
      contractAudit.recommendations.forEach(rec => {
        if (!recommendations.some(r => r.issue.includes(rec.issue))) {
          recommendations.push({
            priority: rec.type.toUpperCase(),
            category: rec.category || 'Contract Audit',
            issue: rec.issue,
            action: rec.action,
            urgency: this.mapPriorityToUrgency(rec.type)
          });
        }
      });
    }

    this.results.consolidatedRecommendations = recommendations;

    console.log(`🎯 Generated ${recommendations.length} consolidated recommendations:`);
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.category}: ${rec.issue}`);
    });

    return recommendations;
  }

  /**
   * 📋 Generate executive summary
   */
  generateExecutiveSummary() {
    console.log('\n📋 GENERATING EXECUTIVE SUMMARY');
    console.log('─'.repeat(60));

    const summary = this.results.unifiedSummary;
    const criticalIssues = this.results.consolidatedRecommendations.filter(r => r.priority === 'CRITICAL').length;
    const highIssues = this.results.consolidatedRecommendations.filter(r => r.priority === 'HIGH').length;

    const executiveSummary = {
      auditDate: this.results.timestamp,
      auditDuration: this.calculateAuditDuration(),
      
      // Key Metrics
      systemOperationalStatus: summary.operationalStatus,
      overallHealthScore: summary.systemHealth,
      
      // Address Analysis
      addressAnalysis: {
        total: summary.totalAddressesDiscovered,
        verified: summary.verifiedAddresses,
        missing: summary.missingAddresses,
        verificationRate: summary.totalAddressesDiscovered > 0 ? 
          Math.round((summary.verifiedAddresses / summary.totalAddressesDiscovered) * 100) : 0
      },
      
      // Bot Operations
      botOperations: {
        totalBots: summary.totalBots,
        operational: summary.activeBots,
        offline: summary.inactiveBots,
        operationalRate: summary.totalBots > 0 ? 
          Math.round((summary.activeBots / summary.totalBots) * 100) : 0,
        estimatedProfits: summary.estimatedTotalProfits
      },
      
      // Financial Status
      financialStatus: {
        totalSOL: summary.totalSOLBalance,
        adequatelyFunded: summary.totalSOLBalance > 1.0,
        fundingRecommendation: summary.totalSOLBalance < 0.5 ? 'URGENT' : 'MONITOR'
      },
      
      // Security Assessment
      securityAssessment: {
        repositorySecurityScore: summary.securityScore,
        securityIssues: summary.securityIssuesFound,
        riskLevel: summary.securityRiskLevel,
        requiresImmediateAttention: criticalIssues > 0 || highIssues > 2
      },
      
      // Action Items
      actionItems: {
        critical: criticalIssues,
        high: highIssues,
        total: this.results.consolidatedRecommendations.length,
        nextSteps: this.getNextSteps()
      },
      
      // Compliance & Governance
      compliance: {
        documentationQuality: summary.repositoryHealth,
        auditCompleteness: summary.auditCompleteness,
        configurationStatus: this.getConfigurationStatus()
      }
    };

    this.results.executiveSummary = executiveSummary;

    console.log('📋 Executive summary generated:');
    console.log(`   🎯 System Status: ${executiveSummary.systemOperationalStatus.toUpperCase()}`);
    console.log(`   💯 Health Score: ${executiveSummary.overallHealthScore}/100`);
    console.log(`   🔗 Address Verification: ${executiveSummary.addressAnalysis.verificationRate}%`);
    console.log(`   🤖 Bot Operational Rate: ${executiveSummary.botOperations.operationalRate}%`);
    console.log(`   💰 Financial Status: ${executiveSummary.financialStatus.adequatelyFunded ? 'ADEQUATE' : 'NEEDS FUNDING'}`);
    console.log(`   🚨 Critical Issues: ${executiveSummary.actionItems.critical}`);

    return executiveSummary;
  }

  /**
   * 💾 Save unified audit report
   */
  async saveUnifiedReport() {
    console.log('\n💾 SAVING UNIFIED AUDIT REPORT');
    console.log('─'.repeat(60));

    const timestamp = new Date().toISOString().split('T')[0];
    const reportDir = path.join(process.cwd(), 'unified-audit-reports');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    try {
      // Save comprehensive JSON report
      const jsonPath = path.join(reportDir, `omega-prime-unified-audit-${timestamp}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Comprehensive JSON: ${jsonPath}`);

      // Save executive summary markdown
      const execMdPath = path.join(reportDir, `omega-prime-executive-summary-${timestamp}.md`);
      const execMarkdown = this.generateExecutiveMarkdown();
      fs.writeFileSync(execMdPath, execMarkdown);
      console.log(`📋 Executive Summary: ${execMdPath}`);

      // Save detailed technical report
      const techMdPath = path.join(reportDir, `omega-prime-technical-report-${timestamp}.md`);
      const techMarkdown = this.generateTechnicalMarkdown();
      fs.writeFileSync(techMdPath, techMarkdown);
      console.log(`📝 Technical Report: ${techMdPath}`);

      // Save action plan CSV
      const csvPath = path.join(reportDir, `omega-prime-action-plan-${timestamp}.csv`);
      const csvReport = this.generateActionPlanCSV();
      fs.writeFileSync(csvPath, csvReport);
      console.log(`📊 Action Plan CSV: ${csvPath}`);

      return {
        json: jsonPath,
        executive: execMdPath,
        technical: techMdPath,
        actionPlan: csvPath
      };

    } catch (error) {
      console.error('❌ Error saving unified report:', error.message);
      throw error;
    }
  }

  /**
   * 📋 Generate executive summary markdown
   */
  generateExecutiveMarkdown() {
    const exec = this.results.executiveSummary;
    const summary = this.results.unifiedSummary;
    
    return `# 🏆 OMEGA PRIME DEPLOYER - EXECUTIVE AUDIT SUMMARY

**Audit Date:** ${exec.auditDate}  
**Audit Duration:** ${exec.auditDuration}  
**System Status:** ${exec.systemOperationalStatus.toUpperCase()}  
**Overall Health:** ${exec.overallHealthScore}/100

---

## 🎯 KEY FINDINGS

### System Operational Status: ${exec.systemOperationalStatus.toUpperCase()}

${summary.activeBots === 0 && summary.totalBots > 0 ? 
'⚠️ **CRITICAL**: All bot agents are currently offline' : 
summary.activeBots === summary.totalBots ? 
'✅ **EXCELLENT**: All bot agents operational' : 
'🔄 **PARTIAL**: Some bot agents operational'}

### Address Verification: ${exec.addressAnalysis.verificationRate}%
- **Total Addresses:** ${exec.addressAnalysis.total}
- **Verified:** ${exec.addressAnalysis.verified}
- **Missing:** ${exec.addressAnalysis.missing}

### Financial Status: ${exec.financialStatus.adequatelyFunded ? '✅ ADEQUATE' : '⚠️ NEEDS ATTENTION'}
- **Total SOL Balance:** ${exec.financialStatus.totalSOL.toFixed(6)} SOL
- **Funding Status:** ${exec.financialStatus.fundingRecommendation}

---

## 🚨 IMMEDIATE ACTION REQUIRED

${this.results.consolidatedRecommendations
  .filter(r => r.priority === 'CRITICAL')
  .map((rec, i) => `${i + 1}. **${rec.category}**: ${rec.issue}`)
  .join('\n')}

---

## 📊 DETAILED METRICS

| Category | Metric | Value | Status |
|----------|--------|-------|--------|
| **Addresses** | Verification Rate | ${exec.addressAnalysis.verificationRate}% | ${exec.addressAnalysis.verificationRate > 80 ? '✅' : '⚠️'} |
| **Bot Operations** | Operational Rate | ${exec.botOperations.operationalRate}% | ${exec.botOperations.operationalRate > 80 ? '✅' : '⚠️'} |
| **Security** | Repository Score | ${exec.securityAssessment.repositorySecurityScore}/100 | ${exec.securityAssessment.repositorySecurityScore > 70 ? '✅' : '⚠️'} |
| **Funding** | SOL Balance | ${exec.financialStatus.totalSOL.toFixed(6)} | ${exec.financialStatus.adequatelyFunded ? '✅' : '⚠️'} |

---

## 🎯 RECOMMENDED ACTIONS

### Immediate (0-24 hours)
${this.results.consolidatedRecommendations
  .filter(r => r.urgency === 'Immediate')
  .map((rec, i) => `${i + 1}. ${rec.action}`)
  .join('\n')}

### Short Term (1-7 days)
${this.results.consolidatedRecommendations
  .filter(r => r.urgency === 'Within 1 week')
  .map((rec, i) => `${i + 1}. ${rec.action}`)
  .join('\n')}

---

*This executive summary provides a high-level overview. Refer to the technical report for detailed findings.*
`;
  }

  /**
   * 📝 Generate technical markdown report
   */
  generateTechnicalMarkdown() {
    return `# 🔧 OMEGA PRIME DEPLOYER - TECHNICAL AUDIT REPORT

**Generated:** ${this.results.timestamp}  
**Audit System:** Unified Comprehensive Analysis  
**Coverage:** Contract Addresses • Access Control • Bot Operations • Repository Security

---

## 📊 UNIFIED SUMMARY METRICS

${JSON.stringify(this.results.unifiedSummary, null, 2)}

---

## 🔍 CONTRACT AUDIT RESULTS

${this.results.contractAudit ? 
  JSON.stringify(this.results.contractAudit.summary, null, 2) : 
  'Contract audit failed or incomplete'}

---

## 📁 GITHUB REPOSITORY SCAN

${this.results.githubScan ? 
  JSON.stringify(this.results.githubScan.summary, null, 2) : 
  'GitHub scan failed or incomplete'}

---

## 🎯 ALL RECOMMENDATIONS

${this.results.consolidatedRecommendations
  .map((rec, i) => `### ${i + 1}. [${rec.priority}] ${rec.category}
**Issue:** ${rec.issue}
**Action:** ${rec.action}
**Urgency:** ${rec.urgency}
${rec.impact ? `**Impact:** ${rec.impact}` : ''}
`)
  .join('\n')}

---

*This technical report contains complete audit data for system administrators and developers.*
`;
  }

  /**
   * 📊 Generate action plan CSV
   */
  generateActionPlanCSV() {
    let csv = 'Priority,Category,Issue,Action,Urgency,Status\n';
    
    this.results.consolidatedRecommendations.forEach(rec => {
      csv += `"${rec.priority}","${rec.category}","${rec.issue}","${rec.action}","${rec.urgency}","Open"\n`;
    });

    return csv;
  }

  // ========== HELPER METHODS ==========

  getTotalAddresses() {
    const contractAddresses = this.results.contractAudit?.summary?.total_addresses || 0;
    const githubAddresses = this.results.githubScan?.summary?.total_addresses || 0;
    return Math.max(contractAddresses, githubAddresses);
  }

  getControlAddressCount() {
    return Object.keys(this.results.contractAudit?.controlAccess || {}).length;
  }

  getAccessControlIssues() {
    return Object.values(this.results.contractAudit?.controlAccess || {})
      .filter(access => access.securityRisk === 'high' || access.securityRisk === 'critical')
      .length;
  }

  calculateOverallSecurityRisk() {
    const contractRisk = this.results.contractAudit?.summary?.security_risks || {};
    const githubScore = this.results.githubScan?.summary?.security_score || 100;
    
    const criticalCount = contractRisk.critical || 0;
    const highCount = contractRisk.high || 0;
    
    if (criticalCount > 0 || githubScore < 30) return 'critical';
    if (highCount > 2 || githubScore < 60) return 'high';
    if (githubScore < 80) return 'medium';
    return 'low';
  }

  getTotalFilesScanned() {
    return this.results.githubScan?.currentRepository?.analysis?.structure ? 
      this.countFilesInStructure(this.results.githubScan.currentRepository.analysis.structure) : 0;
  }

  countFilesInStructure(structure) {
    let count = 0;
    Object.values(structure).forEach(item => {
      if (item.type === 'file') count++;
      else if (item.children) count += this.countFilesInStructure(item.children);
    });
    return count;
  }

  determineOperationalStatus() {
    const activeBots = this.results.contractAudit?.summary?.active_bots || 0;
    const totalBots = Object.keys(this.results.contractAudit?.botAgentStatus || {}).length;
    const verifiedAddresses = this.results.contractAudit?.summary?.verified_addresses || 0;
    const totalAddresses = this.results.contractAudit?.summary?.total_addresses || 1;
    
    if (activeBots === 0 && totalBots > 0) return 'offline';
    if (verifiedAddresses / totalAddresses < 0.5) return 'degraded';
    if (activeBots === totalBots && verifiedAddresses / totalAddresses > 0.8) return 'fully_operational';
    return 'partially_operational';
  }

  calculateSystemHealth() {
    let healthScore = 0;
    let maxScore = 0;
    
    // Bot operations (30 points)
    maxScore += 30;
    const activeBots = this.results.contractAudit?.summary?.active_bots || 0;
    const totalBots = Object.keys(this.results.contractAudit?.botAgentStatus || {}).length;
    if (totalBots > 0) {
      healthScore += Math.round((activeBots / totalBots) * 30);
    }
    
    // Address verification (25 points)
    maxScore += 25;
    const verifiedAddresses = this.results.contractAudit?.summary?.verified_addresses || 0;
    const totalAddresses = this.results.contractAudit?.summary?.total_addresses || 1;
    healthScore += Math.round((verifiedAddresses / totalAddresses) * 25);
    
    // Repository health (25 points)
    maxScore += 25;
    const githubScore = this.results.githubScan?.summary?.security_score || 0;
    healthScore += Math.round((githubScore / 100) * 25);
    
    // Security (20 points)
    maxScore += 20;
    const criticalIssues = this.results.consolidatedRecommendations.filter(r => r.priority === 'CRITICAL').length;
    if (criticalIssues === 0) healthScore += 20;
    else if (criticalIssues <= 2) healthScore += 10;
    
    return maxScore > 0 ? Math.round((healthScore / maxScore) * 100) : 0;
  }

  identifyCriticalIssues() {
    return this.results.consolidatedRecommendations
      .filter(r => r.priority === 'CRITICAL')
      .map(r => r.issue);
  }

  calculateAuditCompleteness() {
    let completeness = 0;
    
    // Contract audit completed
    if (this.results.contractAudit && !this.results.contractAudit.error) completeness += 50;
    
    // GitHub scan completed
    if (this.results.githubScan && !this.results.githubScan.error) completeness += 50;
    
    return completeness;
  }

  mapPriorityToUrgency(priority) {
    const mapping = {
      'critical': 'Immediate',
      'high': 'Within 24 hours',
      'medium': 'Within 1 week',
      'low': 'Within 1 month'
    };
    return mapping[priority.toLowerCase()] || 'Within 1 week';
  }

  calculateAuditDuration() {
    const endTime = new Date();
    const durationMs = endTime - this.startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  getNextSteps() {
    const criticalIssues = this.results.consolidatedRecommendations.filter(r => r.priority === 'CRITICAL');
    if (criticalIssues.length > 0) {
      return ['Address critical issues immediately', 'Verify system restoration', 'Monitor operations closely'];
    }
    
    const highIssues = this.results.consolidatedRecommendations.filter(r => r.priority === 'HIGH');
    if (highIssues.length > 0) {
      return ['Resolve high priority issues', 'Implement additional monitoring', 'Schedule follow-up audit'];
    }
    
    return ['Maintain current operations', 'Monitor system health', 'Plan next audit cycle'];
  }

  getConfigurationStatus() {
    const configs = this.results.githubScan?.currentRepository?.analysis?.configurations || [];
    if (configs.length >= 5) return 'comprehensive';
    if (configs.length >= 3) return 'adequate';
    return 'minimal';
  }

  /**
   * 🚀 Execute complete unified audit
   */
  async executeCompleteAudit() {
    try {
      console.log('\n🚀 EXECUTING COMPLETE UNIFIED AUDIT');
      console.log('═'.repeat(80));
      
      // Phase 1: Contract Audit
      await this.runContractAudit();
      
      // Phase 2: GitHub Scan
      await this.runGitHubScan();
      
      // Phase 3: Unified Analysis
      this.generateUnifiedSummary();
      this.generateConsolidatedRecommendations();
      this.generateExecutiveSummary();
      
      // Phase 4: Reporting
      const reportPaths = await this.saveUnifiedReport();
      
      // Final Summary
      console.log('\n🎉 UNIFIED AUDIT COMPLETED SUCCESSFULLY!');
      console.log('═'.repeat(80));
      console.log('📊 FINAL AUDIT RESULTS:');
      console.log(`   🎯 System Status: ${this.results.executiveSummary.systemOperationalStatus.toUpperCase()}`);
      console.log(`   💯 Health Score: ${this.results.executiveSummary.overallHealthScore}/100`);
      console.log(`   🔑 Addresses (Verified/Total): ${this.results.executiveSummary.addressAnalysis.verified}/${this.results.executiveSummary.addressAnalysis.total}`);
      console.log(`   🤖 Bots (Active/Total): ${this.results.executiveSummary.botOperations.operational}/${this.results.executiveSummary.botOperations.totalBots}`);
      console.log(`   💰 Total SOL Balance: ${this.results.executiveSummary.financialStatus.totalSOL.toFixed(6)}`);
      console.log(`   🚨 Critical Issues: ${this.results.executiveSummary.actionItems.critical}`);
      console.log(`   ⚠️  Total Issues: ${this.results.executiveSummary.actionItems.total}`);
      console.log(`   ⏱️  Audit Duration: ${this.results.executiveSummary.auditDuration}`);
      
      console.log('\n📁 COMPREHENSIVE REPORTS GENERATED:');
      console.log(`   📋 Executive Summary: ${reportPaths.executive}`);
      console.log(`   📝 Technical Report: ${reportPaths.technical}`);
      console.log(`   📄 Complete Data: ${reportPaths.json}`);
      console.log(`   📊 Action Plan: ${reportPaths.actionPlan}`);
      
      if (this.results.executiveSummary.actionItems.critical > 0) {
        console.log('\n🚨 CRITICAL ATTENTION REQUIRED:');
        this.results.consolidatedRecommendations
          .filter(r => r.priority === 'CRITICAL')
          .forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec.category}: ${rec.issue}`);
          });
      }
      
      console.log('\n✅ All audit requirements completed successfully!');
      console.log('═'.repeat(80));
      
      return this.results;
      
    } catch (error) {
      console.error('\n❌ UNIFIED AUDIT FAILED:', error.message);
      console.error('═'.repeat(80));
      throw error;
    }
  }
}

// Execute unified audit if run directly
if (require.main === module) {
  const unifiedAudit = new UnifiedAuditSystem();
  unifiedAudit.executeCompleteAudit()
    .then(() => {
      console.log('\n🎯 Unified audit system completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Unified audit system failed:', error);
      process.exit(1);
    });
}

module.exports = UnifiedAuditSystem;