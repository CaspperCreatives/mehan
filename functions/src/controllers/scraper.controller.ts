import { IScraperService } from "../interfaces";
import ScraperService from "../services/scraper.service";
import { AIService } from "../services/ai.service";

export class ScraperController {
  private scraperService: IScraperService;
  private aiService: AIService;

  constructor() {
    this.scraperService = new ScraperService();
    this.aiService = new AIService();
  }

  /**
   * Scrape LinkedIn profile data
   */
  async scrapeLinkedInProfile(url: string): Promise<any> {
    try {
      if (!url) {
        throw new Error('URL is required');
      }

      const result = await this.scraperService.scrapeLinkedInProfile(url);      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Analyze LinkedIn profile with AI
   */
  async analyzeLinkedInProfile(profileData: any, language?: string): Promise<any> {
    try {
      if (!profileData) {
        throw new Error('Profile data is required');
      }
      const analysis = await this.aiService.analyzeLinkedInProfile(profileData, language);
      
      return analysis;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user object by user ID
   */
  async getUserObject(userId: string): Promise<any> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await this.scraperService.getUserObject(userId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export default ScraperController;
