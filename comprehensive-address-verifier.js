const web3 = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Comprehensive Address Verification and Data Collection Utility
 * 
 * This utility:
 * 1. Reads addresses from contract_addresses.json
 * 2. Verifies each address on Solana mainnet
 * 3. Collects comprehensive data (account info, transactions, program data)
 * 4. Saves all data to organized files
 * 5. Focuses on controller addresses and target analysis
 */

class AddressVerifier {
  constructor() {
    // Try multiple RPC endpoints for better reliability
    const rpcUrl = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
    this.connection = new web3.Connection(rpcUrl, 'confirmed');
    this.contractAddresses = {};
    this.verificationResults = {};
    this.targetAddress = 'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp';
    
    console.log(`🌐 Using RPC endpoint: ${rpcUrl}`);
  }

  /**
   * Load addresses from contract_addresses.json
   */
  loadContractAddresses() {
    try {
      const filePath = path.join(__dirname, 'contract_addresses.json');
      const data = fs.readFileSync(filePath, 'utf8');
      this.contractAddresses = JSON.parse(data);
      console.log('✅ Loaded contract addresses from contract_addresses.json');
      return true;
    } catch (error) {
      console.error('❌ Error loading contract addresses:', error.message);
      return false;
    }
  }

  /**
   * Validate if address is a proper Solana address
   */
  isValidSolanaAddress(address) {
    try {
      // Basic checks
      if (!address || typeof address !== 'string') return false;
      if (address.length < 32 || address.length > 44) return false;
      
      // Check if it's a valid base58 string with proper length
      new web3.PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify a single address and collect comprehensive data
   */
  async verifyAddress(address, label = '') {
    try {
      console.log(`🔍 Verifying address: ${address} ${label ? `(${label})` : ''}`);
      
      // Validate address format first
      if (!this.isValidSolanaAddress(address)) {
        return {
          address: address,
          label: label,
          error: 'Invalid Solana address format',
          timestamp: new Date().toISOString()
        };
      }
      
      const publicKey = new web3.PublicKey(address);
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      
      const result = {
        address: address,
        label: label,
        exists: !!accountInfo,
        timestamp: new Date().toISOString(),
        accountInfo: null,
        transactions: [],
        programData: null,
        balance: 0,
        owner: null,
        executable: false,
        dataSize: 0
      };

      if (accountInfo) {
        result.accountInfo = {
          lamports: accountInfo.lamports,
          owner: accountInfo.owner.toBase58(),
          executable: accountInfo.executable,
          rentEpoch: accountInfo.rentEpoch,
          dataLength: accountInfo.data.length
        };
        
        result.balance = accountInfo.lamports / 1e9; // Convert to SOL
        result.owner = accountInfo.owner.toBase58();
        result.executable = accountInfo.executable;
        result.dataSize = accountInfo.data.length;

        // Get recent transactions
        try {
          const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 10 });
          result.transactions = signatures.map(sig => ({
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            confirmationStatus: sig.confirmationStatus,
            err: sig.err,
            memo: sig.memo
          }));
        } catch (txError) {
          console.log(`⚠️  Could not fetch transactions for ${address}: ${txError.message}`);
        }

        // Special handling for BPF programs
        if (accountInfo.owner.toBase58() === 'BPFLoaderUpgradeab1e11111111111111111111111') {
          try {
            const programDataKey = new web3.PublicKey(accountInfo.data.slice(4, 36));
            const programData = await this.connection.getAccountInfo(programDataKey);
            
            if (programData) {
              const upgradeAuthority = new web3.PublicKey(programData.data.slice(13, 45));
              result.programData = {
                programDataAddress: programDataKey.toBase58(),
                upgradeAuthority: upgradeAuthority.toBase58(),
                isUpgradeAuthorityNull: upgradeAuthority.equals(web3.PublicKey.default),
                programDataSize: programData.data.length
              };
            }
          } catch (programError) {
            console.log(`⚠️  Could not fetch program data for ${address}: ${programError.message}`);
          }
        }

        // Check if it's a multisig
        if (accountInfo.owner.toBase58() === 'SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu') {
          result.multisig = {
            program: 'Squads V3',
            programId: 'SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu'
          };
        }

        console.log(`✅ Address verified: ${address} - SOL: ${result.balance.toFixed(6)} - Owner: ${result.owner.substring(0, 8)}...`);
      } else {
        console.log(`❌ Address not found: ${address}`);
      }

      return result;
    } catch (error) {
      console.error(`❌ Error verifying address ${address}:`, error.message);
      return {
        address: address,
        label: label,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract all addresses from the contract_addresses.json structure
   */
  extractAllAddresses() {
    const addresses = [];
    
    if (this.contractAddresses.omega_prime_addresses) {
      const data = this.contractAddresses.omega_prime_addresses;
      
      // Bot army addresses
      if (data.bot_army) {
        Object.entries(data.bot_army).forEach(([botName, botData]) => {
          if (botData.bot_address) {
            addresses.push({ address: botData.bot_address, label: `${botName} - bot_address` });
          }
          if (botData.contract_address) {
            addresses.push({ address: botData.contract_address, label: `${botName} - contract_address` });
          }
        });
      }

      // Control addresses
      if (data.control_addresses) {
        Object.entries(data.control_addresses).forEach(([name, addressData]) => {
          if (addressData.address) {
            addresses.push({ address: addressData.address, label: `control - ${name}` });
          }
        });
      }

      // Program IDs
      if (data.program_ids) {
        Object.entries(data.program_ids).forEach(([category, programs]) => {
          Object.entries(programs).forEach(([name, programId]) => {
            addresses.push({ address: programId, label: `program - ${category} - ${name}` });
          });
        });
      }

      // Treasury addresses
      if (data.treasury_operational) {
        Object.entries(data.treasury_operational).forEach(([name, address]) => {
          addresses.push({ address: address, label: `treasury - ${name}` });
        });
      }

      // Token addresses
      if (data.token_addresses) {
        Object.entries(data.token_addresses).forEach(([name, address]) => {
          addresses.push({ address: address, label: `token - ${name}` });
        });
      }

      // Analysis addresses
      if (data.analysis_addresses) {
        Object.entries(data.analysis_addresses).forEach(([name, address]) => {
          addresses.push({ address: address, label: `analysis - ${name}` });
        });
      }

      // All addresses list
      if (data.all_addresses_list) {
        data.all_addresses_list.forEach(address => {
          addresses.push({ address: address, label: 'from_all_addresses_list' });
        });
      }
    }

    // Remove duplicates
    const uniqueAddresses = [];
    const seen = new Set();
    
    for (const item of addresses) {
      if (!seen.has(item.address)) {
        seen.add(item.address);
        uniqueAddresses.push(item);
      }
    }

    console.log(`📊 Extracted ${uniqueAddresses.length} unique addresses from contract_addresses.json`);
    return uniqueAddresses;
  }

  /**
   * Verify all addresses and collect data
   */
  async verifyAllAddresses() {
    console.log('🚀 Starting comprehensive address verification...');
    
    if (!this.loadContractAddresses()) {
      throw new Error('Failed to load contract addresses');
    }

    const addresses = this.extractAllAddresses();
    
    // Add target address if not already included
    if (!addresses.some(item => item.address === this.targetAddress)) {
      addresses.push({ address: this.targetAddress, label: 'target_analysis_address' });
    }

    console.log(`🔄 Verifying ${addresses.length} addresses...`);
    
    for (const { address, label } of addresses) {
      const result = await this.verifyAddress(address, label);
      this.verificationResults[address] = result;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Address verification completed');
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    const results = Object.values(this.verificationResults);
    const existing = results.filter(r => r.exists);
    const totalSOL = existing.reduce((sum, r) => sum + (r.balance || 0), 0);
    const programs = existing.filter(r => r.executable);
    const withTransactions = existing.filter(r => r.transactions && r.transactions.length > 0);

    return {
      totalAddresses: results.length,
      existingAddresses: existing.length,
      missingAddresses: results.length - existing.length,
      totalSOLBalance: totalSOL,
      executablePrograms: programs.length,
      addressesWithTransactions: withTransactions.length,
      verificationTimestamp: new Date().toISOString()
    };
  }

  /**
   * Save results to files
   */
  async saveResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Prepare comprehensive data structure
    const comprehensiveData = {
      metadata: {
        timestamp: new Date().toISOString(),
        verificationTarget: this.targetAddress,
        totalAddressesChecked: Object.keys(this.verificationResults).length,
        toolVersion: '1.0.0'
      },
      summary: this.generateSummary(),
      targetAddressAnalysis: this.verificationResults[this.targetAddress] || null,
      verificationResults: this.verificationResults,
      controllerAddresses: this.getControllerAddresses(),
      transactionSummary: this.getTransactionSummary()
    };

    // Save as JSON
    const jsonPath = path.join(__dirname, `address-verification-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(comprehensiveData, null, 2));
    console.log(`💾 Saved comprehensive data to: ${jsonPath}`);

    // Save as formatted markdown report
    const markdownPath = path.join(__dirname, `address-verification-report-${timestamp}.md`);
    const markdownContent = this.generateMarkdownReport(comprehensiveData);
    fs.writeFileSync(markdownPath, markdownContent);
    console.log(`📄 Saved formatted report to: ${markdownPath}`);

    return { jsonPath, markdownPath };
  }

  /**
   * Get controller addresses specifically
   */
  getControllerAddresses() {
    const controllers = {};
    
    Object.entries(this.verificationResults).forEach(([address, data]) => {
      if (data.label && (
        data.label.includes('control') || 
        data.label.includes('master') ||
        data.label.includes('controller') ||
        address === this.targetAddress
      )) {
        controllers[address] = data;
      }
    });

    return controllers;
  }

  /**
   * Get transaction summary
   */
  getTransactionSummary() {
    const summary = {};
    
    Object.entries(this.verificationResults).forEach(([address, data]) => {
      if (data.transactions && data.transactions.length > 0) {
        summary[address] = {
          transactionCount: data.transactions.length,
          latestTransaction: data.transactions[0],
          transactionHistory: data.transactions
        };
      }
    });

    return summary;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(data) {
    const summary = data.summary;
    
    return `# Comprehensive Address Verification Report

Generated: ${data.metadata.timestamp}

## 📊 Summary

- **Total Addresses Checked**: ${summary.totalAddresses}
- **Existing Addresses**: ${summary.existingAddresses}
- **Missing Addresses**: ${summary.missingAddresses}
- **Total SOL Balance**: ${summary.totalSOLBalance.toFixed(6)} SOL
- **Executable Programs**: ${summary.executablePrograms}
- **Addresses with Transactions**: ${summary.addressesWithTransactions}

## 🎯 Target Address Analysis: ${data.metadata.verificationTarget}

${data.targetAddressAnalysis ? this.formatAddressForMarkdown(data.targetAddressAnalysis) : 'Target address not found or error occurred'}

## 🎮 Controller Addresses

${Object.entries(data.controllerAddresses).map(([addr, info]) => 
  `### ${info.label || 'Controller'}\n${this.formatAddressForMarkdown(info)}`
).join('\n\n')}

## 📈 Transaction Summary

${Object.entries(data.transactionSummary).map(([addr, txInfo]) => 
  `### ${addr}\n- **Transaction Count**: ${txInfo.transactionCount}\n- **Latest Transaction**: ${txInfo.latestTransaction.signature}\n- **Block Time**: ${new Date(txInfo.latestTransaction.blockTime * 1000).toISOString()}`
).join('\n\n')}

## 🔍 All Verification Results

${Object.entries(data.verificationResults).map(([addr, info]) => 
  `### ${addr} (${info.label || 'Unknown'})\n${this.formatAddressForMarkdown(info)}`
).join('\n\n')}

---
*Report generated by Comprehensive Address Verification Utility*
`;
  }

  /**
   * Format address data for markdown
   */
  formatAddressForMarkdown(addressData) {
    if (addressData.error) {
      return `❌ **Error**: ${addressData.error}`;
    }
    
    if (!addressData.exists) {
      return `❌ **Status**: Address not found on mainnet`;
    }

    let output = `✅ **Status**: Active on mainnet
- **SOL Balance**: ${addressData.balance.toFixed(6)} SOL
- **Owner**: ${addressData.owner}
- **Executable**: ${addressData.executable ? 'Yes' : 'No'}
- **Data Size**: ${addressData.dataSize} bytes
- **Transactions**: ${addressData.transactions ? addressData.transactions.length : 0}`;

    if (addressData.programData) {
      output += `
- **Program Type**: Upgradeable BPF Program
- **Upgrade Authority**: ${addressData.programData.upgradeAuthority}
- **Authority Renounced**: ${addressData.programData.isUpgradeAuthorityNull ? 'Yes' : 'No'}`;
    }

    if (addressData.multisig) {
      output += `
- **Multisig Program**: ${addressData.multisig.program}`;
    }

    return output;
  }
}

// Main execution function
async function main() {
  console.log('🔧 COMPREHENSIVE ADDRESS VERIFICATION UTILITY');
  console.log('=' .repeat(60));
  
  const verifier = new AddressVerifier();
  
  try {
    await verifier.verifyAllAddresses();
    const { jsonPath, markdownPath } = await verifier.saveResults();
    
    console.log('\n✅ VERIFICATION COMPLETED SUCCESSFULLY');
    console.log('📁 Output files:');
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   Report: ${markdownPath}`);
    
    const summary = verifier.generateSummary();
    console.log('\n📊 SUMMARY:');
    console.log(`   Total Addresses: ${summary.totalAddresses}`);
    console.log(`   Existing: ${summary.existingAddresses}`);
    console.log(`   Total SOL: ${summary.totalSOLBalance.toFixed(6)}`);
    console.log(`   Programs: ${summary.executablePrograms}`);
    
  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AddressVerifier;