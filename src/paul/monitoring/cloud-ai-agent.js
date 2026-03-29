#!/usr/bin/env node

/**
 * FREE CLOUD AI AGENT INTEGRATION
 * Supports: Ollama (local/cloud), Claude AI (Anthropic)
 * Zero-cost AI analysis for Ralph Agent Bot
 */

const https = require('https');
const http = require('http');

class CloudAIAgent {
  constructor(config = {}) {
    this.provider = config.provider || process.env.AI_PROVIDER || 'ollama';
    this.ollamaUrl = config.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
    this.ollamaModel = config.ollamaModel || process.env.OLLAMA_MODEL || 'llama2';
    this.claudeKey = config.claudeKey || process.env.ANTHROPIC_API_KEY;
  }

  async analyzePortfolio(metrics) {
    const prompt = `Analyze this DeFi portfolio and provide risk assessment:
Empires: ${metrics.totalEmpires}
Active Vaults: ${metrics.activeVaults}
Recent Yields: ${metrics.recentYields?.length || 0}

Provide: 1) Risk score (1-10), 2) Top recommendation, 3) Warning if any.`;

    return this.query(prompt);
  }

  async analyzeStrategy(strategyData) {
    const prompt = `Evaluate this trading strategy:
${JSON.stringify(strategyData, null, 2)}

Provide: 1) Efficiency score, 2) Optimization suggestion, 3) Risk flag.`;

    return this.query(prompt);
  }

  async query(prompt) {
    if (this.provider === 'ollama') {
      return this.queryOllama(prompt);
    } else if (this.provider === 'claude') {
      return this.queryClaude(prompt);
    }
    throw new Error(`Unsupported provider: ${this.provider}`);
  }

  async queryOllama(prompt) {
    const url = new URL('/api/generate', this.ollamaUrl);
    const payload = JSON.stringify({
      model: this.ollamaModel,
      prompt: prompt,
      stream: false
    });

    return new Promise((resolve, reject) => {
      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.response || data);
          } catch (e) {
            reject(new Error(`Ollama parse error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  async queryClaude(prompt) {
    if (!this.claudeKey) {
      throw new Error('ANTHROPIC_API_KEY not set');
    }

    const payload = JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeKey,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.content?.[0]?.text || data);
          } catch (e) {
            reject(new Error(`Claude parse error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }
}

module.exports = CloudAIAgent;
