# Development Guidelines

## Code Quality Standards

### File Headers and Documentation
- **Comprehensive file headers**: Every major file includes descriptive comments explaining purpose and functionality
- **Multi-line comment blocks**: Use `/** ... */` for class/function documentation
- **Inline comments**: Explain complex logic, business rules, and non-obvious implementations
- **Section markers**: Use comment separators like `// ========== HELPER METHODS ==========` to organize code

Example from github-account-scanner.js:
```javascript
/**
 * 🔍 GITHUB ACCOUNT & REPOSITORY SCANNER
 * 
 * This script scans the GitHub account and all repositories for:
 * 1. Repository overview and analysis
 * 2. Contract addresses across all repos
 * 3. Security and access analysis
 * 4. Cross-repository connections
 */
```

### Naming Conventions
- **camelCase**: Variables, functions, methods (e.g., `scanDirectoryStructure`, `analyzeCurrentRepository`)
- **PascalCase**: Classes, interfaces, types (e.g., `GitHubAccountScanner`, `OneirobotSyndicate`, `SecurityConfig`)
- **UPPER_SNAKE_CASE**: Constants and environment variables (e.g., `ONEIROBOT_CONTRACT`, `HELIUS_API_KEY`, `MAX_SUPPLY`)
- **Descriptive names**: Use full words over abbreviations (e.g., `creatorPrivateKey` not `crPrvKey`)
- **Prefix conventions**: 
  - `is`, `has`, `should` for booleans (e.g., `isValidSolanaAddress`, `hasWeb3`)
  - `get`, `set`, `create`, `update`, `delete` for CRUD operations
  - `validate`, `check`, `verify` for validation functions

### Code Structure
- **Class-based organization**: Major functionality encapsulated in classes with clear responsibilities
- **Method organization**: Public methods first, private/helper methods at end
- **Single Responsibility Principle**: Each function/method has one clear purpose
- **DRY (Don't Repeat Yourself)**: Common logic extracted into utility functions
- **Modular design**: Related functionality grouped in dedicated files/directories

Example class structure:
```javascript
class GitHubAccountScanner {
  constructor() { /* initialization */ }
  
  // Public methods
  async runCompleteScan() { /* main entry point */ }
  async analyzeCurrentRepository() { /* public API */ }
  
  // Helper methods (at end)
  async findFilesByPattern() { /* utility */ }
  isValidSolanaAddress() { /* validation */ }
}
```

### Error Handling
- **Try-catch blocks**: Wrap async operations and risky code
- **Graceful degradation**: Continue execution when non-critical operations fail
- **Error logging**: Use `console.error()` for errors, `console.warn()` for warnings
- **Error context**: Include relevant context in error messages
- **Throw vs. return**: Throw for critical errors, return error objects for recoverable issues

Example pattern:
```javascript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('❌ Operation failed:', error.message);
  analysis.error = error.message;
  // Continue execution or throw based on criticality
}
```

### Console Output Standards
- **Emoji prefixes**: Use emojis for visual categorization (🔍, ✅, ❌, ⚠️, 🔒, 📊)
- **Section headers**: Clear visual separators with repeated characters
- **Progress indicators**: Inform users of current operation
- **Structured output**: Use consistent formatting for similar information
- **Color coding**: Implicit through emoji usage (✅ success, ❌ error, ⚠️ warning)

Example output pattern:
```javascript
console.log('🔍 GITHUB ACCOUNT & REPOSITORY SCANNER');
console.log('='.repeat(60));
console.log(`📅 Scan Started: ${timestamp}`);
console.log('✅ Repository analysis complete:');
console.log(`   📁 Directories: ${count}`);
```

## Semantic Patterns

### Async/Await Pattern
- **Consistent async usage**: All asynchronous operations use async/await (not callbacks or raw promises)
- **Await in sequence**: Operations that depend on each other are awaited sequentially
- **Parallel execution**: Independent operations use `Promise.all()` for concurrency
- **Top-level async**: Main execution functions are async

Example:
```javascript
async function deployAndTransferOwnership() {
  const connection = new web3.Connection(rpcUrl);
  const balance = await connection.getBalance(creator.publicKey);
  const signature = await web3.sendAndConfirmTransaction(connection, tx, [creator]);
}
```

### Configuration Management
- **Environment variables**: All sensitive data and configuration via `process.env`
- **Dotenv integration**: Use `dotenv.config()` at application entry
- **Validation functions**: Dedicated functions to validate configuration
- **Default values**: Provide sensible defaults with fallback operator (`||`)
- **Type safety**: Use TypeScript interfaces for configuration objects

Example from securityConfig.ts:
```typescript
export function getSecureConfig(): SecurityConfig {
  const config: SecurityConfig = {
    rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
    heliusApiKey: process.env.HELIUS_API_KEY,
    dryRun: process.env.DRY_RUN === 'true'
  };
  
  validateApiKey(config.heliusApiKey, 'HELIUS_API_KEY');
  validatePublicKey(config.treasuryPubkey, 'TREASURY_PUBKEY');
  
  return config;
}
```

### Validation Patterns
- **Early validation**: Validate inputs at function entry
- **Dedicated validators**: Separate validation functions for reusability
- **Descriptive errors**: Validation errors include context and expected format
- **Type guards**: Use TypeScript type guards for runtime type checking
- **Regex patterns**: Common patterns defined as constants

Example validation:
```typescript
function validatePublicKey(key: string | undefined, name: string): void {
  if (!key) return;
  
  try {
    new PublicKey(key);
  } catch (error) {
    throw new Error(`Invalid public key for ${name}: ${key}`);
  }
}
```

### Transaction Patterns (Solana)
- **Transaction building**: Use `new web3.Transaction().add()` pattern
- **Instruction composition**: Build complex transactions from multiple instructions
- **Confirmation strategy**: Always specify commitment level (`confirmed`, `finalized`)
- **Signature tracking**: Store and log transaction signatures for verification
- **Explorer links**: Generate Solana Explorer URLs for user verification

Example:
```javascript
const createMintTx = new web3.Transaction().add(
  web3.SystemProgram.createAccount({ /* params */ }),
  spl.createInitializeMintInstruction(/* params */)
);

const signature = await web3.sendAndConfirmTransaction(
  connection,
  createMintTx,
  [creator, omegaMint],
  { commitment: "confirmed" }
);

console.log(`🔗 Explorer: https://explorer.solana.com/tx/${signature}`);
```

### Data Structure Patterns
- **Nested objects**: Use nested objects for hierarchical data organization
- **Arrays for collections**: Use arrays for lists of similar items
- **Metadata objects**: Store metadata alongside primary data
- **Timestamps**: Include ISO timestamps for all events
- **Type annotations**: Use TypeScript interfaces for complex data structures

Example:
```javascript
const scanResults = {
  timestamp: new Date().toISOString(),
  currentRepository: {
    name: 'Omega-prime-deployer',
    path: process.cwd(),
    analysis: {
      structure: {},
      addresses: [],
      contracts: []
    }
  }
};
```

### File System Operations
- **Recursive traversal**: Use iterative or recursive patterns for directory scanning
- **Path handling**: Use `path.join()` for cross-platform compatibility
- **Existence checks**: Check file existence before operations
- **Error tolerance**: Skip unreadable files/directories without failing
- **Relative paths**: Use `path.relative()` for user-friendly output

Example:
```javascript
async scanDirectoryStructure(dirPath, structure, depth = 0) {
  if (depth > 5) return; // Prevent infinite recursion
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        if (['node_modules', '.git'].includes(item)) continue;
        await this.scanDirectoryStructure(itemPath, structure[item].children, depth + 1);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
}
```

## Internal API Usage

### Solana Web3.js
```javascript
// Connection management
const connection = new web3.Connection(rpcUrl, 'confirmed');

// Keypair operations
const keypair = web3.Keypair.generate();
const keypairFromSecret = web3.Keypair.fromSecretKey(new Uint8Array(privateKey));

// Public key operations
const pubkey = new web3.PublicKey(address);
const base58 = pubkey.toBase58();

// Balance queries
const balance = await connection.getBalance(pubkey);
const balanceSOL = balance / web3.LAMPORTS_PER_SOL;

// Transaction building
const tx = new web3.Transaction().add(instruction1, instruction2);
const signature = await web3.sendAndConfirmTransaction(connection, tx, signers, options);
```

### SPL Token
```javascript
// Token program constants
spl.TOKEN_2022_PROGRAM_ID
spl.MINT_SIZE

// Mint operations
const rentMint = await spl.getMinimumBalanceForRentExemptMint(connection);
const createMintIx = spl.createInitializeMintInstruction(
  mintPubkey,
  decimals,
  mintAuthority,
  freezeAuthority,
  spl.TOKEN_2022_PROGRAM_ID
);

// Associated Token Account (ATA)
const ata = await spl.getAssociatedTokenAddress(
  mintPubkey,
  ownerPubkey,
  false,
  spl.TOKEN_2022_PROGRAM_ID
);

const createATAIx = spl.createAssociatedTokenAccountInstruction(
  payer,
  ata,
  owner,
  mint,
  spl.TOKEN_2022_PROGRAM_ID
);

// Minting tokens
const mintToIx = spl.createMintToInstruction(
  mint,
  destination,
  authority,
  amount,
  [],
  spl.TOKEN_2022_PROGRAM_ID
);

// Authority management
const setAuthorityIx = spl.createSetAuthorityInstruction(
  mint,
  currentAuthority,
  spl.AuthorityType.MintTokens,
  newAuthority,
  [],
  spl.TOKEN_2022_PROGRAM_ID
);
```

### Ethers.js (for Ethereum contracts)
```javascript
// Contract deployment
const ContractFactory = await ethers.getContractFactory("OneirobotSyndicate");
const contract = await ContractFactory.deploy(name, symbol, baseURI);
await contract.waitForDeployment();

// Contract interaction
await contract.mintOneirobot(userAddress, ipfsHash);
const traits = await contract.getOneirobotTraits(tokenId);

// Signer management
const [owner, user1, user2] = await ethers.getSigners();
await contract.connect(user1).someFunction();

// Event testing
await expect(contract.someFunction())
  .to.emit(contract, "EventName")
  .withArgs(arg1, arg2);
```

### Node.js File System
```javascript
// Synchronous operations (for simple scripts)
const exists = fs.existsSync(filePath);
const content = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(filePath, content);
const items = fs.readdirSync(dirPath);
const stats = fs.statSync(itemPath);

// Directory operations
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Path operations
const joined = path.join(dir, file);
const relative = path.relative(rootPath, filePath);
const basename = path.basename(filePath);
const extname = path.extname(filePath);
```

### Dotenv
```javascript
// Load environment variables at entry point
import * as dotenv from 'dotenv';
dotenv.config();

// Access variables
const apiKey = process.env.HELIUS_API_KEY;
const isDryRun = process.env.DRY_RUN === 'true';
const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
```

## Code Idioms

### Ternary for Simple Conditionals
```javascript
const mode = isDryRun ? 'simulation' : 'live';
const authority = config.daoPubkey ? new PublicKey(config.daoPubkey) : null;
```

### Optional Chaining
```javascript
const length = repo.security?.sensitive_files?.length || 0;
const hasTests = analysis.structure?.test?.children;
```

### Array Methods
```javascript
// Filter
const jsFiles = files.filter(f => f.endsWith('.js'));

// Map
const addresses = results.map(r => r.address);

// Some/Every
const hasPattern = patterns.some(p => p.test(content));

// Find
const config = configs.find(c => c.file === 'package.json');

// Reduce
const total = items.reduce((sum, item) => sum + item.value, 0);
```

### Destructuring
```javascript
// Object destructuring
const { rpcUrl, heliusApiKey, dryRun } = config;

// Array destructuring
const [owner, user1, user2] = await ethers.getSigners();

// Function parameters
function analyze({ content, fileName, type }) { /* ... */ }
```

### Template Literals
```javascript
const url = `https://explorer.solana.com/tx/${signature}`;
const message = `Found ${count} addresses in ${files.length} files`;
```

### Spread Operator
```javascript
const allDeps = { ...dependencies.production, ...dependencies.development };
const allFiles = [...jsFiles, ...tsFiles];
```

### Default Parameters
```javascript
async function scanDirectory(dirPath, structure, depth = 0) { /* ... */ }
function createConnection(commitment = 'confirmed') { /* ... */ }
```

### Guard Clauses
```javascript
function validateKey(key, name) {
  if (!key) return;
  if (key.length < 8) throw new Error(`${name} too short`);
  // Main logic here
}
```

## Testing Patterns

### Test Structure (Hardhat/Chai)
```typescript
describe("ContractName - Feature Tests", function () {
  let contract: ContractType;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ContractName");
    contract = await Factory.deploy(/* params */);
    await contract.waitForDeployment();
  });

  describe("Feature Group", function () {
    it("Should perform expected behavior", async function () {
      await expect(contract.someFunction())
        .to.emit(contract, "EventName")
        .withArgs(expectedValue);
      
      expect(await contract.someGetter()).to.equal(expectedValue);
    });

    it("Should prevent unauthorized action", async function () {
      await expect(
        contract.connect(user).restrictedFunction()
      ).to.be.revertedWith("Error message");
    });
  });
});
```

### Assertion Patterns
```typescript
// Equality
expect(value).to.equal(expected);
expect(value).to.be.true;
expect(value).to.be.false;

// Numeric comparisons
expect(value).to.be.gte(min).and.lte(max);
expect(value).to.be.lt(threshold);

// Event emissions
await expect(tx).to.emit(contract, "EventName").withArgs(arg1, arg2);

// Reverts
await expect(tx).to.be.revertedWith("Error message");
await expect(tx).to.be.revertedWith(/Regex pattern/);

// Type checks
expect(value).to.be.a('bigint');
expect(value).to.be.a('string');
```

## Security Best Practices

### No Hardcoded Secrets
```javascript
// ❌ NEVER do this
const apiKey = "16b9324a-5b8c-47b9-9b02-6efa86895e5";

// ✅ Always use environment variables
const apiKey = process.env.HELIUS_API_KEY;
```

### Validate All Inputs
```typescript
function validatePublicKey(key: string | undefined, name: string): void {
  if (!key) return;
  
  try {
    new PublicKey(key);
  } catch (error) {
    throw new Error(`Invalid public key for ${name}: ${key}`);
  }
}
```

### Dry Run Mode
```javascript
if (config.dryRun) {
  console.warn('⚠️  DRY_RUN mode is enabled. No transactions will be executed.');
  return; // or simulate
}
```

### Placeholder Detection
```javascript
const placeholders = ['<YOUR_', 'REPLACE', 'INSERT', 'PLACEHOLDER'];
if (placeholders.some(p => apiKey.includes(p))) {
  throw new Error('API key appears to be a placeholder');
}
```

### Authority Management
```javascript
// Transfer authority pattern
const setAuthorityIx = spl.createSetAuthorityInstruction(
  mint,
  currentAuthority,
  spl.AuthorityType.MintTokens,
  newAuthority,
  [],
  spl.TOKEN_2022_PROGRAM_ID
);
```

## Documentation Standards

### Function Documentation
```typescript
/**
 * Validates that a string is a valid Solana public key
 * 
 * @param key - The public key string to validate
 * @param name - Descriptive name for error messages
 * @throws Error if the key is invalid
 */
function validatePublicKey(key: string | undefined, name: string): void {
  // Implementation
}
```

### Inline Comments
```javascript
// Check creator balance
const balance = await connection.getBalance(creator.publicKey);

// 0.15 SOL minimum
if (balance < 150000000) {
  console.log('❌ Insufficient balance for deployment');
  return;
}
```

### Section Organization
```javascript
// ========== HELPER METHODS ==========

async findFilesByPattern(rootPath, patterns) { /* ... */ }

isValidSolanaAddress(address) { /* ... */ }

getAddressContext(content, address) { /* ... */ }
```

## Performance Considerations

### Avoid Unnecessary Operations
```javascript
// Skip excluded directories early
if (['node_modules', '.git', 'dist'].includes(item)) continue;

// Limit recursion depth
if (depth > 5) return;
```

### Batch Operations
```javascript
// Use Promise.all for parallel operations
const promises = files.map(file => processFile(file));
await Promise.all(promises);
```

### Efficient Data Structures
```javascript
// Use Set for uniqueness checks
const uniqueAddresses = [...new Set(addresses)];

// Use Map for lookups
const addressMap = new Map(addresses.map(a => [a.address, a]));
```

### Lazy Evaluation
```javascript
// Only compute when needed
get totalSupply() {
  return this._totalSupply || this.calculateTotalSupply();
}
```
