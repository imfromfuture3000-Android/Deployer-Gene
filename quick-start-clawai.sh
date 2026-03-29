#!/bin/bash
# One-Command ClawAIBot Setup & Run
# Installs and runs ClawAIBot with Ollama in cloud

echo "🚀 ONE-COMMAND CLAWAIBOT SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Quick install Ollama
if ! command -v ollama &> /dev/null; then
    echo "📦 Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Start Ollama
echo "🚀 Starting Ollama..."
nohup ollama serve > /dev/null 2>&1 &
sleep 3

# Pull lightweight model
echo "📥 Getting AI model..."
ollama pull llama3.2:1b

echo "✅ Setup complete! Starting AI-enhanced PAUL loop..."
echo ""

# Run the enhanced loop
exec ./paul-clawai-cloud-loop.sh