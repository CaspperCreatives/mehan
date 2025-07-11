// Mock the Google Generative AI module for testing
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            overallScore: 75,
            strengths: ['Good experience', 'Relevant skills'],
            weaknesses: ['Could improve summary'],
            recommendations: ['Add more keywords', 'Update headline'],
            industryInsights: 'Technology industry is growing rapidly',
            profileOptimization: ['Complete all sections', 'Add certifications'],
            keywordAnalysis: {
              relevantKeywords: ['JavaScript', 'React', 'Node.js'],
              missingKeywords: ['TypeScript', 'AWS']
            },
            competitiveAnalysis: 'Competitive in the market',
            summary: 'John Doe is a skilled software engineer with relevant experience.'
          }))
        }
      })
    })
  }))
}));

// Mock browser APIs for testing
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  }
} as any;

// Mock DOM APIs
global.document = {
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  createElement: jest.fn(),
  body: {
    appendChild: jest.fn()
  }
} as any;

global.window = {
  location: {
    href: 'https://linkedin.com/in/test',
    pathname: '/in/test'
  },
  scrollTo: jest.fn()
} as any; 