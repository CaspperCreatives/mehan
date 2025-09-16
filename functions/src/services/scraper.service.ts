import * as logger from "firebase-functions/logger";
import { IScraperService } from "../interfaces";
import { OptimizedContentService } from "./optimized-content.service";

class ScraperService implements IScraperService {
  private optimizedContentService: OptimizedContentService;
  constructor() {
    this.optimizedContentService = new OptimizedContentService();
  }

  async scrapeLinkedInProfile(url: string): Promise<any> {
    try {
        const apifyUrl = process.env.APIFY_URL;
        const apifyToken = process.env.APIFY_TOKEN;
        
        if (!apifyUrl) {
          logger.error('APIFY_URL environment variable is not set');
          return {
            success: false,
            error: 'APIFY_URL environment variable is not set'
          };
        }
        
        if (!apifyToken) {
          logger.error('APIFY_TOKEN environment variable is not set');
          return {
            success: false,
            error: 'APIFY_TOKEN environment variable is not set'
          };
        }

        logger.info('Starting LinkedIn profile scraping for URL:', url);
        logger.info('Using Apify URL:', apifyUrl);
        logger.info('Using Apify Token:', apifyToken);
        
        const profileData = await fetch(apifyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apifyToken}`
            },
            body: JSON.stringify({
              "urls": [
                {
                  "url": url,
                  "method": "GET"
                }
              ],
              "findContacts": false,
              "scrapeCompany": false
            }),
          }); 
          
        if (!profileData.ok) {
          const errorText = await profileData.text();
          logger.error('Apify API request failed:', {
            status: profileData.status,
            statusText: profileData.statusText,
            error: errorText
          });
          return {
            success: false,
            error: `Apify API request failed: ${profileData.status} ${profileData.statusText}`
          };
        }
        
        const data = await profileData.json();
        logger.info('Apify API response received:', {
          hasData: !!data,
          dataType: typeof data,
          dataKeys: data ? Object.keys(data) : 'null/undefined'
        });
        
        // Note: User and profile data saving is now handled by the ProfileService
        // to avoid duplicate saves and ensure proper data structure
        
        // Wrap the response in the expected format
        return {
          success: true,
          data: data
        };
        
    } catch (error) {
      logger.error('Error scraping LinkedIn profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during scraping'
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

      // Get complete user object from database
      const userObject = await this.optimizedContentService.getCompleteUserObject(userId);
      
      if (!userObject) {
        return {
          success: false,
          error: 'User object not found'
        };
      }

      return {
        success: true,
        data: {
          profileData: userObject.profileData,
          userId: userObject.userId,
          profileId: userObject.profileId,
          linkedinUrl: userObject.linkedinUrl
        }
      };
    } catch (error) {
      logger.error('Error getting user object:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export default ScraperService;
