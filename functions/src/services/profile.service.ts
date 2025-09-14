import { ScraperController } from '../controllers/scraper.controller';
import { ScoreService } from './score.service';
import { userContext } from './user-context.service';
import { userManager } from './user-manager.service';

export class ProfileService {
  private scraperController: ScraperController;
  private scoreService: ScoreService;

  constructor() {
    this.scraperController = new ScraperController();
    this.scoreService = new ScoreService();
  }

  /**
   * Scrape LinkedIn profile data
   */
  async scrapeProfile(url: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const profileData = await this.scraperController.scrapeLinkedInProfile(url);
      
      if (!profileData.success) {
        throw new Error(profileData.error || 'Failed to scrape profile');
      }
      
      return {
        success: true,
        data: profileData.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Service temporarily unavailable'
      };
    }
  }

  /**
   * Analyze LinkedIn profile with AI
   */
  async analyzeProfile(url: string, language?: string, forceRefresh: boolean = false): Promise<{ success: boolean; data?: any; cached: boolean; timestamp?: string; error?: string }> {
    try {
      // Always scrape fresh data to prevent data mixing between users
      console.log('🔍 [BACKEND] Always scraping fresh data to prevent data mixing between users');
      console.log('🔍 [BACKEND] Scraping fresh data from LinkedIn...');
      const profileData = await this.scraperController.scrapeLinkedInProfile(url);
      
      if (!profileData.success) {
        throw new Error(profileData.error || 'Failed to scrape profile');
      }
      
      const analysis = await this.scraperController.analyzeLinkedInProfile(profileData.data[0], language);
      
      if (!analysis.success) {
        throw new Error(analysis.error || 'Failed to analyze profile');
      }
      
      // Calculate profile score
      const profileScore = await this.calculateProfileScore(profileData.data[0]);
      
      const result = {
        profile: profileData.data,
        analysis: analysis.data,
        profileScore: profileScore.success ? profileScore.data : null
      };
      
      // Save user and profile data to database and set in UserManager
      try {
        await this.saveUserAndProfileData(profileData.data[0], url, analysis.data);
      } catch (saveError) {
        console.error('❌ [BACKEND] Error saving user and profile data:', saveError);
        // Don't throw the error - this shouldn't break the main flow
      }
      
      return {
        success: true,
        data: result,
        cached: false,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        cached: false,
        error: error instanceof Error ? error.message : 'Service temporarily unavailable'
      };
    }
  }

  /**
   * Calculate profile score
   */
  async calculateProfileScore(profileData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const profileScore = this.scoreService.calculateProfileScore(profileData);
      
      return {
        success: true,
        data: profileScore
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate profile score'
      };
    }
  }

  /**
   * Get current user from UserManager
   * @returns Current user object or null
   */
  getCurrentUser() {
    return userManager.getCurrentUser();
  }

  /**
   * Load user context by ID
   * @param userId - The user ID to load
   * @param linkedinUrl - Optional LinkedIn URL for fallback
   * @returns Promise<boolean> - True if user loaded successfully
   */
  async loadUserContext(userId: string, linkedinUrl?: string): Promise<boolean> {
    return await userContext.ensureUserContext(userId, linkedinUrl);
  }

  /**
   * Find user by LinkedIn URL
   * @param linkedinUrl - The LinkedIn URL to search for
   * @returns Promise<ICompleteUserObject | null> - The user object or null
   */
  // private async findUserByLinkedInUrl(linkedinUrl: string): Promise<any> {
  //   try {
  //     // Use the user context service to find user by URL
  //     return await userContext.findUserByLinkedInUrl(linkedinUrl);
  //   } catch (error) {
  //     console.error('❌ [BACKEND] Error finding user by LinkedIn URL:', error);
  //     return null;
  //   }
  // }

  /**
   * Save user and profile data to database and set in UserManager
   * @param profileData - The scraped profile data
   * @param linkedinUrl - The LinkedIn profile URL
   * @param analysisData - The AI analysis data (optional)
   */
  private async saveUserAndProfileData(profileData: any, linkedinUrl: string, analysisData?: any): Promise<void> {
    try {
      console.log('🔍 [BACKEND] Saving user and profile data to database...');
      
      // Extract profile information
      const profileId = profileData?.profileId || profileData?.id;
      const firstName = profileData?.firstName;
      const lastName = profileData?.lastName;
      
      console.log('🔍 [BACKEND] Profile info:', { profileId, firstName, lastName, linkedinUrl });
      
      if (!profileId) {
        console.warn('⚠️ [BACKEND] No profile ID found, skipping database save');
        return;
      }
      
      // Use UserContext to create and load user context
      const userObject = await userContext.createAndLoadUserContext(profileData, linkedinUrl);
      
      if (userObject) {
        console.log('✅ [BACKEND] User context created and loaded successfully');
        
        // Save analysis data if provided
        if (analysisData) {
          await this.saveAnalysisToUser(userObject.userId, analysisData);
        }
      } else {
        console.error('❌ [BACKEND] Failed to create and load user context');
      }
      
    } catch (error) {
      console.error('❌ [BACKEND] Error saving user and profile data:', error);
      throw error;
    }
  }

  /**
   * Save AI analysis data to user object
   * @param userId - The user ID
   * @param analysisData - The AI analysis data
   */
  private async saveAnalysisToUser(userId: string, analysisData: any): Promise<void> {
    try {
      console.log('🔍 [BACKEND] Saving AI analysis data to user:', userId);
      
      // Use the optimized content service to update the user object with analysis data
      const { OptimizedContentService } = await import('./optimized-content.service.js');
      const optimizedContentService = new OptimizedContentService();
      
      // Get the current user object
      const userObject = await optimizedContentService.getCompleteUserObject(userId);
      
      if (userObject) {
        // Update the user object with analysis data
        const updatedUserObject = {
          ...userObject,
          analysisData: analysisData,
          lastAnalyzedAt: new Date().toISOString()
        };
        
        // Save the updated user object
        await optimizedContentService.saveCompleteUserObject(updatedUserObject);
        console.log('✅ [BACKEND] AI analysis data saved to user object');
      } else {
        console.warn('⚠️ [BACKEND] Could not retrieve user object to save analysis data');
      }
    } catch (error) {
      console.error('❌ [BACKEND] Error saving AI analysis data:', error);
      // Don't throw the error - this shouldn't break the main flow
    }
  }
}