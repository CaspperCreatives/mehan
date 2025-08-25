import { firebaseRepository, ApiResponse, CallMethodOptions } from './firebase-repository';
import { LinkedInProfileData, ScrapeProfileRequest, ScrapeProfileResponse, ScrapeBatchResponse } from '../interfaces/IScraper';

export class ScraperRepository {
  private firebaseRepo = firebaseRepository;

  /**
   * Scrape a single LinkedIn profile
   * @param url - LinkedIn profile URL to scrape
   * @param options - Optional scraping configuration
   * @param callOptions - Firebase call options
   * @returns Promise with scraped profile data
   */
  async scrapeLinkedInProfile(
    url: string,
    options?: ScrapeProfileRequest['options'],
    callOptions?: CallMethodOptions
  ): Promise<ScrapeProfileResponse> {
    try {
      const requestData: ScrapeProfileRequest = {
        url,
        options: options || {
          includeContactInfo: true,
          includeRecommendations: true,
          includeConnections: true,
          includeSkills: true,
          includeEducation: true,
          includeExperience: true,
          includeCertifications: true,
          includeLanguages: true,
          includeInterests: true,
          includeVolunteering: true,
          includePublications: true,
          includePatents: true,
          includeCourses: true,
          includeProjects: true,
          includeHonors: true,
          includeTestScores: true
        }
      };

      const defaultCallOptions: CallMethodOptions = {
        timeout: 120000, // 2 minutes for scraping
        retries: 3,
        retryDelay: 2000,
        ...callOptions
      };

      const result = await this.firebaseRepo.callMethodWithType<LinkedInProfileData>(
        'scrapeLinkedInProfile',
        requestData,
        defaultCallOptions
      );
      
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: {
          scrapeTime: Date.now(),
          url,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          scrapeTime: Date.now(),
          url,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Scrape multiple LinkedIn profiles in batch
   * @param urls - Array of LinkedIn profile URLs
   * @param options - Optional scraping configuration
   * @param callOptions - Firebase call options
   * @returns Promise with batch scraped data
   */
  async scrapeLinkedInProfilesBatch(
    urls: string[],
    options?: ScrapeProfileRequest['options'],
    callOptions?: CallMethodOptions
  ): Promise<ScrapeBatchResponse> {
    const startTime = Date.now();
    const results: Array<{
      url: string;
      profile: LinkedInProfileData;
      success: boolean;
      error?: string;
    }> = [];

    let successfulScrapes = 0;
    let failedScrapes = 0;

    for (const url of urls) {
      try {
        const result = await this.scrapeLinkedInProfile(url, options, callOptions);
        
        if (result.success && result.data) {
          results.push({
            url,
            profile: result.data,
            success: true
          });
          successfulScrapes++;
        } else {
          results.push({
            url,
            profile: {},
            success: false,
            error: result.error
          });
          failedScrapes++;
        }
      } catch (error) {
        results.push({
          url,
          profile: {},
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failedScrapes++;
      }
    }

    const totalTime = Date.now() - startTime;

    return {
      success: successfulScrapes > 0,
      data: results,
      metadata: {
        totalUrls: urls.length,
        successfulScrapes,
        failedScrapes,
        totalTime
      }
    };
  }


  /**
   * Analyze a LinkedIn profile
   * @param url - LinkedIn profile URL to analyze
   * @returns Promise with analysis results
   */
  async analyzeLinkedInProfile(url: string): Promise<ApiResponse> {
    console.log('🔍 [DEBUG] ScraperRepository.analyzeLinkedInProfile called with URL:', url);
    try {
      const result = await this.firebaseRepo.callMethodWithType('analyzeLinkedInProfile', { url });
      console.log('🔍 [DEBUG] ScraperRepository.analyzeLinkedInProfile result:', result);
      return result;
    } catch (error) {
      console.error('🔍 [DEBUG] ScraperRepository.analyzeLinkedInProfile error:', error);
      throw error;
    }
  }

  /**
   * Validate LinkedIn URL format
   * @param url - URL to validate
   * @returns Boolean indicating if URL is valid
   */
  validateLinkedInUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'www.linkedin.com' || urlObj.hostname === 'linkedin.com';
    } catch {
      return false;
    }
  }

  /**
   * Extract LinkedIn profile ID from URL
   * @param url - LinkedIn profile URL
   * @returns Profile ID or null if invalid
   */
  extractProfileId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      
      if (pathParts.length >= 2 && pathParts[0] === 'in') {
        return pathParts[1];
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Test scraper functionality
   * @returns Promise with test results
   */
  async testScraper(): Promise<ApiResponse> {
    return this.firebaseRepo.callMethod('testScraper');
  }

  /**
   * Get scraper status and health
   * @returns Promise with scraper status
   */
  async getScraperStatus(): Promise<ApiResponse> {
    return this.firebaseRepo.callMethod('getScraperStatus');
  }

  /**
   * Get scraping statistics
   * @returns Promise with scraping stats
   */
  async getScrapingStats(): Promise<ApiResponse> {
    return this.firebaseRepo.callMethod('getScrapingStats');
  }
}

// Export a singleton instance
export const scraperRepository = new ScraperRepository();

// Export the class for testing or custom instances
export default ScraperRepository;
