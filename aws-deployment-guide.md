# 🚀 AWS Mainnet Deployment Guide

## ⚠️ PRODUCTION ONLY - NO TESTNET

This system deploys **REAL** Solana tokens on **MAINNET** using AWS infrastructure.

## 🎯 Architecture

### AWS Components
- **Lambda**: Mainnet deployment function
- **S3**: Keypair and artifact storage
- **EC2**: Continuous deployment instance
- **API Gateway**: Deployment triggers
- **CloudFormation**: Infrastructure as code

### Solana Network
- **Network**: Mainnet-beta ONLY
- **Genesis**: `5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d`
- **Transactions**: Real SOL costs
- **No simulation**: Live blockchain only

## 🚀 Quick Setup

### 1. AWS Prerequisites
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Configure credentials
aws configure
```

### 2. Deploy Infrastructure
```bash
# Setup complete AWS infrastructure
npm run aws:setup-infrastructure
```

### 3. Deploy to Mainnet
```bash
# Deploy via AWS Lambda
npm run aws:mainnet-deploy
```

## 📊 Infrastructure Details

### CloudFormation Stack: `omega-prime-deployer`

**Resources Created:**
- S3 Bucket: `omega-prime-deployer`
- Lambda: `omega-prime-mainnet-deployer`
- API Gateway: Regional endpoint
- EC2: t3.micro instance
- IAM Roles: Deployment permissions
- CloudWatch: Logging

### Lambda Function
```javascript
// Mainnet-only deployment
exports.handler = async (event) => {
  // 1. Validate mainnet genesis
  // 2. Load keypairs from S3
  // 3. Check real SOL balance
  // 4. Submit real transaction
  // 5. Store results in S3
};
```

### API Endpoint
```
POST https://{api-id}.execute-api.us-east-1.amazonaws.com/prod/deploy
```

## 💰 Cost Structure

### AWS Costs (Monthly)
- Lambda: ~$0.20 (100 deployments)
- S3: ~$0.50 (storage)
- EC2: ~$8.50 (t3.micro)
- API Gateway: ~$3.50 (1M requests)
- **Total**: ~$12.70/month

### Solana Costs (Per Deployment)
- Rent exemption: ~0.00146 SOL
- Transaction fee: ~0.00002 SOL
- Priority fee: ~0.00001 SOL
- **Total**: ~0.00149 SOL (~$0.33)

## 🔧 Configuration

### Environment Variables
```bash
TREASURY_PUBKEY=zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4
AWS_REGION=us-east-1
BUCKET_NAME=omega-prime-deployer
```

### S3 Storage Structure
```
omega-prime-deployer/
├── deployer-keypair.json    # Funded wallet
├── mint-keypair.json        # Token mint
├── mainnet-deployment.json  # Results
└── deployment-log.json      # History
```

## 🎯 Deployment Flow

### 1. Pre-Deployment Validation
- ✅ Mainnet genesis check
- ✅ SOL balance verification
- ✅ Keypair validation
- ✅ RPC connectivity

### 2. Transaction Construction
- Create mint account instruction
- Initialize mint instruction
- Priority fee instruction
- Set treasury as authority

### 3. Mainnet Submission
- Sign with deployer + mint keypairs
- Submit to mainnet RPC
- Confirm transaction
- Store results in S3

### 4. Post-Deployment
- Trigger Lambda notifications
- Update deployment log
- Generate explorer links

## 🚀 Usage Examples

### Deploy via API
```bash
curl -X POST https://your-api-endpoint/prod/deploy \
  -H "Content-Type: application/json" \
  -d '{"treasury": "zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4"}'
```

### Deploy via Lambda
```bash
aws lambda invoke \
  --function-name omega-prime-mainnet-deployer \
  --payload '{}' \
  response.json
```

### Deploy via Node.js
```bash
npm run aws:mainnet-deploy
```

## 📊 Monitoring

### CloudWatch Logs
- Function: `/aws/lambda/omega-prime-mainnet-deployer`
- Retention: 30 days
- Metrics: Invocations, errors, duration

### S3 Artifacts
- Deployment results stored permanently
- Keypairs encrypted at rest
- Versioning enabled

## 🔒 Security

### IAM Permissions
- Lambda: S3 read/write only
- EC2: Limited S3 access
- API Gateway: IAM authentication

### Keypair Management
- Stored encrypted in S3
- Never logged or exposed
- Rotated on deployment

### Network Security
- VPC isolation (optional)
- Security groups configured
- HTTPS endpoints only

## ⚡ Performance

### Lambda Cold Start
- Runtime: Node.js 18.x
- Memory: 512MB
- Timeout: 5 minutes
- Cold start: ~2 seconds

### Transaction Speed
- Mainnet confirmation: ~30 seconds
- Priority fees: Dynamic calculation
- Retry logic: 3 attempts

## 🎯 Success Metrics

### Deployment Success
```json
{
  "mint": "TokenMintAddress...",
  "signature": "TransactionSignature...",
  "timestamp": "2025-10-02T...",
  "network": "mainnet-beta",
  "cost": "0.00149 SOL"
}
```

### Explorer Links
- Mint: `https://explorer.solana.com/address/{mint}`
- Transaction: `https://explorer.solana.com/tx/{signature}`

## 🚨 Important Notes

1. **MAINNET ONLY**: No testnet or devnet support
2. **REAL COSTS**: Every deployment costs real SOL
3. **NO SIMULATION**: All transactions are live
4. **IRREVERSIBLE**: Mainnet transactions cannot be undone
5. **FUND REQUIRED**: Deployer wallet must have SOL

## 🎯 Next Steps

1. **Setup AWS**: Run infrastructure deployment
2. **Fund Wallet**: Add SOL to deployer address
3. **Test API**: Verify endpoint connectivity
4. **Deploy Token**: Execute mainnet deployment
5. **Monitor**: Check CloudWatch logs

---

**🚀 Ready for production mainnet deployment on AWS!**