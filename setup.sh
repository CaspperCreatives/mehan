#!/bin/bash

echo "🚀 LinkedIn Profile Analyzer Extension Setup"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Please edit the .env file and add your API keys:"
    echo "   - OPENAI_API_KEY: Get from https://platform.openai.com/api-keys"
    echo "   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey"
    echo "   - GOOGLE_AI_API_KEY: Get from https://aistudio.google.com/app/apikey"
    echo ""
    echo "📖 Edit .env file and add your actual API keys, then run this script again."
    exit 0
fi

# Check if API keys are configured
source .env
if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
    echo "❌ OPENAI_API_KEY not configured in .env file"
    echo "   Please edit .env file and add your OpenAI API key"
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    echo "❌ GEMINI_API_KEY not configured in .env file"
    echo "   Please edit .env file and add your Gemini API key"
    exit 1
fi

echo "✅ Environment variables configured!"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the extension
echo "🔨 Building extension..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Extension built successfully!"
    echo ""
    echo "🎉 Setup complete! To load the extension in Chrome:"
    echo "   1. Open Chrome and go to chrome://extensions/"
    echo "   2. Enable 'Developer mode'"
    echo "   3. Click 'Load unpacked'"
    echo "   4. Select the 'dist' folder from this project"
    echo ""
    echo "🚀 The extension is ready to use!"
else
    echo "❌ Failed to build extension"
    exit 1
fi 