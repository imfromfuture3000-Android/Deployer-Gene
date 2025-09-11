# Address Verification Utilities

This repository includes comprehensive address verification utilities that check useful data controller addresses, verify addresses, and save all collected data into organized files.

## 🔧 Utilities

### 1. Comprehensive Address Verifier (`comprehensive-address-verifier.js`)

Main utility that verifies all addresses from the contract_addresses.json file and collects comprehensive data:

- ✅ Reads addresses from contract_addresses.json
- ✅ Verifies each address on Solana mainnet  
- ✅ Collects account info, balance, transactions, program data
- ✅ Analyzes upgrade authorities and multisig configurations
- ✅ Saves results to JSON and Markdown files
- ✅ Focuses on controller addresses and target analysis

**Usage:**
```bash
# Using npm script
npm run verify:addresses

# Or directly
node comprehensive-address-verifier.js
```

### 2. Demo Version (`address-verifier-demo.js`)

Demonstration version with mock data showing full functionality:

- 📝 Shows complete functionality with realistic mock data
- 🎯 Includes detailed analysis of target address GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp
- 🔐 Demonstrates multisig analysis and security reporting
- 📊 Generates comprehensive reports with findings and recommendations

**Usage:**
```bash
# Using npm script
npm run verify:demo

# Or directly
node address-verifier-demo.js
```

## 📊 Target Address Analysis

The utilities specifically analyze the target address from the problem statement:

**Address:** `GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp`

### Key Findings:
- ✅ **Program Type**: Upgradeable BPF Program
- ✅ **Balance**: ◎0.00114144 SOL
- ✅ **Executable**: Yes
- ✅ **Upgrade Authority**: Multisig controlled (CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ)
- ✅ **Security**: 4-of-7 multisig threshold (Squads V3)

### Multisig Members:
1. 2MgqMXdwSf3bRZ6S8uKJSffZAaoZBhD2mjst3phJXE7p
2. 89FnbsKH8n6FXCghGUijxh3snqx3e6VXJ7q1fQAHWkQQ
3. BYidGfUnfoQtqi4nHiuo57Fjreizbej6hawJLnbwJmYr
4. CHRDWWqUs6LyeeoD7pJb3iRfnvYeMfwMUtf2N7zWk7uh
5. Dg5NLa5JuwfRMkuwZEguD9RpVrcQD3536GxogUv7pLNV
6. EhJqf1p39c8NnH5iuZAJyw778LQua1AhZWxarT5SF8sT
7. GGG2JyBtwbPAsYwUQED8GBbj9UMi7NQa3uwN3DmyGNtz

## 📁 Output Files

Both utilities generate structured output files:

### JSON Output
- Complete verification results
- Metadata and timestamps
- Detailed account information
- Transaction histories
- Program and multisig data

### Markdown Reports
- Executive summary
- Target address analysis
- Controller addresses breakdown
- Security assessment
- Key findings and recommendations

## 🚀 Features

- **Address Validation**: Validates Solana address format before processing
- **Comprehensive Data Collection**: Account info, balances, transactions, program data
- **Multisig Analysis**: Detects and analyzes multisig configurations
- **Controller Focus**: Special attention to controller and master addresses
- **Security Assessment**: Evaluates upgrade authorities and security posture
- **Organized Output**: Structured JSON and readable Markdown reports
- **Error Handling**: Graceful handling of network issues and invalid addresses

## ⚙️ Configuration

The utilities use environment variables from `.env`:

```env
RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=your_api_key_here
```

## 📈 Example Output Structure

```json
{
  "metadata": {
    "timestamp": "2025-09-11T13:41:12.310Z",
    "verificationTarget": "GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp",
    "totalAddressesChecked": 25,
    "toolVersion": "1.0.0"
  },
  "summary": {
    "totalAddresses": 25,
    "existingAddresses": 4,
    "totalSOLBalance": 2.924341,
    "executablePrograms": 2,
    "addressesWithTransactions": 2
  },
  "targetAddressAnalysis": { /* detailed analysis */ },
  "verificationResults": { /* all results */ },
  "controllerAddresses": { /* controller analysis */ },
  "transactionSummary": { /* transaction data */ }
}
```

## 🔍 Use Cases

1. **Security Auditing**: Verify upgrade authorities and multisig configurations
2. **Address Validation**: Ensure all contract addresses are valid and active
3. **Balance Monitoring**: Track SOL balances across all addresses
4. **Transaction Analysis**: Review recent transaction activity
5. **Controller Analysis**: Focus on addresses with control permissions
6. **Documentation**: Generate comprehensive address reports

## 🛡️ Security

- **No Private Keys**: Utilities only read public address data
- **Rate Limiting**: Built-in delays to respect RPC endpoints
- **Error Handling**: Graceful handling of network and address issues
- **Validation**: Input validation for all addresses before processing

---

*These utilities provide comprehensive address verification and data collection capabilities for the Omega Prime Deployer project, with special focus on the target controller addresses and security analysis.*