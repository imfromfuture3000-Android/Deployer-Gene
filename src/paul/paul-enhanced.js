/**
 * RALPH ENHANCED SERVICES - ITERATION 1 UPDATE
 * Adds Jupiter Lend + Supabase to core Ralph system
 * 
 * New Capabilities:
 * - Jupiter Lend Earn: Deposit for yield (no fees)
 * - Jupiter Lend Borrow: Vault positions with up to 95% LTV
 * - Supabase: Persistent state + real-time updates + audit trail
 */

require('dotenv').config({ path: '/workspaces/Deployer-Gene/.env.local' });

const JupiterLendIntegration = require('./src/ralph/integrations/jupiter-lend');
const SupabaseIntegration = require('./src/ralph/integrations/supabase-backend');

class RalphEnhancedServices {
  constructor(config = {}) {
    this.config = {
      juptierLendEnabled: config.jupiterLendEnabled || process.env.JUPITER_LEND_ENABLED === 'true',
      supabaseEnabled: config.supabaseEnabled || process.env.SUPABASE_ENABLED === 'true',
      ...config
    };

    this.services = {
      jupiterLend: null,
      supabase: null
    };

    this.stats = {
      initialized: false,
      servicesMounted: 0
    };
  }

  /**
   * INITIALIZE JUPITER LEND INTEGRATION
   */
  async initializeJupiterLend() {
    try {
      console.log('🚀 Initializing Jupiter Lend Integration...');

      this.services.jupiterLend = new JupiterLendIntegration({
        enabled: this.config.jupiterLendEnabled
      });

      console.log('✅ Jupiter Lend ready');
      console.log(`   - Earn Program: ${process.env.JUPITER_LEND_EARN_PROGRAM.slice(0, 8)}...`);
      console.log(`   - Borrow Program: ${process.env.JUPITER_LEND_BORROW_PROGRAM.slice(0, 8)}...`);

      this.stats.servicesMounted++;
      return true;
    } catch (error) {
      console.error('❌ Jupiter Lend init failed:', error.message);
      throw error;
    }
  }

  /**
   * INITIALIZE SUPABASE BACKEND
   */
  async initializeSupabase() {
    try {
      console.log('🚀 Initializing Supabase Backend...');

      this.services.supabase = new SupabaseIntegration({
        enabled: this.config.supabaseEnabled
      });

      // Health check
      const health = await this.services.supabase.healthCheck();

      console.log('✅ Supabase ready');
      console.log(`   - Status: ${health.status}`);
      console.log(`   - Connected: ${health.connected}`);

      this.stats.servicesMounted++;
      return true;
    } catch (error) {
      console.error('❌ Supabase init failed:', error.message);
      throw error;
    }
  }

  /**
   * INITIALIZE ALL ENHANCED SERVICES
   */
  async initializeAll() {
    try {
      console.log('\n' + '='.repeat(80));
      console.log('🎯 RALPH ENHANCED SERVICES - INITIALIZATION');
      console.log('='.repeat(80) + '\n');

      // Initialize Jupiter Lend
      if (this.config.jupiterLendEnabled) {
        await this.initializeJupiterLend();
      }

      // Initialize Supabase
      if (this.config.supabaseEnabled) {
        await this.initializeSupabase();
      }

      this.stats.initialized = true;

      console.log('\n✅ All enhanced services initialized');
      console.log(`📊 ${this.stats.servicesMounted} services mounted\n`);

      return true;
    } catch (error) {
      console.error('❌ Enhanced services initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * GET SERVICE REFERENCE
   */
  getService(name) {
    return this.services[name] || null;
  }

  /**
   * EXECUTE YIELD STRATEGY (Jupiter Lend)
   */
  async executeYieldStrategy(tokenMint, amount) {
    try {
      if (!this.services.jupiterLend) {
        throw new Error('Jupiter Lend service not initialized');
      }

      console.log(`\n💰 EXECUTING YIELD STRATEGY: ${amount} ${tokenMint}`);

      // 1. Deposit to Earn
      const deposit = await this.services.jupiterLend.depositToEarn(tokenMint, amount);

      // 2. Store to database
      if (this.services.supabase) {
        await this.services.supabase.logEvent('yield_deposit', {
          severity: 'INFO',
          message: `Deposited ${amount} ${tokenMint}`,
          details: deposit
        });
      }

      return deposit;
    } catch (error) {
      console.error('❌ Yield strategy execution failed:', error.message);
      if (this.services.supabase) {
        await this.services.supabase.logEvent('yield_error', {
          severity: 'ERROR',
          message: error.message
        });
      }
      throw error;
    }
  }

  /**
   * EXECUTE BORROW STRATEGY (Jupiter Lend)
   */
  async executeBorrowStrategy(collateralMint, collateralAmount, debtMint, borrowAmount) {
    try {
      if (!this.services.jupiterLend) {
        throw new Error('Jupiter Lend service not initialized');
      }

      console.log(
        `\n🏦 EXECUTING BORROW STRATEGY: ` +
        `${collateralAmount} ${collateralMint} → ${borrowAmount} ${debtMint}`
      );

      // 1. Create vault
      const vault = await this.services.jupiterLend.createBorrowVault(
        collateralMint,
        collateralAmount,
        debtMint,
        borrowAmount
      );

      // 2. Store to database
      if (this.services.supabase) {
        await this.services.supabase.storeVault(vault);
      }

      // 3. Monitor health
      const health = await this.services.jupiterLend.getVaultHealth(vault.vaultId);

      return {
        vault,
        health
      };
    } catch (error) {
      console.error('❌ Borrow strategy execution failed:', error.message);
      if (this.services.supabase) {
        await this.services.supabase.logEvent('borrow_error', {
          severity: 'ERROR',
          message: error.message
        });
      }
      throw error;
    }
  }

  /**
   * MONITOR VAULT HEALTH & AUTO-REPAY
   */
  async monitorVaultHealth(vaultId) {
    try {
      if (!this.services.jupiterLend) {
        throw new Error('Jupiter Lend service not initialized');
      }

      const health = await this.services.jupiterLend.getVaultHealth(vaultId);

      // Auto-repay if approaching liquidation
      if (health.riskLevel === 'high') {
        console.log('⚠️  High risk detected, executing auto-repay...');

        const repayment = await this.services.jupiterLend.repayDebt(vaultId, 100);

        if (this.services.supabase) {
          await this.services.supabase.logEvent('vault_auto_repay', {
            severity: 'WARNING',
            message: 'Auto-repay executed to prevent liquidation',
            details: repayment
          });
        }

        return repayment;
      }

      return health;
    } catch (error) {
      console.error('❌ Vault monitoring failed:', error.message);
      throw error;
    }
  }

  /**
   * GET COMPREHENSIVE REPORT
   */
  async getComprehensiveReport() {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        status: 'operational',
        services: {
          jupiterLend: this.services.jupiterLend ? this.services.jupiterLend.getStatistics() : null,
          supabase: this.services.supabase ? this.services.supabase.getStatistics() : null
        },
        data: {}
      };

      // Query data from Supabase
      if (this.services.supabase) {
        report.data = {
          empires: await this.services.supabase.queryEmpires(),
          transactions: await this.services.supabase.queryTransactionHistory({ limit: 10 }),
          vaults: await this.services.supabase.queryVaults(),
          portfolioHistory: await this.services.supabase.getPortfolioHistory({ days: 7 })
        };
      }

      return report;
    } catch (error) {
      console.error('❌ Report generation failed:', error.message);
      throw error;
    }
  }

  /**
   * SHUTDOWN SERVICES
   */
  async shutdown() {
    try {
      console.log('\n🛑 Shutting down enhanced services...');

      this.services.jupiterLend = null;
      this.services.supabase = null;

      console.log('✅ Enhanced services shutdown complete\n');
    } catch (error) {
      console.error('❌ Shutdown failed:', error.message);
      throw error;
    }
  }
}

module.exports = RalphEnhancedServices;

// Demo
async function demo() {
  console.log('\n🎯 RALPH ENHANCED SERVICES - DEMO\n');
  console.log('='.repeat(80));

  try {
    const ralph = new RalphEnhancedServices({
      jupiterLendEnabled: true,
      supabaseEnabled: true
    });

    // Initialize all services
    await ralph.initializeAll();

    // Get comprehensive report
    const report = await ralph.getComprehensiveReport();

    console.log('\n📊 COMPREHENSIVE REPORT:');
    console.log(JSON.stringify(report, null, 2));

    // Shutdown
    await ralph.shutdown();

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

if (require.main === module) {
  demo().catch(console.error);
}
