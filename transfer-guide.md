# 💸 ETH Transfer Guide

## Quick Transfer

```bash
# Set your private key (NEVER commit this)
export ETH_PRIVATE_KEY=0x1234567890abcdef...

# Transfer ETH
node transfer-eth.js
```

## Manual Steps

1. **Get Private Key** - Export from MetaMask/wallet
2. **Set Environment Variable**:
   ```bash
   export ETH_PRIVATE_KEY=your_private_key_here
   ```
3. **Edit transfer-eth.js** - Change recipient address and amount
4. **Run Transfer**:
   ```bash
   node transfer-eth.js
   ```

## Security Notes

- ⚠️ **NEVER** commit private keys to git
- Use environment variables only
- Test with small amounts first
- Check gas prices before sending

## Example Output

```
From: 0xYourAddress...
To: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
Amount: 0.01 ETH
Balance: 1.5 ETH
Transaction hash: 0xabc123...
✅ Transfer complete! Block: 12345678
```