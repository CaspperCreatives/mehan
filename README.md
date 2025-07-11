# LinkedIn Profile Scorer Extension

A Chrome extension that analyzes LinkedIn profiles and provides comprehensive AI-powered insights to help users optimize their professional presence.

## Features

### Profile Analysis
- **Real-time Profile Scoring**: Analyzes profile completeness and provides scores for different sections
- **AI-Powered Insights**: Uses Google's Gemini AI to provide detailed analysis and recommendations
- **Section-by-Section Breakdown**: Individual scores for LinkedIn URL, Country, Headline, Summary, Experience, Education, Skills, and other sections

### AI Analysis Sidebar
The extension now includes a comprehensive AI analysis sidebar that displays:

#### 📊 Overall Profile Score
- Visual score display with color-coded indicators (Green: 70+, Yellow: 40-69, Red: <40)
- Percentage-based scoring system (0-100)

#### 📝 Summary Section
- AI-generated profile summary highlighting key strengths and areas for improvement

#### 🔑 Keyword Analysis
- **Relevant Keywords**: Identifies keywords already present in the profile
- **Missing Keywords**: Suggests important keywords that could improve visibility

#### ✅ Strengths
- Lists profile strengths with green checkmarks
- Highlights what's working well

#### ⚠️ Areas for Improvement
- Identifies weaknesses with warning icons
- Provides specific areas to focus on

#### 📈 Section Scores
- Individual scores for each profile section
- Color-coded indicators (🟢🟡🔴) for quick visual assessment
- Detailed breakdown of scoring criteria

#### 💡 Top Recommendations
- Actionable advice to improve profile
- Prioritized list of most important improvements

#### 🏭 Industry Insights
- AI-generated insights about industry positioning
- Competitive analysis and market positioning

#### 🔧 Profile Optimization
- Specific optimization suggestions
- Technical improvements for better visibility

#### 🎯 Competitive Analysis
- How the profile compares to industry standards
- Market positioning insights

## Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

## Usage

1. Navigate to any LinkedIn profile page
2. The extension will automatically appear as a sidebar on the right side of the page
3. Click the toggle button (⮜/⮞) to show/hide the sidebar
4. The AI analysis will automatically start when the profile loads
5. Review the comprehensive analysis and recommendations

## Technical Details

### AI Integration
- Uses Google's Gemini 1.5 Flash model for analysis
- Fallback analysis system when AI is unavailable
- Comprehensive scoring algorithm for profile assessment

### Scoring System
The extension uses a sophisticated scoring system that evaluates:

- **LinkedIn URL** (0-5 points): Custom URL presence
- **Country** (0-5 points): Location information
- **Headline** (0-20 points): Professional headline quality and length
- **Summary** (0-20 points): About section completeness and content
- **Experience** (0-20 points): Work history and descriptions
- **Education** (0-10 points): Educational background
- **Skills** (0-15 points): Skill endorsements and relevance
- **Other Sections** (0-5 points): Publications, languages, certifications, awards, volunteering

### Color-Coded Indicators
- 🟢 **Green**: Good score (70-100) - Profile section is well-optimized
- 🟡 **Yellow**: Medium score (40-69) - Room for improvement
- 🔴 **Red**: Low score (0-39) - Needs significant attention

## Development

### Project Structure
```
src/
├── components/
│   ├── AIAnalysisSidebar.tsx    # New AI analysis sidebar component
│   ├── LinkedInProfileViewer.tsx # Main profile viewer
│   └── AIAnalysis.tsx           # Original AI analysis component
├── utils/
│   ├── hooks/
│   │   └── useLinkedInProfile.ts # Profile data extraction hook
│   ├── aiAnalyzer.ts            # AI analysis logic
│   └── scoreCalculator.ts       # Profile scoring algorithm
├── content.tsx                  # Extension entry point
└── styles.css                   # Styling for all components
```

### Key Components

#### AIAnalysisSidebar
- Displays comprehensive AI analysis results
- Color-coded scoring indicators
- Responsive design for sidebar integration
- Loading and error states

#### useLinkedInProfile Hook
- Extracts profile data from LinkedIn pages
- Manages AI analysis state
- Handles loading and error states
- Returns both profile data and AI analysis results

### Building and Testing
```bash
# Development build
npm run dev

# Production build
npm run build

# Watch mode for development
npm run watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please create an issue in the GitHub repository. 