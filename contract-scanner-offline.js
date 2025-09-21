const fs = require('fs');
const path = require('path');

/**
 * Offline Contract Address Transaction Scanner
 * 
 * This utility scans all data files to find contract addresses with their
 * associated transaction hashes for successful mainnet deployments using
 * only cached/existing verification data.
 * 
 * Features:
 * - Works entirely offline using cached verification data
 * - Processes all JSON data files for contract addresses
 * - Generates comprehensive reports without API calls
 * - Ideal for CI/CD and environments without RPC access
 */

class OfflineContractScanner {
  constructor() {
    this.contractAddresses = new Map();
    this.transactionResults = new Map();
    this.scanResults = {
      totalAddressesFound: 0,
      addressesWithTransactions: 0,
      totalTransactions: 0,
      contractTransactionPairs: [],
      dataSourcesProcessed: [],
      scanTimestamp: new Date().toISOString()
    };
    
    console.log('📱 OFFLINE CONTRACT ADDRESS SCANNER');
    console.log('🔍 Processing cached verification data only');
    console.log('='.repeat(50));
  }

  /**
   * Main execution method
   */
  async execute() {
    try {
      // Phase 1: Load all data sources
      await this.loadAllDataSources();
      
      // Phase 2: Process cached transaction data
      this.processCachedTransactions();
      
      // Phase 3: Generate comprehensive report
      const report = this.generateReport();
      
      console.log('\n🎉 OFFLINE SCAN COMPLETED SUCCESSFULLY!');
      return report;
      
    } catch (error) {
      console.error('\n❌ SCAN FAILED:', error.message);
      throw error;
    }
  }

  /**
   * Load all available data sources
   */
  async loadAllDataSources() {
    console.log('\n📁 PHASE 1: LOADING ALL DATA SOURCES');
    console.log('='.repeat(40));

    const dataSources = [
      'contract_addresses.json',
      'address-verification-2025-09-20.json',
      'address-verification-2025-09-11.json',
      'address-audit-report.json',
      'address-verification-demo-2025-09-11.json'
    ];

    // Add audit report directories
    const auditDirs = ['audit-reports', 'unified-audit-reports'];
    for (const dir of auditDirs) {
      const dirPath = path.join(__dirname, dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath)
          .filter(file => file.endsWith('.json'))
          .map(file => path.join(dir, file));
        dataSources.push(...files);
      }
    }

    console.log(`📊 Found ${dataSources.length} potential data sources`);

    for (const source of dataSources) {
      await this.processDataFile(source);
    }

    console.log(`✅ Processed ${this.scanResults.dataSourcesProcessed.length} files`);
    console.log(`📋 Found ${this.contractAddresses.size} unique contract addresses`);
  }

  /**
   * Process individual data file
   */
  async processDataFile(filePath) {
    try {
      const fullPath = path.join(__dirname, filePath);
      if (!fs.existsSync(fullPath)) {
        return;
      }

      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      console.log(`📄 Processing: ${filePath}`);

      this.scanResults.dataSourcesProcessed.push(filePath);

      // Extract addresses and transactions based on file type
      if (filePath.includes('contract_addresses.json')) {
        this.extractFromContractAddresses(data);
      } else if (filePath.includes('verification')) {
        this.extractFromVerificationFile(data, filePath);
      } else if (filePath.includes('audit')) {
        this.extractFromAuditFile(data);
      }

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Extract addresses from contract_addresses.json
   */
  extractFromContractAddresses(data) {
    if (!data.omega_prime_addresses) return;

    const addresses = data.omega_prime_addresses;

    // Bot army addresses
    if (addresses.bot_army) {
      Object.entries(addresses.bot_army).forEach(([botName, botData]) => {
        if (botData.bot_address) {
          this.addAddress(botData.bot_address, `bot_army.${botName}.bot_address`, 'bot_army');
        }
        if (botData.contract_address) {
          this.addAddress(botData.contract_address, `bot_army.${botName}.contract_address`, 'bot_army');
        }
      });
    }

    // Control addresses
    if (addresses.control_addresses) {
      Object.entries(addresses.control_addresses).forEach(([name, addressData]) => {
        if (addressData.address) {
          this.addAddress(addressData.address, `control_addresses.${name}`, 'control');
        }
      });
    }

    // Treasury addresses
    if (addresses.treasury_operational) {
      Object.entries(addresses.treasury_operational).forEach(([name, address]) => {
        this.addAddress(address, `treasury.${name}`, 'treasury');
      });
    }

    // Program IDs
    if (addresses.program_ids) {
      Object.entries(addresses.program_ids).forEach(([category, programs]) => {
        Object.entries(programs).forEach(([name, programId]) => {
          this.addAddress(programId, `program.${category}.${name}`, 'program');
        });
      });
    }

    // Token addresses
    if (addresses.token_addresses) {
      Object.entries(addresses.token_addresses).forEach(([name, address]) => {
        this.addAddress(address, `token.${name}`, 'token');
      });
    }

    // Analysis addresses
    if (addresses.analysis_addresses) {
      Object.entries(addresses.analysis_addresses).forEach(([name, address]) => {
        this.addAddress(address, `analysis.${name}`, 'analysis');
      });
    }

    // All addresses list
    if (addresses.all_addresses_list) {
      addresses.all_addresses_list.forEach((address, index) => {
        this.addAddress(address, `all_addresses[${index}]`, 'list');
      });
    }
  }

  /**
   * Extract from verification files with transaction data
   */
  extractFromVerificationFile(data, filePath) {
    // Target address analysis with transactions
    if (data.targetAddressAnalysis && data.targetAddressAnalysis.address) {
      const address = data.targetAddressAnalysis.address;
      this.addAddress(address, 'target_analysis', 'verification');
      
      if (data.targetAddressAnalysis.transactions) {
        this.transactionResults.set(address, data.targetAddressAnalysis.transactions);
      }
    }

    // Verification results
    if (data.verificationResults) {
      Object.entries(data.verificationResults).forEach(([address, result]) => {
        this.addAddress(address, 'verification_result', 'verification');
        
        if (result.transactions && result.transactions.length > 0) {
          this.transactionResults.set(address, result.transactions);
        }
      });
    }

    // Address results
    if (data.addressResults) {
      Object.entries(data.addressResults).forEach(([address, result]) => {
        this.addAddress(address, 'address_result', 'verification');
        
        if (result.transactions) {
          this.transactionResults.set(address, result.transactions);
        }
      });
    }

    // Summary data
    if (data.summary && data.summary.addressesWithTransactions) {
      console.log(`  📊 File contains ${data.summary.addressesWithTransactions} addresses with transactions`);
    }
  }

  /**
   * Extract from audit files
   */
  extractFromAuditFile(data) {
    if (data.addressInventory) {
      Object.entries(data.addressInventory).forEach(([address, info]) => {
        this.addAddress(address, `audit.${info.category || 'unknown'}`, 'audit');
      });
    }

    if (data.auditResults && data.auditResults.addressInventory) {
      Object.entries(data.auditResults.addressInventory).forEach(([address, info]) => {
        this.addAddress(address, `audit_result.${info.category || 'unknown'}`, 'audit');
      });
    }
  }

  /**
   * Add address to collection
   */
  addAddress(address, source, category) {
    if (!this.isValidSolanaAddress(address)) {
      return;
    }

    if (!this.contractAddresses.has(address)) {
      this.contractAddresses.set(address, {
        address,
        sources: [],
        category: category,
        hasTransactions: false
      });
    }

    const addressData = this.contractAddresses.get(address);
    addressData.sources.push(source);
  }

  /**
   * Validate Solana address format
   */
  isValidSolanaAddress(address) {
    try {
      if (!address || typeof address !== 'string') return false;
      if (address.length < 32 || address.length > 44) return false;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Process cached transaction data
   */
  processCachedTransactions() {
    console.log('\n🔍 PHASE 2: PROCESSING CACHED TRANSACTION DATA');
    console.log('='.repeat(50));

    this.scanResults.totalAddressesFound = this.contractAddresses.size;

    for (const [address, addressData] of this.contractAddresses) {
      if (this.transactionResults.has(address)) {
        const transactions = this.transactionResults.get(address);
        
        if (transactions && transactions.length > 0) {
          console.log(`📍 ${address}: ${transactions.length} transactions found`);
          addressData.hasTransactions = true;
          this.scanResults.addressesWithTransactions++;
          
          // Process successful transactions only
          const successfulTxs = transactions.filter(tx => tx.err === null);
          this.scanResults.totalTransactions += successfulTxs.length;
          
          successfulTxs.forEach(tx => {
            this.scanResults.contractTransactionPairs.push({
              contractAddress: address,
              transactionHash: tx.signature,
              slot: tx.slot,
              blockTime: tx.blockTime,
              confirmationStatus: tx.confirmationStatus || 'finalized',
              explorerLink: `https://explorer.solana.com/tx/${tx.signature}`,
              addressMetadata: addressData
            });
          });
        }
      }
    }

    console.log(`✅ Found ${this.scanResults.addressesWithTransactions} addresses with cached transactions`);
    console.log(`📝 Total successful transactions: ${this.scanResults.totalTransactions}`);
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 PHASE 3: GENERATING OFFLINE REPORT');
    console.log('='.repeat(40));

    const report = {
      metadata: {
        scanTimestamp: this.scanResults.scanTimestamp,
        scanType: 'offline_cached_data',
        toolVersion: '1.0.0',
        dataSourcesProcessed: this.scanResults.dataSourcesProcessed
      },
      summary: {
        totalAddressesFound: this.scanResults.totalAddressesFound,
        addressesWithTransactions: this.scanResults.addressesWithTransactions,
        totalSuccessfulTransactions: this.scanResults.totalTransactions,
        contractTransactionPairs: this.scanResults.contractTransactionPairs.length
      },
      contractsWithDeployments: this.scanResults.contractTransactionPairs,
      allAddresses: Array.from(this.contractAddresses.values())
    };

    // Save reports
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = path.join(__dirname, `offline-contract-scan-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate CSV for successful deployments only
    this.generateOfflineCSV(report, timestamp);

    // Generate markdown summary
    this.generateMarkdownSummary(report, timestamp);

    console.log(`✅ Offline report saved: ${reportPath}`);
    
    // Display summary
    console.log('\n🎯 OFFLINE SCAN RESULTS');
    console.log('='.repeat(30));
    console.log(`📋 Total Addresses: ${report.summary.totalAddressesFound}`);
    console.log(`🔗 With Transactions: ${report.summary.addressesWithTransactions}`);
    console.log(`✅ Successful Deployments: ${report.summary.contractTransactionPairs}`);
    console.log(`📁 Data Sources: ${report.metadata.dataSourcesProcessed.length}`);

    return report;
  }

  /**
   * Generate CSV for offline results
   */
  generateOfflineCSV(report, timestamp) {
    const csvPath = path.join(__dirname, `offline-contract-deployments-${timestamp}.csv`);
    
    const csvHeaders = 'Contract Address,Transaction Hash,Block Time,Status,Explorer Link,Category,Sources';
    const csvRows = report.contractsWithDeployments.map(item => {
      const blockTimeFormatted = item.blockTime ? new Date(item.blockTime * 1000).toISOString() : '';
      const sources = item.addressMetadata.sources.join(';');
      
      return [
        item.contractAddress,
        item.transactionHash,
        blockTimeFormatted,
        item.confirmationStatus,
        item.explorerLink,
        item.addressMetadata.category,
        sources
      ].join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    fs.writeFileSync(csvPath, csvContent);

    console.log(`📊 Offline CSV saved: ${csvPath}`);
  }

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary(report, timestamp) {
    const mdPath = path.join(__dirname, `offline-scan-summary-${timestamp}.md`);
    
    let content = `# Offline Contract Address Scan Summary\n\n`;
    content += `**Generated:** ${new Date().toISOString()}\n`;
    content += `**Scan Type:** Offline (Cached Data Only)\n`;
    content += `**Total Addresses:** ${report.summary.totalAddressesFound}\n`;
    content += `**With Transactions:** ${report.summary.addressesWithTransactions}\n\n`;

    content += `## Contract Addresses with Successful Mainnet Deployments\n\n`;

    // Group by address for summary
    const addressGroups = new Map();
    report.contractsWithDeployments.forEach(item => {
      if (!addressGroups.has(item.contractAddress)) {
        addressGroups.set(item.contractAddress, []);
      }
      addressGroups.get(item.contractAddress).push(item);
    });

    let index = 1;
    for (const [address, transactions] of addressGroups) {
      const metadata = transactions[0].addressMetadata;
      content += `### ${index}. ${metadata.category.toUpperCase()} Contract\n`;
      content += `**Address:** \`${address}\`\n`;
      content += `**Transaction Count:** ${transactions.length}\n`;
      content += `**Category:** ${metadata.category}\n\n`;
      
      content += `**Recent Transactions:**\n`;
      transactions.slice(0, 3).forEach(tx => {
        content += `- [\`${tx.transactionHash}\`](${tx.explorerLink})\n`;
      });
      content += `\n`;
      index++;
    }

    content += `## Data Sources Processed\n\n`;
    report.metadata.dataSourcesProcessed.forEach((source, idx) => {
      content += `${idx + 1}. ${source}\n`;
    });

    fs.writeFileSync(mdPath, content);
    console.log(`📝 Markdown summary saved: ${mdPath}`);
  }
}

// Main execution function
async function runOfflineScan() {
  const scanner = new OfflineContractScanner();
  return await scanner.execute();
}

// Export for module use
module.exports = { 
  OfflineContractScanner,
  runOfflineScan 
};

// Run if called directly
if (require.main === module) {
  runOfflineScan()
    .then(report => {
      console.log('\n✅ Offline contract scan completed successfully!');
      console.log(`📊 Found ${report.summary.contractTransactionPairs} successful deployments`);
    })
    .catch(error => {
      console.error('\n❌ Offline scan failed:', error.message);
      process.exit(1);
    });
}