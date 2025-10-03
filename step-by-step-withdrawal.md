# Step-by-Step Program Withdrawal Guide

## 🔐 SECURE WITHDRAWAL PROCESS

### Step 1: Prepare Your Environment
```bash
# Make sure you're in your project directory
cd /workspaces/Deployer-Gene

# Install required packages if not already installed
npm install @solana/web3.js @solana/spl-token
```

### Step 2: Create Withdrawal Script
```javascript
// save as: my-withdrawal.js
const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');

async function withdrawFromPrograms() {
  // 1. Load your private key (REPLACE WITH YOUR METHOD)
  const privateKeyArray = JSON.parse(fs.readFileSync('.deployer.key', 'utf8'));
  const deployerKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
  
  // 2. Connect to mainnet
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  // 3. Your programs with balances
  const programs = [
    { address: 'T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt', balance: 0.113759865 },
    { address: 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', balance: 6.452432793 },
    { address: 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1', balance: 2.161991723 }
  ];
  
  // 4. Your destination wallet
  const destination = deployerKeypair.publicKey;
  
  console.log('🚀 Starting withdrawal process...');
  console.log(`📥 Destination: ${destination.toString()}`);
  
  // 5. Process each program
  for (const program of programs) {
    try {
      const programPubkey = new PublicKey(program.address);
      const lamports = Math.floor(program.balance * LAMPORTS_PER_SOL);
      
      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: programPubkey,
        toPubkey: destination,
        lamports: lamports
      });
      
      // Create transaction
      const transaction = new Transaction().add(transferInstruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = deployerKeypair.publicKey;
      
      // Sign transaction
      transaction.sign(deployerKeypair);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(transaction.serialize());
      
      console.log(`✅ ${program.address}: ${program.balance} SOL`);
      console.log(`   TX: ${signature}`);
      
    } catch (error) {
      console.log(`❌ ${program.address}: ${error.message}`);
    }
  }
}

withdrawFromPrograms();
```

### Step 3: Prepare Your Private Key
Choose ONE method:

**Method A: Use existing .deployer.key file**
```bash
# If you already have .deployer.key file, you're ready
ls -la .deployer.key
```

**Method B: Create from base58 string**
```javascript
// If you have base58 private key string
const bs58 = require('bs58');
const privateKeyString = 'YOUR_BASE58_PRIVATE_KEY_HERE';
const privateKeyArray = bs58.decode(privateKeyString);
fs.writeFileSync('.deployer.key', JSON.stringify(Array.from(privateKeyArray)));
```

**Method C: Create from array**
```javascript
// If you have private key as array [1,2,3,...]
const privateKeyArray = [/* your 64-byte array */];
fs.writeFileSync('.deployer.key', JSON.stringify(privateKeyArray));
```

### Step 4: Execute Withdrawal
```bash
# Run the withdrawal script
node my-withdrawal.js
```

### Step 5: Verify Success
```bash
# Check your wallet balance
node -e "
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = new PublicKey('zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4');
connection.getBalance(wallet).then(balance => {
  console.log('💰 Your balance:', balance / LAMPORTS_PER_SOL, 'SOL');
});
"
```

## ⚠️ IMPORTANT NOTES

1. **BACKUP YOUR PRIVATE KEY** before starting
2. **TEST ON DEVNET FIRST** if unsure
3. **CHECK GAS FEES** - keep some SOL for transaction fees
4. **VERIFY ADDRESSES** - double-check all addresses
5. **MONITOR TRANSACTIONS** - watch for confirmations

## 🚨 TROUBLESHOOTING

- **"Insufficient funds"**: Program account may not have withdrawal authority
- **"Invalid signature"**: Wrong private key or keypair format
- **"Transaction failed"**: Network issues or program restrictions
- **"Access denied"**: You may not have admin authority on the program

## 🔒 SECURITY CHECKLIST

- [ ] Private key is secure and backed up
- [ ] Running on secure, private computer
- [ ] No one else can see your screen/files
- [ ] Using official Solana RPC endpoints
- [ ] Verified all addresses are correct