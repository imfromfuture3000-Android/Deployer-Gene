/**
 * RALPH AGENT BOT - UNIFIED INITIALIZATION
 * Bootstraps all Ralph services and strategies
 * 
 * Initialized Services:
 * 1. Helius Pagination Client (data fetching)
 * 2. Yield Harvester (APY optimization)
 * 3. Cross-Chain Rebate System (treasury management)
 * 4. Portfolio tracker (holdings & performance)
 * 5. Event emission (monitoring & alerts)
 */

require('dotenv').config({ path: '/workspaces/Deployer-Gene/.env.local' });

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

const HeliusPaginationClient = require('./src/ralph/integrations/helius-pagination');
const YieldHarvesterHelius = require('./src/ralph/strategies/yield-harvester-helius');
const CrossChainRebateSystem = require('./src/ralph/integrations/cross-chain-rebate');

class RalphAgentBot extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.version = '1.0';
    this.startTime = Date.now();
    this.environment = config.environment || process.env.NODE_ENV || 'development';
    this.network = config.network || 'solana-mainnet';
    
    // Configuration
    this.config = {
      debug: config.debug || process.env.RALPH_DEBUG === 'true',
      logDir: config.logDir || process.env.RALPH_LOG_DIR || './logs/ralph',
      cacheDir: config.cacheDir || process.env.RALPH_CACHE_DIR || './.cache',
      updateInterval: config.updateInterval || '1h',
      ...config
    };

    // State
    this.state = {
      initialized: false,
      services: {},
      strategies: {
        yieldHarvester: false,
        signalSeeker: false,
        liquiditySniffer: false,
        zkFarmer: false,
        beliefRewrite: false
      },
      lastUpdate: null,
      uptime: 0
    };

    // Portfolio
    this.portfolio = {
      holdings: [],
      balances: {},
      totalValue: 0,
      lastUpdated: null
    };

    // Stats
    this.stats = {
      startTime: Date.now(),
      operationsCount: 0,
      errorsCount: 0,
      successRate: 0
    };

    // Create directories
    this.initializeDirs();
  }

  /**
   * CREATE REQUIRED DIRECTORIES
   */
  initializeDirs() {
    const dirs = [this.config.logDir, this.config.cacheDir, 'src/ralph/state'];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log('info', `Created directory: ${dir}`);
      }
    }
  }

  /**
   * INITIALIZE ALL SERVICES
   */
  async initialize() {
    try {
      this.log('info', '🚀 Initializing Ralph Agent Bot v' + this.version);

      // Step 1: Initialize Helius Pagination Client
      this.log('info', '1️⃣  Initializing Helius Pagination Client...');
      await this.initializeHelius();

      // Step 2: Initialize Yield Harvester
      this.log('info', '2️⃣  Initializing Yield Harvester...');
      await this.initializeYieldHarvester();

      // Step 3: Initialize Cross-Chain Rebate System
      this.log('info', '3️⃣  Initializing Cross-Chain Rebate System...');
      await this.initializeRebateSystem();

      // Step 4: Load state
      this.log('info', '4️⃣  Loading portfolio state...');
      this.loadState();

      // Step 5: Verify configuration
      this.log('info', '5️⃣  Verifying configuration...');
      await this.verifyConfiguration();

      this.state.initialized = true;
      this.log('success', '✅ Ralph Agent Bot initialized successfully');
      this.emit('initialized', { version: this.version, network: this.network });

      return true;
    } catch (error) {
      this.log('error', '❌ Initialization failed: ' + error.message);
      this.emit('error', { phase: 'initialization', error });
      throw error;
    }
  }

  /**
   * INITIALIZE HELIUS PAGINATION CLIENT
   */
  async initializeHelius() {
    try {
      if (!process.env.HELIUS_API_KEY) {
        throw new Error('HELIUS_API_KEY not found in .env.local');
      }

      this.services.helius = new HeliusPaginationClient({
        apiKey: process.env.HELIUS_API_KEY,
        baseUrl: process.env.HELIUS_BASE_URL || 'https://api.helius.xyz/v0',
        rpcUrl: process.env.HELIUS_RPC,
        rateLimit: parseInt(process.env.HELIUS_RATE_LIMIT) || 50,
        maxRetries: parseInt(process.env.HELIUS_MAX_RETRIES) || 3,
        defaultLimit: parseInt(process.env.HELIUS_DEFAULT_LIMIT) || 100,
        debug: this.config.debug
      });

      // Attach event listeners
      this.services.helius.on('log', ({ level, message, data }) => {
        this.log(level.toLowerCase(), `[Helius] ${message}`, data);
      });

      this.log('success', '✅ Helius Pagination Client initialized');
      return true;
    } catch (error) {
      this.log('error', '❌ Helius initialization failed: ' + error.message);
      throw error;
    }
  }

  /**
   * INITIALIZE YIELD HARVESTER
   */
  async initializeYieldHarvester() {
    try {
      if (!process.env.WALLET_ADDRESS && !process.env.SOLANA_TREASURY_REBATE_RECEIVER) {
        throw new Error('Wallet or treasury address not configured');
      }

      const walletAddress = process.env.WALLET_ADDRESS || 
                           process.env.SOLANA_TREASURY_REBATE_RECEIVER;

      this.services.yieldHarvester = new YieldHarvesterHelius({
        walletAddress,
        apiKey: process.env.HELIUS_API_KEY,
        minAPY: parseInt(process.env.YIELD_MIN_APY) || 5,
        debug: this.config.debug
      });

      // Enable if configured
      const enabled = process.env.YIELD_HARVESTER_ENABLED === 'true';
      this.state.strategies.yieldHarvester = enabled;

      this.log('success', `✅ Yield Harvester initialized (enabled: ${enabled})`);
      return true;
    } catch (error) {
      this.log('error', '❌ Yield Harvester initialization failed: ' + error.message);
      throw error;
    }
  }

  /**
   * INITIALIZE CROSS-CHAIN REBATE SYSTEM
   */
  async initializeRebateSystem() {
    try {
      if (!process.env.ETH_BICONOMY_SIGNER) {
        throw new Error('ETH_BICONOMY_SIGNER not configured');
      }

      if (!process.env.SOLANA_TREASURY_REBATE_RECEIVER) {
        throw new Error('SOLANA_TREASURY_REBATE_RECEIVER not configured');
      }

      this.services.rebateSystem = new CrossChainRebateSystem({
        ethSigner: process.env.ETH_BICONOMY_SIGNER,
        solanaReceiver: process.env.SOLANA_TREASURY_REBATE_RECEIVER,
        enabled: process.env.REBATE_PROGRAM_ENABLED === 'true',
        rebatePercentage: parseFloat(process.env.REBATE_PERCENTAGE) || 0.5,
        minRebateAmount: parseFloat(process.env.REBATE_MIN_AMOUNT) || 0.001,
        batchSize: parseInt(process.env.REBATE_BATCH_SIZE) || 10
      });

      this.log('success', '✅ Cross-Chain Rebate System initialized');
      return true;
    } catch (error) {
      this.log('error', '❌ Rebate System initialization failed: ' + error.message);
      throw error;
    }
  }

  /**
   * LOAD STATE FROM FILES
   */
  loadState() {
    try {
      const stateFiles = {
        beliefs: 'src/ralph/state/beliefs.json',
        portfolio: 'src/ralph/state/portfolio.json',
        performance: 'src/ralph/state/performance.json'
      };

      for (const [name, file] of Object.entries(stateFiles)) {
        try {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            this.state[name] = JSON.parse(content);
            this.log('debug', `Loaded ${name} state`);
          }
        } catch (error) {
          this.log('warn', `Could not load ${name}: ${error.message}`);
        }
      }

      this.log('success', '✅ State loaded');
      return true;
    } catch (error) {
      this.log('error', '❌ State loading failed: ' + error.message);
      throw error;
    }
  }

  /**
   * VERIFY CONFIGURATION
   */
  async verifyConfiguration() {
    try {
      const checks = {
        'Helius API': !!process.env.HELIUS_API_KEY,
        'ETH Biconomy Signer': !!process.env.ETH_BICONOMY_SIGNER,
        'Solana Treasury': !!process.env.SOLANA_TREASURY_REBATE_RECEIVER,
        'Yield Harvester': this.state.strategies.yieldHarvester,
        'Rebate System': !!this.services.rebateSystem
      };

      let passCount = 0;
      for (const [check, result] of Object.entries(checks)) {
        const status = result ? '✅' : '⚠️ ';
        this.log('debug', `${status} ${check}: ${result}`);
        if (result) passCount++;
      }

      this.log('info', `Configuration checks: ${passCount}/${Object.keys(checks).length} passed`);
      return passCount >= 4; // At least 4 critical checks
    } catch (error) {
      this.log('error', '❌ Configuration verification failed: ' + error.message);
      throw error;
    }
  }

  /**
   * GET SERVICE
   */
  getService(serviceName) {
    return this.services[serviceName] || null;
  }

  /**
   * GET PORTFOLIO
   */
  getPortfolio() {
    return {
      ...this.portfolio,
      lastUpdated: new Date().toISOString(),
      uptime: {
        seconds: Math.floor((Date.now() - this.startTime) / 1000),
        formatted: this.formatUptime()
      }
    };
  }

  /**
   * GET STATUS REPORT
   */
  getStatus() {
    const elapsed = Date.now() - this.stats.startTime;
    const successRate = this.stats.operationsCount > 0 ?
      ((this.stats.operationsCount - this.stats.errorsCount) / this.stats.operationsCount * 100).toFixed(1) :
      'N/A';

    return {
      initialized: this.state.initialized,
      version: this.version,
      environment: this.environment,
      network: this.network,
      uptime: this.formatUptime(),
      services: {
        helius: !!this.services.helius,
        yieldHarvester: !!this.services.yieldHarvester,
        rebateSystem: !!this.services.rebateSystem
      },
      strategies: this.state.strategies,
      statistics: {
        operationsCount: this.stats.operationsCount,
        errorsCount: this.stats.errorsCount,
        successRate: successRate + '%',
        elapsed: (elapsed / 1000).toFixed(0) + 's'
      },
      portfolio: this.portfolio,
      lastUpdate: this.state.lastUpdate
    };
  }

  /**
   * FORMAT UPTIME
   */
  formatUptime() {
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours}h ${minutes}m ${secs}s`;
  }

  /**
   * LOGGING
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (this.config.debug || level !== 'debug') {
      console.log(logEntry, Object.keys(data).length > 0 ? data : '');
    }

    // Write to log file
    this.writeLog(level, message, data);

    // Emit event
    this.emit('log', { level, message, data, timestamp });
  }

  /**
   * WRITE TO LOG FILE
   */
  writeLog(level, message, data) {
    try {
      const logFile = path.join(this.config.logDir, `${level}.log`);
      const logEntry = `${new Date().toISOString()} - ${message}\n`;
      
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      // Silently fail if log write fails
    }
  }

  /**
   * SHUTDOWN GRACEFULLY
   */
  async shutdown() {
    try {
      this.log('info', '🛑 Shutting down Ralph Agent Bot...');

      // Save state
      this.saveState();

      // Close connections
      if (this.services.helius) {
        this.log('debug', 'Closing Helius client...');
      }

      this.log('success', '✅ Ralph Agent Bot shutdown complete');
      this.emit('shutdown', { uptime: this.formatUptime() });

      return true;
    } catch (error) {
      this.log('error', '❌ Shutdown error: ' + error.message);
      throw error;
    }
  }

  /**
   * SAVE STATE TO FILES
   */
  saveState() {
    try {
      const stateData = {
        beliefs: this.state.beliefs || {},
        portfolio: this.portfolio,
        performance: this.state.performance || {}
      };

      for (const [name, data] of Object.entries(stateData)) {
        const file = `src/ralph/state/${name}.json`;
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        this.log('debug', `Saved ${name} state`);
      }

      this.log('success', '✅ State saved');
      return true;
    } catch (error) {
      this.log('error', '❌ State save failed: ' + error.message);
      throw error;
    }
  }
}

module.exports = RalphAgentBot;

// Example usage & test
async function demo() {
  console.log('🤖 RALPH AGENT BOT - INITIALIZATION DEMO\n');

  try {
    const ralph = new RalphAgentBot({
      debug: true,
      environment: 'development',
      network: 'solana-mainnet'
    });

    // Listen to events
    ralph.on('log', ({ level, message }) => {
      if (level === 'success') {
        console.log(`  ${message}`);
      }
    });

    ralph.on('initialized', ({ version, network }) => {
      console.log(`\n✅ Ralph v${version} ready on ${network}\n`);
    });

    // Initialize
    await ralph.initialize();

    // Display status
    console.log('📊 STATUS REPORT:');
    console.log(JSON.stringify(ralph.getStatus(), null, 2));

    // Shutdown
    console.log('\n🛑 Shutting down...');
    await ralph.shutdown();

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  demo().catch(console.error);
}
