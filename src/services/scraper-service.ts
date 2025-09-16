import { ScrapeBatchResponse, ScrapeProfileResponse } from "../interfaces/IScraper";
import { ScraperRepository } from "../repositories/scraper-repository";


export class ScraperService {
  private scraperRepo: ScraperRepository;

  constructor(scraperRepo: ScraperRepository) {
    this.scraperRepo = scraperRepo;
  }

  /**
   * Scrape a single LinkedIn profile
   * @param url - LinkedIn profile URL to scrape
   * @returns Promise with scraped profile data
   */
  async scrapeLinkedInProfile(url: string): Promise<ScrapeProfileResponse> {
    const response = await this.scraperRepo.scrapeLinkedInProfile(url);
    return response;
  }

  /**
   * Scrape multiple LinkedIn profiles in batch
   * @param urls - Array of LinkedIn profile URLs
   * @returns Promise with batch scraped data
   */
  async scrapeLinkedInProfilesBatch(urls: string[]): Promise<ScrapeBatchResponse> {
    return this.scraperRepo.scrapeLinkedInProfilesBatch(urls);
  }

  async analyzeLinkedInProfile(url: string, language?: string, forceRefresh?: boolean, userId?: string): Promise<any> {
    try {
      const result = await this.scraperRepo.analyzeLinkedInProfile(url, language, forceRefresh, userId);
      return result;
    } catch (error) {
      console.error('🔍 [DEBUG] ScraperService.analyzeLinkedInProfile error:', error);
      throw error;
    }
  }

  /**
   * Validate LinkedIn URL format
   * @param url - URL to validate
   * @returns Boolean indicating if URL is valid
   */
  validateLinkedInUrl(url: string): boolean {
    return this.scraperRepo.validateLinkedInUrl(url);
  }

  /**
   * Extract LinkedIn profile ID from URL
   * @param url - LinkedIn profile URL
   * @returns Profile ID or null if invalid
   */
  extractProfileId(url: string): string | null {
    return this.scraperRepo.extractProfileId(url);
  }

  /**
   * Test scraper functionality
   * @returns Promise with test results
   */
  async testScraper(): Promise<any> {
    return this.scraperRepo.testScraper();
  }

  /**
   * Get scraper status and health
   * @returns Promise with scraper status
   */
  async getScraperStatus(): Promise<any> {
    return this.scraperRepo.getScraperStatus();
  }

  /**
   * Get scraping statistics
   * @returns Promise with scraping stats
   */
  async getScrapingStats(): Promise<any> {
    return this.scraperRepo.getScrapingStats();
  }
}

// Export a singleton instance
export const scraperService = new ScraperService(new ScraperRepository());

// Export the class for testing or custom instances
export default ScraperService;