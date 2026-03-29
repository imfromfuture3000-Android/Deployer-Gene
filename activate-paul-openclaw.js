#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'openclaw.config.json');
const RALPH_CONFIG = path.join(__dirname, '.ralph-config.json');

console.log('🚀 Activating Ralph Loop with OpenClaw + Ollama\n');

// Verify Ollama is running
const checkOllama = spawn('ollama', ['list']);

checkOllama.on('error', () => {
  console.error('❌ Ollama not found. Install: https://ollama.com');
  process.exit(1);
});

checkOllama.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Ollama not running. Start with: ollama serve');
    process.exit(1);
  }

  console.log('✅ Ollama detected');
  
  // Pull model if needed
  console.log('📦 Ensuring qwen3-coder model...');
  const pull = spawn('ollama', ['pull', 'qwen3-coder'], { stdio: 'inherit' });
  
  pull.on('close', () => {
    console.log('✅ Model ready\n');
    
    // Launch OpenClaw with Ralph
    console.log('🔄 Starting OpenClaw gateway with Ralph agent...\n');
    const openclaw = spawn('ollama', ['launch', 'openclaw'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        OPENCLAW_CONFIG: CONFIG_FILE,
        RALPH_CONFIG: RALPH_CONFIG
      }
    });
    
    openclaw.on('error', (err) => {
      console.error('❌ Failed to start OpenClaw:', err.message);
      console.log('\n💡 Install OpenClaw: npm install -g openclaw@latest');
      process.exit(1);
    });
  });
});
