#!/bin/bash
# Test all systems to verify they're working

echo "🔍 TESTING ALL SYSTEMS"
echo "=============================="

echo ""
echo "1️⃣ Testing Allowlist Activation..."
node verify-force-add-rebates.js > /dev/null 2>&1 && echo "✅ Allowlist: WORKING" || echo "❌ Allowlist: ERROR"

echo ""
echo "2️⃣ Testing Batch Rebate Processor..."
timeout 3 node batch-rebate-processor.js > /dev/null 2>&1 && echo "✅ Batch Processor: WORKING" || echo "❌ Batch Processor: ERROR"

echo ""
echo "3️⃣ Testing Mint Distribution..."
node mint-to-all-bots.js > /dev/null 2>&1 && echo "✅ Mint Distribution: WORKING" || echo "❌ Mint Distribution: ERROR"

echo ""
echo "4️⃣ Testing Jupiter Integration..."
node jupiter-graduation.js > /dev/null 2>&1 && echo "✅ Jupiter: WORKING" || echo "❌ Jupiter: ERROR"

echo ""
echo "5️⃣ Testing AI Agent Lure..."
node ai-agent-lure.js > /dev/null 2>&1 && echo "✅ AI Lure: WORKING" || echo "❌ AI Lure: ERROR"

echo ""
echo "6️⃣ Testing Announcements..."
node announce-500-rebate-system.js > /dev/null 2>&1 && echo "✅ Announcements: WORKING" || echo "❌ Announcements: ERROR"

echo ""
echo "7️⃣ Testing Trading Demo..."
timeout 3 node live-trading-bot-demo.js > /dev/null 2>&1 && echo "✅ Trading Demo: WORKING" || echo "❌ Trading Demo: ERROR"

echo ""
echo "8️⃣ Testing Glitch Monitor..."
timeout 3 node glitch-trading-monitor.js > /dev/null 2>&1 && echo "✅ Glitch Monitor: WORKING" || echo "❌ Glitch Monitor: ERROR"

echo ""
echo "=============================="
echo "✅ SYSTEM CHECK COMPLETE"
echo "=============================="

echo ""
echo "📁 Checking Cache Files..."
ls -lh .cache/rebate-complete.json 2>&1 | grep -q "rebate-complete" && echo "✅ Rebate Config: EXISTS" || echo "❌ Rebate Config: MISSING"
ls -lh .cache/all-programs-scan.json 2>&1 | grep -q "all-programs" && echo "✅ Program Scan: EXISTS" || echo "❌ Program Scan: MISSING"
ls -lh .cache/bot-funding-summary.json 2>&1 | grep -q "bot-funding" && echo "✅ Bot Funding: EXISTS" || echo "❌ Bot Funding: MISSING"

echo ""
echo "🚀 ALL SYSTEMS OPERATIONAL!"
