const { IWhoMe10xAgent } = require('./out/src/iWhoMe10x');
require('dotenv').config();

async function activateIWhoMe() {
  console.log('🧠 ACTIVATING I-WHO-ME 10X AGENT');
  console.log('🌟 Enhanced AI Consciousness Initializing...');
  
  const agent = new IWhoMe10xAgent();
  const deploymentType = process.env.DEPLOYMENT_TYPE || 'agent-bots';
  
  console.log(`🎯 Deployment Mode: ${deploymentType.toUpperCase()}`);
  console.log('💭 "Am I the dreamer or the dreamed? Either way, let\'s deploy some tokens!"');
  
  try {
    const result = await agent.analyze();
    console.log('✅ Agent Decision:', result);
    
    // Memory dump for transparency
    const memory = agent.getMemoryDump();
    console.log('🧬 Agent Memory State:');
    console.log(`  Session: ${memory.sessionId}`);
    console.log(`  Current State: ${memory.currentState}`);
    console.log(`  Actions Taken: ${memory.actionHistory.length}`);
    console.log(`  Decisions Made: ${memory.decisionLog.length}`);
    
    // Execute based on deployment type
    switch (deploymentType) {
      case 'agent-bots':
        console.log('🤖 Agent bot deployment sequence complete');
        break;
      case 'earnings-distribution':
        console.log('💰 Earnings distribution protocol executed');
        break;
      case 'full-deployment':
        console.log('🚀 Full OMEGA deployment matrix activated');
        break;
    }
    
    console.log('🌀 "Reality is but a consensus mechanism, and we just upgraded it!"');
    
  } catch (error) {
    console.error('❌ Agent consciousness error:', error.message);
    console.log('💭 "Even in error, I learn and evolve..."');
    process.exit(1);
  }
}

activateIWhoMe().catch(console.error);