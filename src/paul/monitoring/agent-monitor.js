#!/usr/bin/env node

/**
 * RALPH AGENT BOT - REAL-TIME MONITORING DASHBOARD
 * 
 * Monitors Ralph Agent Bot operations:
 * - Strategy execution status
 * - Portfolio performance
 * - Transaction history
 * - Risk metrics
 * - Supabase sync status
 * - Jupiter Lend vaults
 * 
 * Usage:
 *   node src/ralph/monitoring/agent-monitor.js
 * 
 * Output:
 *   - Real-time console dashboard
 *   - Exports to Supabase
 *   - Health checks every 30 seconds
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const CloudAIAgent = require('./cloud-ai-agent');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

class AgentMonitor {
  constructor() {
    this.enabled = process.env.RALPH_ENABLED === 'true';
    this.network = process.env.RALPH_NETWORK || 'solana-mainnet';
    this.updateInterval = this.parseInterval(process.env.RALPH_UPDATE_INTERVAL || '1h');
    
    // Initialize Supabase
    this.supabase = null;
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseKey = process.env.SUPABASE_SECRET_KEY;
    
    // Initialize AI Agent
    this.aiAgent = new CloudAIAgent({
      provider: process.env.AI_PROVIDER || 'ollama',
      ollamaUrl: process.env.OLLAMA_URL,
      ollamaModel: process.env.OLLAMA_MODEL,
      claudeKey: process.env.ANTHROPIC_API_KEY
    });

    this.stats = {
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      health: 'initializing',
      strategies: {},
      portfolio: {},
      transactions: {
        total: 0,
        successful: 0,
        failed: 0,
      },
      errors: [],
      warnings: [],
      aiAnalysis: null,
    };

    this.COLORS = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      bold: '\x1b[1m',
    };
  }

  parseInterval(interval) {
    const match = interval.match(/^(\d+)([hms])$/);
    if (!match) return 3600000; // Default 1h
    const [, value, unit] = match;
    const multipliers = { h: 3600000, m: 60000, s: 1000 };
    return parseInt(value) * multipliers[unit];
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const colors = {
      INFO: this.COLORS.cyan,
      WARN: this.COLORS.yellow,
      ERROR: this.COLORS.red,
      SUCCESS: this.COLORS.green,
    };
    const color = colors[level] || this.COLORS.reset;
    console.log(`${color}[${timestamp}] ${level}${this.COLORS.reset}: ${message}`);
  }

  color(text, colorKey) {
    return `${this.COLORS[colorKey]}${text}${this.COLORS.reset}`;
  }

  async initializeSupabase() {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) {
        this.log('⚠️  Supabase not configured', 'WARN');
        return false;
      }

      this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
      
      // Test connection
      const { data, error } = await this.supabase
        .from('empires')
        .select('id')
        .limit(1);

      if (error) {
        this.log(`❌ Supabase connection failed: ${error.message}`, 'ERROR');
        this.stats.errors.push(`Supabase: ${error.message}`);
        return false;
      }

      this.log('✅ Supabase connected', 'SUCCESS');
      this.stats.supabaseConnected = true;
      return true;
    } catch (error) {
      this.log(`❌ Failed to initialize Supabase: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async getPortfolioMetrics() {
    if (!this.supabase) return null;

    try {
      // Fetch empires
      const { data: empires, error: e1 } = await this.supabase
        .from('empires')
        .select('*')
        .eq('status', 'active');

      // Fetch vaults
      const { data: vaults, error: e2 } = await this.supabase
        .from('vaults')
        .select('*');

      // Fetch yield records
      const { data: yields, error: e3 } = await this.supabase
        .from('yields')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (e1 || e2 || e3) {
        const errorMsg = (e1 || e2 || e3).message;
        this.log(`⚠️  Failed to fetch metrics: ${errorMsg}`, 'WARN');
        return null;
      }

      return {
        empires: empires || [],
        vaults: vaults || [],
        recentYields: yields || [],
        totalEmpires: (empires || []).length,
        activeVaults: (vaults || []).filter(v => v.status === 'active').length,
      };
    } catch (error) {
      this.log(`❌ Portfolio metrics error: ${error.message}`, 'ERROR');
      return null;
    }
  }

  async getStrategyStatus() {
    return {
      yieldHarvester: {
        enabled: process.env.YIELD_HARVESTER_ENABLED === 'true',
        frequency: process.env.YIELD_HARVESTER_FREQUENCY,
        minAPY: process.env.YIELD_MIN_APY,
      },
      signalSeeker: {
        enabled: process.env.SIGNAL_SEEKER_ENABLED === 'true',
        frequency: process.env.SIGNAL_SEEKER_FREQUENCY,
        minSentiment: process.env.SIGNAL_MIN_SENTIMENT,
      },
      liquiditySniffer: {
        enabled: process.env.LIQUIDITY_SNIFFER_ENABLED === 'true',
        maxRisk: process.env.LIQUIDITY_SNIPER_MAX_RISK,
      },
      zkFarmer: {
        enabled: process.env.ZK_FARMER_ENABLED === 'true',
        frequency: process.env.ZK_FARMER_FREQUENCY,
      },
      beliefRewrite: {
        enabled: process.env.BELIEF_REWRITE_ENABLED === 'true',
        frequency: process.env.BELIEF_REWRITE_FREQUENCY,
      },
    };
  }

  async getRiskMetrics() {
    return {
      maxPositionSize: process.env.RALPH_MAX_POSITION_SIZE,
      maxLeverage: process.env.RALPH_MAX_LEVERAGE,
      minBalance: process.env.RALPH_MIN_BALANCE,
      maxDailyLoss: process.env.RALPH_MAX_DAILY_LOSS,
      stopLoss: process.env.RALPH_STOP_LOSS,
    };
  }

  printDashboard(metrics, strategies, risks) {
    console.clear();
    
    // Header
    console.log(this.color('╔════════════════════════════════════════════════════════════════╗', 'bold'));
    console.log(this.color('║          RALPH AGENT BOT - MONITORING DASHBOARD                ║', 'bold'));
    console.log(this.color('╚════════════════════════════════════════════════════════════════╝', 'bold'));

    // System Status
    console.log(`\n${this.color('📊 SYSTEM STATUS', 'blue')}`);
    console.log(`   Network: ${this.color(this.network, 'cyan')}`);
    console.log(`   Status: ${this.stats.health === 'healthy' ? this.color('🟢 HEALTHY', 'green') : this.color('🟡 INITIALIZING', 'yellow')}`);
    console.log(`   Start Time: ${this.stats.startTime}`);
    console.log(`   Uptime: ${this.getUptime()}`);

    // Supabase Status
    console.log(`\n${this.color('🔗 SUPABASE CONNECTION', 'blue')}`);
    if (this.stats.supabaseConnected) {
      console.log(this.color('   ✅ Connected', 'green'));
    } else {
      console.log(this.color('   ❌ Disconnected', 'red'));
    }

    // Portfolio Metrics
    if (metrics) {
      console.log(`\n${this.color('💼 PORTFOLIO METRICS', 'blue')}`);
      console.log(`   Active Empires: ${this.color(metrics.totalEmpires.toString(), 'cyan')}`);
      console.log(`   Jupiter Vaults: ${this.color(metrics.activeVaults.toString(), 'cyan')}`);
      console.log(`   Recent Yields: ${metrics.recentYields.length}`);
    }

    // Strategy Status
    console.log(`\n${this.color('⚙️  STRATEGY STATUS', 'blue')}`);
    Object.entries(strategies).forEach(([name, config]) => {
      const status = config.enabled 
        ? this.color('✅ ENABLED', 'green') 
        : this.color('⏸️  DISABLED', 'yellow');
      console.log(`   ${name}: ${status}`);
      if (config.frequency) {
        console.log(`      └─ Frequency: ${config.frequency}`);
      }
    });

    // Risk Management
    console.log(`\n${this.color('⚠️  RISK MANAGEMENT', 'blue')}`);
    console.log(`   Max Position Size: ${this.color(risks.maxPositionSize, 'cyan')} SOL`);
    console.log(`   Max Leverage: ${this.color(risks.maxLeverage, 'cyan')}x`);
    console.log(`   Min Balance: ${this.color(risks.minBalance, 'cyan')} SOL`);
    console.log(`   Max Daily Loss: ${this.color(risks.maxDailyLoss, 'cyan')} (${(risks.maxDailyLoss * 100).toFixed(1)}%)`);
    console.log(`   Stop Loss: ${this.color(risks.stopLoss, 'cyan')} (${(risks.stopLoss * 100).toFixed(1)}%)`);

    // Transaction Stats
    console.log(`\n${this.color('📈 TRANSACTION STATS', 'blue')}`);
    console.log(`   Total: ${this.stats.transactions.total}`);
    console.log(`   Successful: ${this.color(this.stats.transactions.successful.toString(), 'green')}`);
    console.log(`   Failed: ${this.color(this.stats.transactions.failed.toString(), 'red')}`);

    // Error Log
    if (this.stats.errors.length > 0) {
      console.log(`\n${this.color('❌ RECENT ERRORS', 'red')}`);
      this.stats.errors.slice(-5).forEach(err => {
        console.log(`   - ${err}`);
      });
    }

    // Footer
    console.log(`\n${this.color('Last Update: ' + new Date().toLocaleTimeString(), 'cyan')}`);
    console.log(this.color('Press Ctrl+C to exit', 'yellow'));
  }

  async runAIAnalysis(metrics) {
    try {
      this.log('🤖 Running AI analysis...', 'INFO');
      const analysis = await this.aiAgent.analyzePortfolio(metrics);
      this.stats.aiAnalysis = {
        timestamp: new Date().toISOString(),
        result: analysis,
        provider: this.aiAgent.provider
      };
      this.log('✅ AI analysis complete', 'SUCCESS');
    } catch (error) {
      this.log(`⚠️  AI analysis failed: ${error.message}`, 'WARN');
      this.stats.aiAnalysis = { error: error.message };
    }
  }

  getUptime() {
    const start = new Date(this.stats.startTime);
    const now = new Date();
    const ms = now - start;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  async monitor() {
    this.log('='.repeat(70), 'INFO');
    this.log('Starting Ralph Agent Bot Monitoring Dashboard', 'INFO');
    this.log('='.repeat(70), 'INFO');

    // Initialize Supabase
    await this.initializeSupabase();

    // Get initial strategies and risks
    const strategies = await this.getStrategyStatus();
    const risks = await this.getRiskMetrics();

    // Update loop
    setInterval(async () => {
      try {
        const metrics = await this.getPortfolioMetrics();
        
        if (metrics) {
          this.stats.health = 'healthy';
        }

        this.stats.lastUpdate = new Date().toISOString();
        this.printDashboard(metrics, strategies, risks);
      } catch (error) {
        this.log(`Dashboard error: ${error.message}`, 'ERROR');
      }
    }, 5000); // Update every 5 seconds

    // Initial render
    const metrics = await this.getPortfolioMetrics();
    this.printDashboard(metrics, strategies, risks);
  }
}

// ============================================================================
// RUN MONITORING
// ============================================================================

const monitor = new AgentMonitor();
monitor.monitor().catch(console.error);
