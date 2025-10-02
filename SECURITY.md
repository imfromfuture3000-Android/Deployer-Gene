# 🔒 SECURITY GUIDELINES

## 🚨 CRITICAL SECURITY WARNINGS

### ⚠️ NEVER COMMIT THESE FILES:
- `.env` files containing real credentials
- Private keys or wallet files
- API keys or secrets
- Real wallet addresses in production

### 🛡️ PROTECTED BY .GITIGNORE:
- All `.env*` files
- Private keys (`*.key`, `*.pem`)
- Wallet files (`wallet.json`, `keypair.json`)
- API credentials and tokens
- Cache and temporary files

## 🔐 SECURE PRACTICES

### ✅ DO:
- Use GitHub Secrets for production deployment
- Use `.env.example` as template (safe example values only)
- Store real credentials in secure environment variables
- Use hardware wallets for high-value operations
- Enable 2FA on all accounts
- Regularly rotate API keys

### ❌ DON'T:
- Commit `.env` files to version control
- Share private keys in chat/email
- Use production keys in development
- Store credentials in code comments
- Push sensitive data to public repositories

## 🔑 ENVIRONMENT VARIABLES

### Safe for Repository:
- Program IDs (public)
- Network endpoints (public)
- Configuration flags (non-sensitive)

### NEVER in Repository:
- `DEPLOYER_PRIVATE_KEY`
- `HELIUS_API_KEY`
- `RELAYER_API_KEY`
- Real wallet addresses
- Any private credentials

## 🛠️ SETUP SECURITY

1. **Copy template**: `cp .env.example .env`
2. **Fill real values**: Edit `.env` with actual credentials
3. **Verify .gitignore**: Ensure `.env` is ignored
4. **Use GitHub Secrets**: For production deployment
5. **Test locally**: Verify everything works before deployment

## 🚨 INCIDENT RESPONSE

If credentials are accidentally committed:
1. **Immediately rotate** all exposed keys
2. **Remove from git history** using `git filter-branch`
3. **Update GitHub Secrets** with new credentials
4. **Monitor accounts** for unauthorized access
5. **Review access logs** for suspicious activity

## 📞 SECURITY CONTACT

For security issues or questions:
- Create private GitHub issue
- Follow responsible disclosure
- Do not share vulnerabilities publicly

---

**🔒 Security is everyone's responsibility. When in doubt, ask!**