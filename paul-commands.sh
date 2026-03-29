#!/bin/bash

# ============================================================================
# RALPH METHOD - QUICK EXECUTION COMMANDS
# ============================================================================

echo "🚀 Ralph Method - Quick Commands"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# MAIN COMMANDS
# ============================================================================

ralph_full_execution() {
    echo -e "${BLUE}Running Ralph Full Execution (Devnet → Mainnet)...${NC}"
    node scripts/ralph/ralph-full-execution.js
}

ralph_devnet_only() {
    echo -e "${BLUE}Running Devnet Deployment Only...${NC}"
    node scripts/ralph/devnet-deploy.js
}

ralph_mainnet_only() {
    echo -e "${BLUE}Running Mainnet Deployment Only...${NC}"
    node scripts/ralph/deploy-iteration-1.js
}

ralph_monitor() {
    echo -e "${BLUE}Starting Ralph Monitoring Dashboard...${NC}"
    node src/ralph/monitoring/agent-monitor.js
}

ralph_status() {
    echo -e "${GREEN}Ralph System Status:${NC}"
    echo ""
    echo "📊 Credentials:"
    node -e "require('dotenv').config({path:'.env.local'}); console.log('  Helius:', !!process.env.HELIUS_API_KEY ? '✓' : '✗'); console.log('  Supabase:', !!process.env.SUPABASE_URL ? '✓' : '✗'); console.log('  Biconomy:', !!process.env.BICONOMY_API_KEY ? '✓' : '✗'); console.log('  Jupiter:', !!process.env.JUPITER_LEND_EARN_PROGRAM ? '✓' : '✗');"
    echo ""
    echo "📁 Recent Executions:"
    ls -lht .cache/ralph/*.json 2>/dev/null | head -5 || echo "  No executions found"
}

ralph_view_report() {
    echo -e "${BLUE}Latest Execution Report:${NC}"
    LATEST=$(ls -t .cache/ralph/*.json 2>/dev/null | head -1)
    if [ -n "$LATEST" ]; then
        cat "$LATEST" | jq .
    else
        echo "No reports found"
    fi
}

ralph_help() {
    echo -e "${YELLOW}Ralph Method Commands:${NC}"
    echo ""
    echo "  ralph_full_execution    - Run full execution (devnet → mainnet)"
    echo "  ralph_devnet_only       - Run devnet validation only"
    echo "  ralph_mainnet_only      - Run mainnet deployment only"
    echo "  ralph_monitor           - Start monitoring dashboard"
    echo "  ralph_status            - Check system status"
    echo "  ralph_view_report       - View latest execution report"
    echo "  ralph_help              - Show this help"
    echo ""
    echo "Examples:"
    echo "  $ ralph_full_execution"
    echo "  $ ralph_monitor"
    echo "  $ ralph_status"
}

# ============================================================================
# MENU
# ============================================================================

show_menu() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     RALPH METHOD - QUICK MENU          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "1) Full Execution (Devnet → Mainnet)"
    echo "2) Devnet Only"
    echo "3) Mainnet Only"
    echo "4) Start Monitor"
    echo "5) Check Status"
    echo "6) View Latest Report"
    echo "7) Help"
    echo "8) Exit"
    echo ""
    read -p "Select option [1-8]: " choice
    
    case $choice in
        1) ralph_full_execution ;;
        2) ralph_devnet_only ;;
        3) ralph_mainnet_only ;;
        4) ralph_monitor ;;
        5) ralph_status ;;
        6) ralph_view_report ;;
        7) ralph_help ;;
        8) exit 0 ;;
        *) echo "Invalid option" ;;
    esac
}

# ============================================================================
# MAIN
# ============================================================================

if [ "$1" == "menu" ]; then
    while true; do
        show_menu
    done
elif [ "$1" == "help" ]; then
    ralph_help
elif [ "$1" == "status" ]; then
    ralph_status
elif [ "$1" == "full" ]; then
    ralph_full_execution
elif [ "$1" == "devnet" ]; then
    ralph_devnet_only
elif [ "$1" == "mainnet" ]; then
    ralph_mainnet_only
elif [ "$1" == "monitor" ]; then
    ralph_monitor
elif [ "$1" == "report" ]; then
    ralph_view_report
else
    ralph_help
    echo ""
    echo "Usage: ./ralph-commands.sh [menu|help|status|full|devnet|mainnet|monitor|report]"
fi
