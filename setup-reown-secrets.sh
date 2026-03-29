#!/bin/bash

###############################################################################
# Reown App Build - GitHub Secrets Setup Script
# 
# This script helps set up GitHub secrets for the Reown build workflow
# Usage: bash setup-reown-secrets.sh
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_OWNER=""
REPO_NAME=""

# Functions
print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed"
        echo "Install from: https://cli.github.com"
        exit 1
    fi
    print_success "GitHub CLI found: $(gh --version)"
}

check_gh_auth() {
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub CLI"
        echo "Run: gh auth login"
        exit 1
    fi
    print_success "Authenticated with GitHub"
}

get_repo_info() {
    print_info "Detecting repository information..."
    
    # Try to get repo info from git
    if [ -d ".git" ]; then
        local remote_url=$(git config --get remote.origin.url)
        
        # Extract owner and repo from URL
        if [[ $remote_url =~ github.com[:/](.+)/(.+?)(.git)?$ ]]; then
            REPO_OWNER="${BASH_REMATCH[1]}"
            REPO_NAME="${BASH_REMATCH[2]%%.git}"
        fi
    fi
    
    # Prompt if not detected
    if [ -z "$REPO_OWNER" ] || [ -z "$REPO_NAME" ]; then
        read -p "GitHub repository owner: " REPO_OWNER
        read -p "GitHub repository name: " REPO_NAME
    fi
    
    print_success "Repository: $REPO_OWNER/$REPO_NAME"
}

prompt_secret() {
    local secret_name=$1
    local prompt_text=$2
    local default_value=$3
    local is_sensitive=$4
    
    echo -e "\n${YELLOW}➜ $secret_name${NC}"
    echo "   $prompt_text"
    
    if [ -n "$default_value" ]; then
        echo -e "   ${BLUE}(default: $default_value)${NC}"
    fi
    
    if [ "$is_sensitive" = "true" ]; then
        echo "   ${RED}[SENSITIVE - Will not be echoed]${NC}"
        read -s -p "   Value: " secret_value
        echo
    else
        read -p "   Value: " secret_value
    fi
    
    if [ -z "$secret_value" ] && [ -n "$default_value" ]; then
        secret_value="$default_value"
    fi
    
    echo "$secret_value"
}

set_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if [ -z "$secret_value" ]; then
        print_warning "Skipping $secret_name (empty value)"
        return
    fi
    
    print_info "Setting $secret_name..."
    
    echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO_OWNER/$REPO_NAME"
    
    if [ $? -eq 0 ]; then
        print_success "Set $secret_name"
    else
        print_error "Failed to set $secret_name"
        return 1
    fi
}

show_secrets() {
    print_info "Listing configured secrets..."
    gh secret list --repo "$REPO_OWNER/$REPO_NAME"
}

# Main workflow
main() {
    print_header "Reown App - GitHub Secrets Setup"
    
    check_gh_cli
    check_gh_auth
    get_repo_info
    
    # Confirm before proceeding
    echo -e "\n${YELLOW}This will set the following secrets in your repository:${NC}"
    echo "  • REOWN_PROJECT_ID"
    echo "  • REOWN_SECRET_KEY"
    echo "  • SOLANA_RPC_URL"
    echo "  • ALCHEMY_API_KEY"
    echo "  • HELIUS_API_KEY"
    echo "  • DEPLOYER_KEYPAIR"
    echo "  • TREASURY_PUBKEY"
    echo "  • APP_URL"
    echo "  • API_URL"
    echo "  • ENABLE_WALLET_CONNECT"
    echo "  • ENABLE_ANALYTICS"
    echo "  • SNYK_TOKEN"
    
    read -p "Continue? (y/N) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Setup cancelled"
        exit 0
    fi
    
    # Reown Configuration
    print_header "Reown Configuration"
    
    REOWN_PROJECT_ID=$(prompt_secret "REOWN_PROJECT_ID" \
        "Your Reown project ID from https://cloud.reown.com" "" "false")
    
    REOWN_SECRET_KEY=$(prompt_secret "REOWN_SECRET_KEY" \
        "Your Reown secret key (from Settings > API Keys)" "" "true")
    
    # Solana Configuration
    print_header "Solana Configuration"
    
    SOLANA_RPC_URL=$(prompt_secret "SOLANA_RPC_URL" \
        "Solana RPC endpoint URL" "https://api.devnet.solana.com" "false")
    
    SOLANA_NETWORK=$(prompt_secret "SOLANA_NETWORK" \
        "Network: devnet, testnet, or mainnet-beta" "devnet" "false")
    
    # API Keys
    print_header "Optional API Keys"
    
    ALCHEMY_API_KEY=$(prompt_secret "ALCHEMY_API_KEY" \
        "Alchemy API key (optional)" "" "true")
    
    HELIUS_API_KEY=$(prompt_secret "HELIUS_API_KEY" \
        "Helius API key (optional)" "" "true")
    
    # Wallet Configuration
    print_header "Wallet & Authority"
    
    DEPLOYER_KEYPAIR=$(prompt_secret "DEPLOYER_KEYPAIR" \
        "Deployer keypair (Base58 encoded - KEEP SECRET)" "" "true")
    
    TREASURY_PUBKEY=$(prompt_secret "TREASURY_PUBKEY" \
        "Treasury public address" "" "false")
    
    # App URLs
    print_header "Application URLs"
    
    APP_URL=$(prompt_secret "APP_URL" \
        "App frontend URL" "http://localhost:3000" "false")
    
    API_URL=$(prompt_secret "API_URL" \
        "API backend URL" "http://localhost:3001" "false")
    
    # Feature Flags
    print_header "Feature Flags"
    
    ENABLE_WALLET_CONNECT=$(prompt_secret "ENABLE_WALLET_CONNECT" \
        "Enable WalletConnect integration (true/false)" "true" "false")
    
    ENABLE_ANALYTICS=$(prompt_secret "ENABLE_ANALYTICS" \
        "Enable analytics tracking (true/false)" "true" "false")
    
    # Security (Optional)
    print_header "Security Scanning (Optional)"
    
    SNYK_TOKEN=$(prompt_secret "SNYK_TOKEN" \
        "Snyk API token for security scanning (optional)" "" "true")
    
    # Set secrets
    print_header "Setting Secrets"
    
    set_secret "REOWN_PROJECT_ID" "$REOWN_PROJECT_ID"
    set_secret "REOWN_SECRET_KEY" "$REOWN_SECRET_KEY"
    set_secret "SOLANA_RPC_URL" "$SOLANA_RPC_URL"
    set_secret "SOLANA_NETWORK" "$SOLANA_NETWORK"
    set_secret "ALCHEMY_API_KEY" "$ALCHEMY_API_KEY"
    set_secret "HELIUS_API_KEY" "$HELIUS_API_KEY"
    set_secret "DEPLOYER_KEYPAIR" "$DEPLOYER_KEYPAIR"
    set_secret "TREASURY_PUBKEY" "$TREASURY_PUBKEY"
    set_secret "APP_URL" "$APP_URL"
    set_secret "API_URL" "$API_URL"
    set_secret "ENABLE_WALLET_CONNECT" "$ENABLE_WALLET_CONNECT"
    set_secret "ENABLE_ANALYTICS" "$ENABLE_ANALYTICS"
    set_secret "SNYK_TOKEN" "$SNYK_TOKEN"
    
    # Summary
    print_header "Setup Complete"
    
    echo "✅ Secrets have been configured!"
    echo
    echo "Next steps:"
    echo "  1. Verify secrets in GitHub repository settings"
    echo "  2. Update your build configuration if needed"
    echo "  3. Push code and trigger workflow"
    echo
    echo "View secrets:"
    read -p "Show configured secrets now? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        show_secrets
    fi
    
    echo
    print_success "GitHub Secrets setup complete!"
    echo "Repository: $REPO_OWNER/$REPO_NAME"
    echo "Documentation: .github/REOWN_BUILD_SETUP.md"
}

# Run main
main "$@"
