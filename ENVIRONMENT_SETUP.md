# Environment Variables Setup

This document explains how to properly configure API keys for the LinkedIn Profile Analyzer Extension.

## Why Environment Variables?

The extension uses AI services (OpenAI and Google Gemini) for profile analysis. API keys are sensitive information that should never be hardcoded in the source code or committed to version control.

## Required API Keys

### 1. OpenAI API Key
- **Purpose**: Primary AI analysis using GPT models
- **Get it from**: https://platform.openai.com/api-keys
- **Environment variable**: `OPENAI_API_KEY`

### 2. Google Gemini API Key
- **Purpose**: Fallback AI analysis when OpenAI is unavailable
- **Get it from**: https://makersuite.google.com/app/apikey
- **Environment variable**: `GEMINI_API_KEY`

### 3. Google AI API Key (Optional)
- **Purpose**: Alternative AI provider
- **Get it from**: https://aistudio.google.com/app/apikey
- **Environment variable**: `GOOGLE_AI_API_KEY`

## Setup Instructions

### Method 1: Using the Setup Script (Recommended)

```bash
# Run the setup script
chmod +x setup.sh
./setup.sh
```

The script will:
1. Create a `.env` file from the template
2. Guide you through adding your API keys
3. Install dependencies
4. Build the extension

### Method 2: Manual Setup

1. **Create the environment file**:
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file**:
   ```bash
   nano .env
   # or
   code .env
   ```

3. **Add your API keys**:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   GEMINI_API_KEY=your-actual-gemini-key-here
   GOOGLE_AI_API_KEY=your-actual-google-ai-key-here
   ```

4. **Install and build**:
   ```bash
   npm install
   npm run build
   ```

## Security Best Practices

### ✅ Do's
- Store API keys in environment variables
- Use the centralized `apiKeys.ts` utility
- Keep `.env` file in `.gitignore`
- Use different API keys for development and production
- Regularly rotate your API keys

### ❌ Don'ts
- Never hardcode API keys in source code
- Never commit API keys to version control
- Never share API keys publicly
- Don't use the same API key across multiple projects

## Troubleshooting

### "API key not configured" Error
This means your environment variables are not properly set up.

**Solution**:
1. Check that your `.env` file exists in the project root
2. Verify your API keys are correctly added to the `.env` file
3. Ensure there are no extra spaces or quotes around the API keys
4. Rebuild the extension: `npm run build`

### "API error: 401 Unauthorized" Error
This means your API key is invalid or expired.

**Solution**:
1. Check your API key is correct
2. Verify your API key has the necessary permissions
3. Check your API usage quotas
4. Generate a new API key if needed

### "API error: 429 Too Many Requests" Error
This means you've exceeded your API rate limits.

**Solution**:
1. Wait a few minutes before trying again
2. Check your API usage dashboard
3. Consider upgrading your API plan if needed
4. The extension will automatically retry with exponential backoff

## Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT analysis | `sk-proj-...` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for fallback | `AIzaSy...` |
| `GOOGLE_AI_API_KEY` | No | Google AI API key for alternative | `AIzaSy...` |

## Development vs Production

### Development
- Use test API keys with limited quotas
- Enable debug mode: `DEBUG=true`
- Use development API endpoints if available

### Production
- Use production API keys with higher quotas
- Disable debug mode
- Monitor API usage and costs
- Set up API key rotation

## API Key Management

The extension uses a centralized approach for API key management:

```typescript
// ✅ Correct way - using centralized utility
import { getOpenAIAPIKey } from '../utils/apiKeys';
const apiKey = getOpenAIAPIKey();

// ❌ Wrong way - hardcoded keys
const apiKey = "sk-proj-...";
```

This ensures:
- Consistent API key access across the application
- Proper error handling for missing keys
- Easy key rotation and management
- Security best practices 