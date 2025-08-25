import { firebaseRepository, ApiResponse } from '../repositories/firebase-repository';

// Define interfaces for LinkedIn profile data
export interface LinkedInProfileData {
  name?: string;
  headline?: string;
  location?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field: string;
    year?: string;
  }>;
  skills?: string[];
  recommendations?: number;
  connections?: number;
}

export interface ScrapeProfileRequest {
  url: string;
}

export interface ScrapeProfileResponse {
  success: boolean;
  data?: LinkedInProfileData;
  error?: string;
}

export class FirebaseService {
  /**
   * Scrape LinkedIn profile using the Firebase Cloud Function
   * @param url - LinkedIn profile URL to scrape
   * @returns Promise with scraped profile data
   */
  async scrapeLinkedInProfile(url: string): Promise<ScrapeProfileResponse> {
    try {
      const result = await firebaseRepository.callMethodWithType<LinkedInProfileData>(
        'scrapeLinkedInProfile',
        { url },
        {
          timeout: 120000, // 2 minutes for scraping
          retries: 3,
          retryDelay: 2000
        }
      );

      return {
        success: result.success,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Test the Firebase connection
   * @returns Promise with health status
   */
  async testConnection(): Promise<ApiResponse> {
    return firebaseRepository.healthCheck();
  }

  /**
   * Test the API endpoints
   * @returns Promise with API test results
   */
  async testApi(): Promise<ApiResponse> {
    return firebaseRepository.testApi();
  }

  /**
   * Generic method to call any Firebase function
   * This demonstrates how the repository can be used for any function
   * @param functionName - Name of the Firebase function
   * @param data - Data to pass to the function
   * @returns Promise with function response
   */
  async callFunction<T = any>(functionName: string, data?: any): Promise<ApiResponse<T>> {
    return firebaseRepository.callMethod<T>(functionName, data);
  }

  /**
   * Check if Firebase is properly initialized
   * @returns Boolean indicating if Firebase is ready
   */
  isFirebaseReady(): boolean {
    return firebaseRepository.isInitialized();
  }
}

// Export a singleton instance
export const firebaseService = new FirebaseService();

// Export the class for testing or custom instances
export default FirebaseService;
