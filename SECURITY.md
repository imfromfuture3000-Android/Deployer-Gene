# Security Best Practices for Omega Prime Deployer

## Overview

This document outlines security best practices and guidelines for the Omega Prime Deployer project to prevent secrets leakage and maintain security standards.

## 🔒 Environment Variable Security

### Required Environment Variables

Create a `.env` file based on `.env.sample` with the following variables:

```bash
# Never commit your actual API keys or private information
HELIUS_API_KEY=your_actual_helius_api_key_here
SOURCE_WALLET_ADDRESS=your_source_wallet_address
TARGET_WALLET_ADDRESS=your_target_wallet_address
TREASURY_PUBKEY=your_treasury_public_key
```

### Security Guidelines

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Use environment variables** instead of hardcoded values
3. **Rotate API keys regularly** 
4. **Use separate keys** for development and production
5. **Enable DRY_RUN=true** for testing

## 🛡️ Private Key Management

### DO NOT:
- ❌ Hardcode private keys in source code
- ❌ Commit private keys to version control
- ❌ Share private keys in chat or email
- ❌ Store private keys in plain text files

### DO:
- ✅ Use secure key management systems
- ✅ Store private keys in encrypted form
- ✅ Use hardware wallets for production
- ✅ Use environment variables for key file paths
- ✅ Enable 2FA on all accounts

## 🔍 Security Scanning

This repository includes automated security scanning:

### GitHub Security Features
- **Dependabot** - Automatic dependency updates
- **CodeQL** - Static analysis for vulnerabilities
- **Secret Scanning** - Detects committed secrets
- **Security Advisories** - CVE monitoring

### Additional Security Tools
- **Gitleaks** - Detects secrets in git history
- **Semgrep** - SAST security analysis
- **TruffleHog** - Secret detection
- **Snyk** - Dependency vulnerability scanning

## 📋 Security Checklist

Before deploying:

- [ ] All environment variables properly configured
- [ ] No hardcoded secrets in code
- [ ] DRY_RUN enabled for testing
- [ ] Security scans passing
- [ ] Dependencies updated
- [ ] Private keys secured
- [ ] API keys rotated if compromised

## 🚨 Incident Response

If secrets are accidentally committed:

1. **Immediately rotate** all exposed credentials
2. **Remove secrets** from git history using BFG Repo-Cleaner
3. **Force push** the cleaned history
4. **Update** all team members
5. **Review** access logs for unauthorized usage

## 📞 Security Contacts

For security issues or questions:
- Create a private security advisory on GitHub
- Contact repository maintainers directly
- Use encrypted communication channels

## 🔄 Regular Security Maintenance

- Review and rotate API keys monthly
- Update dependencies weekly (automated via Dependabot)
- Conduct security reviews before major releases
- Monitor security advisories and CVEs
- Test backup and recovery procedures

## 🎯 Compliance

This project follows:
- OWASP Top 10 security guidelines
- GitHub security best practices
- Solana development security standards
- Industry standard secret management practices