import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../config/firebase-config';



console.log('firebaseConfig', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Connect to emulator in development
// For browser extensions, we'll always connect to the emulator when available
try {
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('Connected to Firebase Functions emulator on localhost:5001');
} catch (error) {
  console.warn('Firebase emulator connection failed:', error);
  console.log('Will use production Firebase Functions');
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  cached?: boolean;
  timestamp?: string;
}

export interface CallMethodOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class FirebaseRepository {
  private functions = functions;

  /**
   * Generic method to call any Firebase Cloud Function using HTTP requests
   * @param functionName - Name of the Firebase function to call
   * @param data - Data to pass to the function
   * @param options - Optional configuration for the call
   * @returns Promise with the function response
   */
  async callMethod<T = any>(
    functionName: string, 
    data?: any, 
    options: CallMethodOptions = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = 300000, retries = 3, retryDelay = 2000 } = options;
    // Use emulator URL in development, production URL otherwise
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const functionUrl = isDevelopment 
      ? `http://localhost:5001/mehan-7640e/us-central1/${functionName}`
      : `https://us-central1-mehan-7640e.cloudfunctions.net/${functionName}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 [DEBUG] Calling Firebase function ${functionName} with data:`, data);

        // Make the HTTP request
        const requestPromise = fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data || {}),
        });
        
        const response = await Promise.race([requestPromise]);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('🔍 [DEBUG] Failed to parse JSON response:', parseError);
          console.error('🔍 [DEBUG] Raw response that failed to parse:', responseText);
          const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
          throw new Error(`Invalid JSON response: ${errorMessage}`);
        }

        console.log(`🔍 [DEBUG] Firebase function ${functionName} response:`, result);

        // Check if the entire result should be the data
        if (result.success && !result.data && Object.keys(result).length > 2) {
          return {
            success: true,
            data: result as T
          };
        }

        return {
          success: true,
          data: result.data as T
        };

      } catch (error) {
        console.error(`Attempt ${attempt} failed for function ${functionName}:`, error);
        
        // If this is the last attempt, return the error
        if (attempt === retries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
        
        // Wait before retrying
        await this.delay(retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'All retry attempts failed'
    };
  }

  /**
   * Call a Firebase function with specific data and return typed response
   * @param functionName - Name of the Firebase function
   * @param data - Data to pass to the function
   * @param options - Optional configuration
   * @returns Typed response
   */
  async callMethodWithType<T>(
    functionName: string,
    data?: any,
    options?: CallMethodOptions
  ): Promise<ApiResponse<T>> {
    return this.callMethod<T>(functionName, data, options);
  }

  /**
   * Call a Firebase function without data
   * @param functionName - Name of the Firebase function
   * @param options - Optional configuration
   * @returns Function response
   */
  async callMethodNoData<T = any>(
    functionName: string,
    options?: CallMethodOptions
  ): Promise<ApiResponse<T>> {
    return this.callMethod<T>(functionName, undefined, options);
  }

  /**
   * Health check method to test Firebase connection
   * @returns Health status
   */
  async healthCheck(): Promise<ApiResponse> {
    return this.callMethod('healthCheck');
  }

  /**
   * Test API endpoint
   * @returns Test response
   */
  async testApi(): Promise<ApiResponse> {
    return this.callMethod('apiTest');
  }

  /**
   * Make HTTP request to analyzeLinkedInProfile function
   * @param url - LinkedIn profile URL to analyze
   * @param options - Optional configuration for the request
   * @returns Promise with the analysis response
   */
  async analyzeLinkedInProfile(url: string, options: CallMethodOptions = {}): Promise<ApiResponse> {
    const { timeout = 300000, retries = 3, retryDelay = 2000 } = options;
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const functionUrl = isDevelopment 
      ? 'http://localhost:5001/mehan-7640e/us-central1/analyzeLinkedInProfile'
      : 'https://us-central1-mehan-7640e.cloudfunctions.net/analyzeLinkedInProfile';

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {


        // Prepare request body
        const requestBody = { url };

        // Make the HTTP request
        const requestPromise = fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        const response = await Promise.race([requestPromise]);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('🔍 [DEBUG] Failed to parse JSON response:', parseError);
          console.error('🔍 [DEBUG] Raw response that failed to parse:', responseText);
          const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
          throw new Error(`Invalid JSON response: ${errorMessage}`);
        }

        // Check if the entire result should be the data
        if (result.success && !result.data && Object.keys(result).length > 2) {
          return {
            success: true,
            data: result
          };
        }

        return {
          success: true,
          data: result.data
        };

      } catch (error) {
        
        
        // If this is the last attempt, throw the error
        if (attempt === retries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
        
        // Wait before retrying
        await this.delay(retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'All retry attempts failed'
    };
  }

  /**
   * Check for cached LinkedIn profile data
   * @param url - LinkedIn profile URL to check
   * @param options - Optional configuration for the request
   * @returns Promise with cached data if available
   */
  async getCachedLinkedInProfile(url: string, options: CallMethodOptions = {}): Promise<ApiResponse> {
    const { timeout = 30000, retries = 1, retryDelay = 1000 } = options;
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const functionUrl = isDevelopment 
      ? 'http://localhost:5001/mehan-7640e/us-central1/getCachedLinkedInProfile'
      : 'https://us-central1-mehan-7640e.cloudfunctions.net/getCachedLinkedInProfile';

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {

        // Make the HTTP request
        const requestPromise = fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
        
        const response = await Promise.race([requestPromise]);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        
        return {
          success: true,
          data: result.data,
          cached: result.cached,
          timestamp: result.timestamp
        };

      } catch (error) {
        console.error(`Attempt ${attempt} failed for getCachedLinkedInProfile:`, error);
        
        // If this is the last attempt, throw the error
        if (attempt === retries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
        
        // Wait before retrying
        await this.delay(retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'All retry attempts failed'
    };
  }

  /**
   * Clear cached LinkedIn profile data
   * @param url - LinkedIn profile URL to clear cache for
   * @param options - Optional configuration for the request
   * @returns Promise with clear cache response
   */
  async clearCachedLinkedInProfile(url: string, options: CallMethodOptions = {}): Promise<ApiResponse> {
    const { timeout = 30000, retries = 1, retryDelay = 1000 } = options;
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const functionUrl = isDevelopment 
      ? 'http://localhost:5001/mehan-7640e/us-central1/clearCachedLinkedInProfile'
      : 'https://us-central1-mehan-7640e.cloudfunctions.net/clearCachedLinkedInProfile';

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {

        // Make the HTTP request
        const requestPromise = fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
        
        const response = await Promise.race([requestPromise]);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return {
          success: true,
          data: result.data,
          message: result.message
        };

      } catch (error) {
        console.error(`Attempt ${attempt} failed for clearCachedLinkedInProfile:`, error);
        
        // If this is the last attempt, throw the error
        if (attempt === retries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
        
        // Wait before retrying
        await this.delay(retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'All retry attempts failed'
    };
  }

  /**
   * Utility method to delay execution
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the Firebase functions instance
   * @returns Firebase functions instance
   */
  getFunctions() {
    return this.functions;
  }

  /**
   * Check if Firebase is properly initialized
   * @returns Boolean indicating if Firebase is initialized
   */
  isInitialized(): boolean {
    return this.functions !== null && this.functions !== undefined;
  }
}

// Export a singleton instance
export const firebaseRepository = new FirebaseRepository();

// Export the class for testing or custom instances
export default FirebaseRepository;
