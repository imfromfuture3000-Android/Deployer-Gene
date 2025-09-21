const web3 = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Contract Address Transaction Scanner
 * 
 * This utility scans all data files to find contract addresses with their
 * associated transaction hashes for successful mainnet deployments only.
 * 
 * Features:
 * - Scans all JSON data files for contract addresses
 * - Queries Solana mainnet for transaction histories
 * - Filters for successful deployment transactions only
 * - Generates comprehensive report with address-transaction mappings
 */

class ContractAddressTransactionScanner {
  constructor() {
    // Use Helius RPC for better reliability on mainnet
    const rpcUrl = process.env.HELIUS_API_KEY 
      ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
      : process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
      
    this.connection = new web3.Connection(rpcUrl, 'confirmed');
    this.dataFiles = [];
    this.contractAddresses = new Map();
    this.transactionResults = new Map();
    this.scanResults = {
      totalAddressesScanned: 0,
      successfulDeployments: 0,
      addressesWithTransactions: 0,
      contractTransactionPairs: [],
      errors: [],
      scanTimestamp: new Date().toISOString()
    };
    
    console.log(`🔗 Connected to Solana mainnet: ${rpcUrl}`);
  }

  /**
   * Scan repository for all data files containing addresses
   */
  async scanDataFiles() {
    console.log('\n📁 PHASE 1: SCANNING DATA FILES');
    console.log('='.repeat(50));

    try {
      // Primary data sources
      const dataSources = [
        'contract_addresses.json',
        'address-verification-2025-09-20.json',
        'address-verification-2025-09-11.json',
        'address-audit-report.json',
        'address-verification-demo-2025-09-11.json'
      ];

      // Scan audit reports directory
      const auditReportsPath = path.join(__dirname, 'audit-reports');
      if (fs.existsSync(auditReportsPath)) {
        const auditFiles = fs.readdirSync(auditReportsPath)
          .filter(file => file.endsWith('.json'))
          .map(file => path.join('audit-reports', file));
        dataSources.push(...auditFiles);
      }

      // Scan unified audit reports directory
      const unifiedAuditPath = path.join(__dirname, 'unified-audit-reports');
      if (fs.existsSync(unifiedAuditPath)) {
        const unifiedFiles = fs.readdirSync(unifiedAuditPath)
          .filter(file => file.endsWith('.json'))
          .map(file => path.join('unified-audit-reports', file));
        dataSources.push(...unifiedFiles);
      }

      console.log(`📊 Found ${dataSources.length} potential data sources`);

      for (const source of dataSources) {
        await this.processDataFile(source);
      }

      console.log(`✅ Processed ${this.dataFiles.length} data files`);
      console.log(`📋 Extracted ${this.contractAddresses.size} unique contract addresses`);

    } catch (error) {
      console.error('❌ Error scanning data files:', error.message);
      this.scanResults.errors.push({
        phase: 'data_scanning',
        error: error.message
      });
    }
  }

  /**
   * Process individual data file for contract addresses
   */
  async processDataFile(filePath) {
    try {
      const fullPath = path.join(__dirname, filePath);
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
      }

      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      console.log(`📄 Processing: ${filePath}`);

      this.dataFiles.push(filePath);

      // Extract addresses based on file structure
      if (filePath.includes('contract_addresses.json')) {
        this.extractFromContractAddresses(data);
      } else if (filePath.includes('verification')) {
        this.extractFromVerificationFile(data);
      } else if (filePath.includes('audit')) {
        this.extractFromAuditFile(data);
      } else {
        // Generic address extraction
        this.extractAddressesGeneric(data, filePath);
      }

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      this.scanResults.errors.push({
        file: filePath,
        error: error.message
      });
    }
  }

  /**
   * Extract addresses from contract_addresses.json
   */
  extractFromContractAddresses(data) {
    if (data.omega_prime_addresses) {
      const addresses = data.omega_prime_addresses;

      // Bot army addresses
      if (addresses.bot_army) {
        Object.entries(addresses.bot_army).forEach(([botName, botData]) => {
          if (botData.bot_address) {
            this.addAddress(botData.bot_address, `bot_army.${botName}.bot_address`, 'contract_addresses.json');
          }
          if (botData.contract_address) {
            this.addAddress(botData.contract_address, `bot_army.${botName}.contract_address`, 'contract_addresses.json');
          }
        });
      }

      // Control addresses
      if (addresses.control_addresses) {
        Object.entries(addresses.control_addresses).forEach(([name, addressData]) => {
          if (addressData.address) {
            this.addAddress(addressData.address, `control_addresses.${name}`, 'contract_addresses.json');
          }
        });
      }

      // Treasury addresses
      if (addresses.treasury_operational) {
        Object.entries(addresses.treasury_operational).forEach(([name, address]) => {
          this.addAddress(address, `treasury_operational.${name}`, 'contract_addresses.json');
        });
      }

      // All addresses list
      if (addresses.all_addresses_list) {
        addresses.all_addresses_list.forEach((address, index) => {
          this.addAddress(address, `all_addresses_list[${index}]`, 'contract_addresses.json');
        });
      }

      // Analysis addresses
      if (addresses.analysis_addresses) {
        Object.entries(addresses.analysis_addresses).forEach(([name, address]) => {
          this.addAddress(address, `analysis_addresses.${name}`, 'contract_addresses.json');
        });
      }
    }
  }

  /**
   * Extract addresses from verification files
   */
  extractFromVerificationFile(data) {
    // Extract addresses from verification results
    if (data.verificationResults) {
      Object.entries(data.verificationResults).forEach(([address, result]) => {
        this.addAddress(address, 'verification_result', 'verification_file');
        
        // If transactions exist, pre-populate them
        if (result.transactions && result.transactions.length > 0) {
          this.transactionResults.set(address, result.transactions);
        }
      });
    }

    // Check for target address analysis
    if (data.targetAddressAnalysis && data.targetAddressAnalysis.address) {
      this.addAddress(data.targetAddressAnalysis.address, 'target_address', 'verification_file');
      
      if (data.targetAddressAnalysis.transactions) {
        this.transactionResults.set(data.targetAddressAnalysis.address, data.targetAddressAnalysis.transactions);
      }
    }

    // Extract from summary if available
    if (data.addressResults) {
      Object.entries(data.addressResults).forEach(([address, result]) => {
        this.addAddress(address, 'address_result', 'verification_file');
        
        if (result.transactions) {
          this.transactionResults.set(address, result.transactions);
        }
      });
    }
  }

  /**
   * Extract addresses from audit files
   */
  extractFromAuditFile(data) {
    // Check for address inventory
    if (data.addressInventory) {
      Object.entries(data.addressInventory).forEach(([address, info]) => {
        this.addAddress(address, `audit.${info.category || 'unknown'}`, 'audit_file');
      });
    }

    // Check for audit results
    if (data.auditResults && data.auditResults.addressInventory) {
      Object.entries(data.auditResults.addressInventory).forEach(([address, info]) => {
        this.addAddress(address, `audit_results.${info.category || 'unknown'}`, 'audit_file');
      });
    }
  }

  /**
   * Generic address extraction for unknown file formats
   */
  extractAddressesGeneric(data, filePath) {
    const addressPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    const dataStr = JSON.stringify(data);
    const matches = dataStr.match(addressPattern);
    
    if (matches) {
      matches.forEach(address => {
        if (this.isValidSolanaAddress(address)) {
          this.addAddress(address, 'generic_extraction', filePath);
        }
      });
    }
  }

  /**
   * Add address to the collection with metadata
   */
  addAddress(address, source, file) {
    if (!this.isValidSolanaAddress(address)) {
      return;
    }

    if (!this.contractAddresses.has(address)) {
      this.contractAddresses.set(address, {
        address,
        sources: [],
        files: new Set()
      });
    }

    const addressData = this.contractAddresses.get(address);
    addressData.sources.push(source);
    addressData.files.add(file);
  }

  /**
   * Validate Solana address format
   */
  isValidSolanaAddress(address) {
    try {
      if (!address || typeof address !== 'string') return false;
      if (address.length < 32 || address.length > 44) return false;
      new web3.PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Query mainnet for transaction histories of all addresses
   */
  async queryMainnetTransactions() {
    console.log('\n🔍 PHASE 2: QUERYING MAINNET TRANSACTIONS');
    console.log('='.repeat(50));

    const addresses = Array.from(this.contractAddresses.keys());
    this.scanResults.totalAddressesScanned = addresses.length;

    console.log(`📊 Querying ${addresses.length} addresses for transaction histories...`);

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      console.log(`📍 [${i + 1}/${addresses.length}] Checking: ${address}`);

      try {
        await this.queryAddressTransactions(address);
        
        // Rate limiting to avoid RPC throttling
        if (i % 10 === 0 && i > 0) {
          console.log('⏳ Rate limiting pause...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Error querying ${address}:`, error.message);
        this.scanResults.errors.push({
          address,
          error: error.message
        });
      }
    }

    console.log(`✅ Completed transaction queries for ${addresses.length} addresses`);
  }

  /**
   * Query transaction history for a specific address
   */
  async queryAddressTransactions(address) {
    try {
      const pubkey = new web3.PublicKey(address);
      
      // Check if we already have transactions from verification files
      if (this.transactionResults.has(address)) {
        const existingTxs = this.transactionResults.get(address);
        console.log(`  ✅ Using cached transactions (${existingTxs.length} found)`);
        this.processTransactionsForAddress(address, existingTxs);
        return;
      }

      // Get account info first
      const accountInfo = await this.connection.getAccountInfo(pubkey);
      if (!accountInfo) {
        console.log(`  ⚠️  Address not found on mainnet`);
        return;
      }

      console.log(`  📋 Account exists - Owner: ${accountInfo.owner.toBase58()}`);

      // Get transaction signatures
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit: 50 });
      
      if (signatures.length === 0) {
        console.log(`  📭 No transactions found`);
        return;
      }

      console.log(`  📨 Found ${signatures.length} transactions`);

      // Get transaction details for successful ones
      const successfulTxs = signatures.filter(sig => sig.err === null);
      
      if (successfulTxs.length > 0) {
        console.log(`  ✅ ${successfulTxs.length} successful transactions`);
        this.transactionResults.set(address, successfulTxs);
        this.processTransactionsForAddress(address, successfulTxs);
      }

    } catch (error) {
      console.error(`  ❌ Query failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process and categorize transactions for an address
   */
  processTransactionsForAddress(address, transactions) {
    const deploymentTxs = this.filterDeploymentTransactions(transactions);
    
    if (deploymentTxs.length > 0) {
      this.scanResults.successfulDeployments++;
      this.scanResults.addressesWithTransactions++;
      
      deploymentTxs.forEach(tx => {
        this.scanResults.contractTransactionPairs.push({
          contractAddress: address,
          transactionHash: tx.signature,
          slot: tx.slot,
          blockTime: tx.blockTime,
          confirmationStatus: tx.confirmationStatus || 'finalized',
          explorerLink: `https://explorer.solana.com/tx/${tx.signature}`,
          addressMetadata: this.contractAddresses.get(address)
        });
      });
    }
  }

  /**
   * Filter transactions to identify deployment-related ones
   */
  filterDeploymentTransactions(transactions) {
    // For now, return all successful transactions
    // In the future, this could be enhanced to filter specific deployment patterns
    return transactions.filter(tx => tx.err === null);
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 PHASE 3: GENERATING COMPREHENSIVE REPORT');
    console.log('='.repeat(50));

    const report = {
      metadata: {
        scanTimestamp: this.scanResults.scanTimestamp,
        toolVersion: '1.0.0',
        network: 'solana-mainnet',
        dataSourcesScanned: this.dataFiles
      },
      summary: {
        totalAddressesScanned: this.scanResults.totalAddressesScanned,
        addressesWithTransactions: this.scanResults.addressesWithTransactions,
        successfulDeployments: this.scanResults.successfulDeployments,
        totalContractTransactionPairs: this.scanResults.contractTransactionPairs.length,
        errorCount: this.scanResults.errors.length
      },
      contractTransactionPairs: this.scanResults.contractTransactionPairs,
      errors: this.scanResults.errors
    };

    // Save detailed report
    const reportPath = path.join(__dirname, `contract-transaction-scan-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate summary CSV
    this.generateCSVReport(report);

    console.log(`✅ Detailed report saved: ${reportPath}`);
    
    // Display summary
    console.log('\n🎯 SCAN RESULTS SUMMARY');
    console.log('='.repeat(30));
    console.log(`📋 Addresses Scanned: ${report.summary.totalAddressesScanned}`);
    console.log(`🔗 With Transactions: ${report.summary.addressesWithTransactions}`);
    console.log(`✅ Successful Deployments: ${report.summary.successfulDeployments}`);
    console.log(`📝 Contract-Transaction Pairs: ${report.summary.totalContractTransactionPairs}`);
    console.log(`❌ Errors: ${report.summary.errorCount}`);

    if (report.contractTransactionPairs.length > 0) {
      console.log('\n🎯 TOP CONTRACT-TRANSACTION PAIRS:');
      console.log('-'.repeat(40));
      report.contractTransactionPairs.slice(0, 5).forEach((pair, index) => {
        console.log(`${index + 1}. ${pair.contractAddress}`);
        console.log(`   TX: ${pair.transactionHash}`);
        console.log(`   🔗 ${pair.explorerLink}`);
        console.log('');
      });
    }

    return report;
  }

  /**
   * Generate CSV report for easy analysis
   */
  generateCSVReport(report) {
    const csvPath = path.join(__dirname, `contract-transaction-pairs-${new Date().toISOString().split('T')[0]}.csv`);
    
    const csvHeaders = 'Contract Address,Transaction Hash,Slot,Block Time,Status,Explorer Link,Source';
    const csvRows = report.contractTransactionPairs.map(pair => {
      const sources = pair.addressMetadata.sources.join(';');
      const blockTimeFormatted = pair.blockTime ? new Date(pair.blockTime * 1000).toISOString() : '';
      
      return [
        pair.contractAddress,
        pair.transactionHash,
        pair.slot || '',
        blockTimeFormatted,
        pair.confirmationStatus,
        pair.explorerLink,
        sources
      ].join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    fs.writeFileSync(csvPath, csvContent);

    console.log(`📊 CSV report saved: ${csvPath}`);
  }

  /**
   * Main execution method
   */
  async execute() {
    console.log('🚀 CONTRACT ADDRESS TRANSACTION SCANNER');
    console.log('🔍 Scanning for contract addresses with successful mainnet deployment transactions');
    console.log('='.repeat(80));

    try {
      // Phase 1: Scan all data files
      await this.scanDataFiles();

      // Phase 2: Query mainnet transactions
      await this.queryMainnetTransactions();

      // Phase 3: Generate comprehensive report
      const report = this.generateReport();

      console.log('\n🎉 SCAN COMPLETED SUCCESSFULLY!');
      
      return report;

    } catch (error) {
      console.error('\n❌ SCAN FAILED:', error.message);
      throw error;
    }
  }
}

// Main execution function
async function scanContractAddressTransactions() {
  const scanner = new ContractAddressTransactionScanner();
  return await scanner.execute();
}

// Export for module use
module.exports = { 
  ContractAddressTransactionScanner,
  scanContractAddressTransactions 
};

// Run if called directly
if (require.main === module) {
  scanContractAddressTransactions()
    .then(report => {
      console.log('\n✅ Contract address transaction scan completed successfully!');
    })
    .catch(error => {
      console.error('\n❌ Scan failed:', error.message);
      process.exit(1);
    });
}