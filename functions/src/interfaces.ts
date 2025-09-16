export interface IScraperService {
  scrapeLinkedInProfile(url: string): Promise<any>;
  getUserObject(userId: string): Promise<any>;
}

export interface AIAnalysisResponse {
    analysis: string;
    suggestions: string[];
    score: number;
    confidence: number;
  }
  
  export interface AIRepository {
    generateText(prompt: string, language?: string): Promise<string>;
    analyzeLinkedInProfile(profileData: any, language?: string): Promise<any>;
  }