import * as logger from "firebase-functions/logger";
import { IScraperService } from "../interfaces";

class ScraperService implements IScraperService {

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
}

export default ScraperService;
