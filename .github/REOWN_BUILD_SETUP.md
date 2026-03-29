# Reown App Build Workflow - Setup Guide

This guide explains how to configure environment secrets for the Reown app build workflow.

## Overview

The GitHub Actions workflow (`reown-build.yml`) automates building, testing, and deploying your Reown app with proper secret management.

## Prerequisites

- GitHub repository with Actions enabled
- Reown (formerly WalletConnect) project
- Solana RPC endpoint
- Docker (optional, for containerization)

## Setting Up Secrets

### 1. Navigate to GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 2. Required Secrets

Add the following secrets:

#### **Reown Configuration**

```
REOWN_PROJECT_ID
```
- **Description**: Your Reown project ID from the Reown dashboard
- **Value**: Get from https://cloud.reown.com
- **Importance**: Required
- **Rotate**: Yearly or when suspected compromise

```
REOWN_SECRET_KEY
```
- **Description**: Your Reown secret key
- **Value**: Get from https://cloud.reown.com (Settings → API Keys)
- **Importance**: Critical - Keep confidential
- **Rotate**: Every 6 months

#### **Solana Configuration**

```
SOLANA_RPC_URL
```
- **Description**: Solana RPC endpoint URL
- **Options**:
  - Devnet: `https://api.devnet.solana.com`
  - Testnet: `https://api.testnet.solana.com`
  - Mainnet: `https://api.mainnet-beta.solana.com`
  - Helius: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
  - Alchemy: `https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY`
- **Importance**: Required

```
SOLANA_NETWORK
```
- **Description**: Network identifier
- **Value**: `devnet`, `testnet`, or `mainnet-beta`
- **Default**: `devnet`
- **Importance**: Optional

#### **API Keys**

```
ALCHEMY_API_KEY
```
- **Description**: Alchemy API key for advanced RPC features
- **Get**: https://dashboard.alchemy.com
- **Importance**: Optional but recommended

```
HELIUS_API_KEY
```
- **Description**: Helius API key for Solana indexing
- **Get**: https://dashboard.helius.dev
- **Importance**: Optional but recommended

#### **Wallet & Authority**

```
DEPLOYER_KEYPAIR
```
- **Description**: Base58 encoded deployer keypair or path reference
- **Format**: Base58 string (NOT raw private key file content)
- **Importance**: Critical - Keep confidential
- **Security**: Never commit to repository
- **Rotation**: Change after each deployment

```
TREASURY_PUBKEY
```
- **Description**: Treasury wallet public address
- **Format**: Solana public key (44 characters, base58)
- **Example**: `zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4`
- **Importance**: High

#### **App URLs**

```
APP_URL
```
- **Description**: Your application's frontend URL
- **Examples**:
  - Development: `http://localhost:3000`
  - Staging: `https://staging.example.com`
  - Production: `https://app.example.com`
- **Default**: `http://localhost:3000`
- **Importance**: Optional

```
API_URL
```
- **Description**: Your API backend URL
- **Examples**:
  - Development: `http://localhost:3001`
  - Production: `https://api.example.com`
- **Default**: `http://localhost:3001`
- **Importance**: Optional

#### **Feature Flags**

```
ENABLE_WALLET_CONNECT
```
- **Description**: Enable WalletConnect integration
- **Value**: `true` or `false`
- **Default**: `true`
- **Importance**: Optional

```
ENABLE_ANALYTICS
```
- **Description**: Enable analytics tracking
- **Value**: `true` or `false`
- **Default**: `true`
- **Importance**: Optional

#### **Security Scanning**

```
SNYK_TOKEN
```
- **Description**: Snyk security scanning token
- **Get**: https://snyk.io (Settings → API Token)
- **Importance**: Optional (for security scanning)

## Environment Variables File

The workflow creates a `.env.local` file with the following structure:

```bash
# Reown Configuration
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id
REOWN_SECRET_KEY=your_secret_key

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# API Keys
ALCHEMY_API_KEY=your_alchemy_key
HELIUS_API_KEY=your_helius_key

# Wallet Configuration
DEPLOYER_KEYPAIR=your_keypair
TREASURY_PUBKEY=your_treasury_address

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Feature Flags
NEXT_PUBLIC_ENABLE_WALLET_CONNECT=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Workflow Triggers

The workflow runs on:

- **Push to main/develop**: Automatic build and test
- **Pull Request to main/develop**: Automatic build and test
- **Manual trigger**: Via GitHub Actions UI with environment selection

### Manual Workflow Run

```bash
# Trigger via GitHub CLI
gh workflow run reown-build.yml \
  -f environment=production \
  -r main

# Or use the GitHub UI
# 1. Go to Actions
# 2. Select "Build Reown App"
# 3. Click "Run workflow"
# 4. Select environment and branch
```

## Workflow Steps Explained

### Build Job

1. **Checkout**: Get the latest code
2. **Setup Node.js**: Install specified Node version
3. **Create .env file**: Generate from secrets
4. **Verify environment**: Check required variables
5. **Install dependencies**: `npm ci`
6. **Lint code**: Check code style
7. **Run tests**: Execute test suite
8. **Build application**: Create production build
9. **Generate SBOM**: Software Bill of Materials
10. **Upload artifacts**: Save build outputs
11. **Security scan**: Trivy vulnerability scan
12. **npm audit**: Check dependencies
13. **Gitleaks**: Check for exposed secrets

### Security Job

- Snyk security scanning (optional)
- Generates SARIF reports for GitHub Security

### Publish Job

- Builds Docker image (if Dockerfile exists)
- Pushes to container registry
- Creates GitHub release

## Best Practices

### Secret Management

✅ **DO**:
- Use long, random values for API keys
- Rotate secrets every 6-12 months
- Use repository-specific secrets
- Enable secret scanning
- Log all secret access
- Use separate secrets per environment

❌ **DON'T**:
- Commit secrets to repository
- Share secrets via email/chat
- Use same secret across environments
- Hardcode secrets in code
- Log sensitive information
- Disable secret scanning

### Workflow Security

1. **Use trusted actions**: Pin action versions
   ```yaml
   uses: actions/checkout@v4  # Pinned version
   ```

2. **Limit permissions**: Use minimal required permissions
   ```yaml
   permissions:
     contents: read
     packages: write
   ```

3. **Use environments**: Create GitHub environments for prod
   - Settings → Environments → New environment
   - Add protection rules (require approvals)
   - Set environment secrets

4. **Review changes**: Require PR reviews before merge

5. **Monitor logs**: Check workflow logs for exposed secrets

## Environment Configuration

### Development Environment

```
SOLANA_NETWORK=devnet
NEXT_PUBLIC_REOWN_PROJECT_ID=dev_project_id
APP_URL=http://localhost:3000
ENABLE_ANALYTICS=false
```

### Staging Environment

```
SOLANA_NETWORK=testnet
NEXT_PUBLIC_REOWN_PROJECT_ID=staging_project_id
APP_URL=https://staging.example.com
ENABLE_ANALYTICS=true
```

### Production Environment

```
SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_REOWN_PROJECT_ID=prod_project_id
APP_URL=https://app.example.com
ENABLE_ANALYTICS=true
```

## Troubleshooting

### Missing Environment Variables

**Error**: `Missing required environment variables`

**Solution**:
1. Check GitHub Secrets settings
2. Verify secret names match workflow expectations
3. Ensure secrets are set for correct environment
4. Re-run workflow

### Build Failure

**Steps to debug**:
1. Check workflow logs (Actions → Workflow run → logs)
2. Look for specific error messages
3. Verify Node version compatibility
4. Check package.json scripts exist
5. Run locally: `npm install && npm run build`

### Docker Build Failure

**Solutions**:
1. Verify Dockerfile exists in repo
2. Test Docker build locally: `docker build .`
3. Check Docker syntax
4. Ensure all dependencies are installed

### Security Scan Alerts

**Actions**:
1. Review Trivy results in GitHub Security tab
2. Address critical vulnerabilities
3. Update dependencies if needed
4. Re-run workflow

## Monitoring

### Check Build Status

- Navigate to **Actions** tab
- View workflow run history
- Check logs for each job

### Download Artifacts

```bash
# Via GitHub CLI
gh run download <run_id> --dir artifacts/

# Artifacts available:
# - sbom.json: Software Bill of Materials
# - coverage/: Test coverage reports
# - build-report.md: Build summary
# - .next/, dist/, build/: Application builds
```

### GitHub Security Tab

- Check for vulnerabilities
- Review Trivy scan results
- Monitor Snyk findings

## Advanced Configuration

### Add Matrix Build

Test across multiple Node versions:

```yaml
strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### Deploy to Vercel

```yaml
- name: Deploy to Vercel
  uses: vercel/actions/deploy-production@main
  with:
    project-name: my-project
    github-token: ${{ secrets.GITHUB_TOKEN }}
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### Slack Notifications

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Build ${{ job.status }}: ${{ github.ref }}"
      }
```

## Support

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Reown Documentation](https://docs.reown.com)
- [Solana Documentation](https://docs.solana.com)
- [Docker Documentation](https://docs.docker.com)

## License

This workflow configuration is part of the Deployer-Gene project.
