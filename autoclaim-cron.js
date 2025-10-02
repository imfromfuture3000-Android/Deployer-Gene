const cron = require('node-cron');
const { executeAutoclaim } = require('./autoclaim-profits');

// Cron job for automated profit claiming
console.log('⏰ STARTING AUTOCLAIM CRON JOB');

// Run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Hourly autoclaim triggered at', new Date().toISOString());
  
  try {
    const result = await executeAutoclaim();
    console.log('✅ Autoclaim completed:', result.profits.sol.toFixed(4), 'SOL claimed');
  } catch (error) {
    console.error('❌ Autoclaim failed:', error.message);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});

// Run every 6 hours for major claims
cron.schedule('0 */6 * * *', async () => {
  console.log('💰 Major profit claim triggered');
  // Additional logic for larger claims
}, {
  scheduled: true,
  timezone: "UTC"
});

console.log('✅ Autoclaim cron jobs scheduled');
console.log('   - Hourly claims: 0 * * * *');
console.log('   - Major claims: 0 */6 * * *');