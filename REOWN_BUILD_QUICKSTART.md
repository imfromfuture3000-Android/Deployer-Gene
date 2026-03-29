# Reown App Build Workflow - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Copy Environment Template
```bash
cp .env.reown.example .env.local
# Edit .env.local with your actual values
```

### Step 2: Set GitHub Secrets
```bash
# Make script executable
chmod +x setup-reown-secrets.sh

# Run interactive setup
bash setup-reown-secrets.sh
```

The script will prompt you for:
- ✅ Reown Project ID & Secret Key
- ✅ Solana RPC URL
- ✅ API Keys (Alchemy, Helius)
- ✅ Deployer Keypair
- ✅ Treasury Address
- ✅ App URLs
- ✅ Feature Flags

### Step 3: Verify Setup
```bash
# Check GitHub secrets were created
gh secret list --repo YOUR_OWNER/YOUR_REPO
```

### Step 4: Trigger Workflow
Push code to trigger automatic build:
```bash
git add .
git commit -m "feat: initial setup"
git push origin main
```

Or trigger manually:
1. Go to **Actions** tab on GitHub
2. Select **"Build Reown App"**
3. Click **"Run workflow"**
4. Select environment and branch
5. Click **"Run workflow"**

## 📋 Essential Secrets Required

| Secret | Where to Get | Example |
|--------|--------------|---------|
| `REOWN_PROJECT_ID` | https://cloud.reown.com | `your_project_id` |
| `REOWN_SECRET_KEY` | https://cloud.reown.com/settings | `sk_live_xxx...` |
| `SOLANA_RPC_URL` | See docs | `https://api.devnet.solana.com` |
| `DEPLOYER_KEYPAIR` | `solana-keygen new` | Base58 encoded |
| `TREASURY_PUBKEY` | Your wallet address | 44-char base58 |

## 🔍 View Build Status

### GitHub Actions UI
1. Go to **Actions** tab
2. Select latest workflow run
3. View logs for each job

### Command Line
```bash
# List recent workflow runs
gh run list --repo YOUR_OWNER/YOUR_REPO

# View specific run logs
gh run view <run-id> --repo YOUR_OWNER/YOUR_REPO

# Download artifacts
gh run download <run-id> --repo YOUR_OWNER/YOUR_REPO --dir ./artifacts
```

## 🐳 Build Artifacts

The workflow produces:

```
├── Build Outputs
│   ├── .next/          # Next.js build
│   ├── dist/           # Distribution build
│   └── build/          # Alternative build output
├── Coverage
│   └── coverage/       # Test coverage reports
├── Security
│   ├── sbom.json       # Software Bill of Materials
│   ├── trivy-results.sarif
│   └── snyk.sarif
└── Reports
    ├── build-report.md
    └── test-results
```

Download via GitHub UI or CLI:
```bash
gh run download <run-id> --repo YOUR_OWNER/YOUR_REPO --dir ./artifacts
```

## 🔐 Security Features

The workflow includes:

- ✅ **Trivy**: Container/filesystem vulnerability scanning
- ✅ **Gitleaks**: Detects exposed secrets in code
- ✅ **npm audit**: Checks for vulnerable dependencies
- ✅ **Snyk**: Advanced security scanning (optional)
- ✅ **Code analysis**: ESLint/prettier
- ✅ **SBOM generation**: Software Bill of Materials

All results available in GitHub Security tab.

## 📝 Workflow Triggers

The workflow runs on:

| Trigger | When | Branch |
|---------|------|--------|
| **Push** | Code pushed | main, develop |
| **PR** | Pull request created | main, develop |
| **Manual** | Workflow dispatch | Any |

## 🔧 Customize for Your App

### Add build scripts
Edit `package.json`:
```json
{
  "scripts": {
    "build": "next build",
    "lint": "eslint .",
    "test": "jest"
  }
}
```

### Add Docker support
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Configure environments
Create GitHub Environments:
1. Settings → Environments → New environment
2. Name: `production`
3. Add deployment protection rules
4. Set environment-specific secrets

## ⚠️ Troubleshooting

### Build fails: "Missing required environment variables"
```bash
# Check secrets are set
gh secret list --repo YOUR_OWNER/YOUR_REPO

# Add missing secret
gh secret set SECRET_NAME --repo YOUR_OWNER/YOUR_REPO
```

### Docker build fails: "Dockerfile not found"
The workflow skips Docker if no `Dockerfile` exists. Create one if needed.

### Security scan failures
Review in GitHub Security tab:
1. Settings → Security & analysis
2. Check for security alerts
3. Update vulnerable dependencies

### Workflow timeout
Default: 30 minutes. Adjust in workflow:
```yaml
timeout-minutes: 45
```

## 📚 Full Documentation

- Detailed setup guide: [`.github/REOWN_BUILD_SETUP.md`](.github/REOWN_BUILD_SETUP.md)
- Environment variables: [`.env.reown.example`](.env.reown.example)
- Workflow definition: [`.github/workflows/reown-build.yml`](.github/workflows/reown-build.yml)

## 🌐 External Resources

- [Reown Docs](https://docs.reown.com)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Solana Docs](https://docs.solana.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Docker Docs](https://docs.docker.com)

## 💡 Pro Tips

### 1. Use environments for different stages
```bash
# Development
gh secret set MY_SECRET --env development --repo owner/repo

# Staging  
gh secret set MY_SECRET --env staging --repo owner/repo

# Production (requires approval)
gh secret set MY_SECRET --env production --repo owner/repo
```

### 2. Monitor with notifications
Add to workflow for Slack alerts:
```yaml
- name: Slack Notification
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {"text": "Build ${{ job.status }}"}
```

### 3. Deploy automatically
Add deployment step:
```yaml
- name: Deploy
  run: npm run deploy
  env:
    DEPLOYMENT_KEY: ${{ secrets.DEPLOYMENT_KEY }}
```

### 4. Skip workflow on certain commits
```bash
git commit -m "docs: update readme [skip ci]"
```

## ✅ Checklist

- [ ] Fork/clone repository
- [ ] Copy `.env.reown.example` → `.env.local`
- [ ] Fill in environment values
- [ ] Run `setup-reown-secrets.sh`
- [ ] Verify secrets with `gh secret list`
- [ ] Push code to trigger workflow
- [ ] Check Actions tab for results
- [ ] Review artifacts and reports
- [ ] Configure GitHub Environments (optional)
- [ ] Set up Slack notifications (optional)

## 🎯 Next Steps

1. **Local Development**
   ```bash
   npm install
   npm run dev  # Runs on http://localhost:3000
   ```

2. **Run Workflow Locally** (optional)
   ```bash
   # Install act: https://github.com/nektos/act
   act -j build
   ```

3. **Set Up CD Pipeline**
   - Add deployment job to workflow
   - Configure production environment
   - Set up approval requirements

4. **Monitor & Maintain**
   - Review security alerts weekly
   - Update dependencies monthly
   - Rotate secrets every 6 months
   - Monitor build times and failures

## 📞 Support

For issues or questions:
1. Check [`.github/REOWN_BUILD_SETUP.md`](.github/REOWN_BUILD_SETUP.md) troubleshooting section
2. Review workflow logs in Actions tab
3. Check GitHub Discussions/Issues
4. Reference Reown and Solana documentation

---

**Happy building! 🚀**

Workflow created: 2026-02-02
Last updated: 2026-02-02
