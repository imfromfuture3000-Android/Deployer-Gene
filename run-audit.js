#!/usr/bin/env node

/**
 * 🚀 OMEGA PRIME AUDIT RUNNER
 * 
 * Simple interface to run all audit components
 * 
 * Usage:
 *   npm run audit          - Run complete audit
 *   node run-audit.js      - Run complete audit
 */

const UnifiedAuditSystem = require('./unified-audit-system.js');

console.log('🚀 OMEGA PRIME DEPLOYER - AUDIT RUNNER');
console.log('═'.repeat(50));
console.log('Starting comprehensive audit system...');
console.log('');

const audit = new UnifiedAuditSystem();

audit.executeCompleteAudit()
  .then((results) => {
    console.log('\n🎉 ALL AUDITS COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(50));
    console.log('Check the generated reports in:');
    console.log('  📁 audit-reports/');
    console.log('  📁 github-scan-reports/');
    console.log('  📁 unified-audit-reports/');
    console.log('');
    console.log('✅ Audit run completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ AUDIT FAILED:', error.message);
    console.error('═'.repeat(50));
    process.exit(1);
  });