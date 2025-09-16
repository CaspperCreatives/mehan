import { ProfileService } from '../services/profile.service';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  /**
   * Scrape LinkedIn profile data
   */
  async scrapeProfile(url: string): Promise<any> {
    try {
      if (!url) {
        throw new Error('URL is required');
      }

      return await this.profileService.scrapeProfile(url);
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
  async analyzeProfile(url: string, language?: string, forceRefresh?: boolean, userId?: string): Promise<any> {
    try {
      if (!url) {
        throw new Error('URL is required');
      }
      const result = await this.profileService.analyzeProfile(url, language, forceRefresh, userId);
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

}
