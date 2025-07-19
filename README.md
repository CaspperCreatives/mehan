# LinkedIn Profile Analyzer Extension

A Chrome extension that analyzes LinkedIn profiles using AI to provide comprehensive insights, scoring, and optimization recommendations.

## Features

- **AI-Powered Analysis**: Uses OpenAI GPT and Google Gemini for intelligent profile analysis
- **Comprehensive Scoring**: Detailed scoring system across 20+ profile sections
- **Smart Recommendations**: Personalized suggestions for profile optimization
- **Multi-language Support**: English and Arabic interface
- **Real-time Analysis**: Instant analysis with caching for performance
- **Content Generation**: AI-powered content improvement suggestions

## Setup

### 1. Environment Variables

The extension requires API keys for AI analysis. Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env

# Edit the .env file with your actual API keys
```

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key (required for GPT analysis)
- `GEMINI_API_KEY`: Your Google Gemini API key (fallback for AI analysis)
- `GOOGLE_AI_API_KEY`: Your Google AI API key (alternative AI provider)

### 2. Installation

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# For development with hot reload
npm run dev
```

### 3. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder from this project

## Usage

1. Navigate to any LinkedIn profile
2. Click the extension icon in your browser toolbar
3. Wait for the AI analysis to complete
4. Review the comprehensive analysis and recommendations
5. Use the content generation features to improve your profile

## Development

### Project Structure

```
src/
├── components/          # React components
├── utils/              # Utility functions
│   ├── aiAnalyzer.ts   # AI analysis logic
│   ├── apiKeys.ts      # API key management
│   └── translations.ts # Multi-language support
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

### Key Files

- `src/utils/aiAnalyzer.ts`: Main AI analysis engine
- `src/utils/apiKeys.ts`: Centralized API key management
- `src/components/AIAnalysisSidebar.tsx`: Main UI component
- `manifest.json`: Extension configuration

### Environment Variables

The extension uses environment variables for API key management. Make sure to:

1. Create a `.env` file based on `env.example`
2. Add your actual API keys to the `.env` file
3. Never commit API keys to version control
4. Use the centralized `apiKeys.ts` utility for all API key access

### API Key Security

- API keys are stored in environment variables
- The `apiKeys.ts` file provides centralized access
- Hardcoded keys have been removed for security
- Proper error handling for missing keys

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your `.env` file is properly configured
2. **Analysis Failures**: Check your API key quotas and limits
3. **Extension Not Loading**: Verify the `dist` folder exists and is properly built

### Debug Mode

Enable debug mode by setting `DEBUG=true` in your environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 