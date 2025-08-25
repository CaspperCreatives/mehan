export interface IScraperService {
  scrapeLinkedInProfile(url: string): Promise<any>;
}

export interface AIAnalysisResponse {
    analysis: string;
    suggestions: string[];
    score: number;
    confidence: number;
  }
  
  export interface AIRepository {
    generateText(prompt: string): Promise<string>;
    analyzeLinkedInProfile(profileData: any): Promise<any>;
  }