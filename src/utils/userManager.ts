/**
 * User Management Utility
 * Handles user UUID generation, database operations, and user session management
 */

export interface OptimizedContentData {
  section: string;
  originalContent: string;
  optimizedContent: string;
  sectionType?: string;
  metadata?: {
    wordCount?: number;
    characterCount?: number;
    optimizationScore?: number;
    language?: string;
  };
  optimizedAt: string;
}

export interface UserSession {
  userId: string;
  createdAt: string;
  lastActiveAt: string;
  profileId?: string;
  linkedinUrl?: string;
  profileData?: any; // Complete LinkedIn profile data
  optimizedContent?: OptimizedContentData[]; // Array of all optimized content
  totalOptimizations?: number;
  lastOptimizedAt?: string;
}

export class UserManager {
  private static currentUserId: string | null = null;
  private static currentUserSession: UserSession | null = null;
  private static firebaseRepository: any = null;

  /**
   * Initialize Firebase repository
   */
  static setFirebaseRepository(repository: any): void {
    this.firebaseRepository = repository;
  }

  /**
   * Get or create a user UUID
   * @returns Promise<string> - The user UUID
   */
  static async getOrCreateUserId(): Promise<string> {
    try {
      // Try to get existing user ID from memory
      if (this.currentUserId) {
        // Update last active timestamp
        await this.updateUserSession(this.currentUserId);
        return this.currentUserId;
      }

      // Generate new user ID
      const newUserId = this.generateUserId();
      
      // Store in memory
      this.currentUserId = newUserId;
      
      // Create initial user session
      await this.createUserSession(newUserId);
      
      return newUserId;
    } catch (error) {
      console.error('Error getting or creating user ID:', error);
      // Fallback to generating a new ID
      return this.generateUserId();
    }
  }

  /**
   * Fetch user data from database first, then scrape if no data found
   * @param profileUrl - LinkedIn profile URL
   * @param forceRefresh - Whether to force refresh the data
   * @returns Promise<any> - User profile data
   */
  static async fetchUserDataFromDatabase(profileUrl: string, forceRefresh: boolean = false): Promise<any> {
    try {
      console.log('🔍 [DEBUG] Fetching user data from database for URL:', profileUrl);
      
      if (!this.firebaseRepository) {
        console.warn('Firebase repository not initialized');
        return null;
      }

      // First try to get cached data from database
      if (!forceRefresh) {
        try {
          console.log('🔍 [DEBUG] Checking for cached data in database...');
          const cachedResponse = await this.firebaseRepository.getCachedLinkedInProfile(profileUrl);
          console.log('🔍 [DEBUG] Database cached response:', cachedResponse);
          
          if (cachedResponse.success && cachedResponse.cached && cachedResponse.data) {
            console.log('🔍 [DEBUG] Found cached data in database, using it');
            
            // Update user session with database data
            const profileData = cachedResponse.data.profile?.[0] || cachedResponse.data.data?.profile?.[0];
            if (profileData) {
              await this.updateUserSessionWithCompleteProfile(
                profileData, 
                profileData.profileId || 'unknown', 
                profileUrl
              );
            }
            
            return cachedResponse.data;
          }
        } catch (dbError) {
          console.log('🔍 [DEBUG] Database fetch failed, will proceed with scraping:', dbError);
        }
      }

      // No cached data found, need to scrape
      console.log('🔍 [DEBUG] No cached data found in database, will need to scrape');
      return null;
    } catch (error) {
      console.error('Error fetching user data from database:', error);
      return null;
    }
  }

  /**
   * Save scraped data to database and update user session
   * @param scrapedData - Scraped profile data
   * @param profileUrl - LinkedIn profile URL
   */
  static async saveScrapedDataToDatabase(scrapedData: any, profileUrl: string): Promise<void> {
    try {
      console.log('🔍 [DEBUG] Saving scraped data to database...');
      
      if (!this.firebaseRepository) {
        console.warn('Firebase repository not initialized, cannot save to database');
        return;
      }

      // Extract profile data
      const profileData = scrapedData.data?.profile?.[0] || scrapedData.profile?.[0];
      if (profileData) {
        console.log('🔍 [DEBUG] Profile data found, saving to database...');
        
        // Update user session with complete profile
        await this.updateUserSessionWithCompleteProfile(
          profileData, 
          profileData.profileId || 'unknown', 
          profileUrl
        );
        
        // Save to database via Firebase repository
        try {
          await this.firebaseRepository.saveLinkedInProfile(profileUrl, scrapedData.data);
          console.log('✅ Profile data saved to database');
        } catch (saveError) {
          console.error('❌ Error saving profile data to database:', saveError);
        }
      }
    } catch (error) {
      console.error('Error saving scraped data to database:', error);
    }
  }

  /**
   * Get the current user session
   * @returns Promise<UserSession | null>
   */
  static async getCurrentUserSession(): Promise<UserSession | null> {
    try {
      return this.currentUserSession;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  }

  /**
   * Update user session with profile information
   * @param profileId - LinkedIn profile ID
   * @param linkedinUrl - LinkedIn profile URL
   */
  static async updateUserSessionWithProfile(profileId: string, linkedinUrl: string): Promise<void> {
    try {
      const userId = await this.getOrCreateUserId();
      const session: UserSession = {
        userId,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        profileId,
        linkedinUrl
      };
      
      this.currentUserSession = session;
    } catch (error) {
      console.error('Error updating user session with profile:', error);
    }
  }

  /**
   * Update user session with complete profile data
   * @param profileData - Complete LinkedIn profile data
   * @param profileId - LinkedIn profile ID
   * @param linkedinUrl - LinkedIn profile URL
   */
  static async updateUserSessionWithCompleteProfile(profileData: any, profileId: string, linkedinUrl: string): Promise<void> {
    try {
      const userId = await this.getOrCreateUserId();
      const existingSession = await this.getCurrentUserSession();
      
      const session: UserSession = {
        userId,
        createdAt: existingSession?.createdAt || new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        profileId,
        linkedinUrl,
        profileData,
        optimizedContent: existingSession?.optimizedContent || [],
        totalOptimizations: existingSession?.totalOptimizations || 0,
        lastOptimizedAt: existingSession?.lastOptimizedAt
      };
      
      this.currentUserSession = session;
    } catch (error) {
      console.error('Error updating user session with complete profile:', error);
    }
  }

  /**
   * Add optimized content to user session
   * @param optimizedContent - The optimized content data
   */
  static async addOptimizedContentToSession(optimizedContent: OptimizedContentData): Promise<void> {
    try {
      const userId = await this.getOrCreateUserId();
      const existingSession = await this.getCurrentUserSession();
      
      if (!existingSession) {
        console.error('No existing user session found');
        return;
      }

      // Check if content for this section already exists and update it, or add new
      const updatedOptimizedContent = existingSession.optimizedContent || [];
      const existingIndex = updatedOptimizedContent.findIndex(
        content => content.section === optimizedContent.section
      );

      if (existingIndex >= 0) {
        // Update existing content
        updatedOptimizedContent[existingIndex] = optimizedContent;
      } else {
        // Add new content
        updatedOptimizedContent.push(optimizedContent);
      }

      const updatedSession: UserSession = {
        ...existingSession,
        lastActiveAt: new Date().toISOString(),
        optimizedContent: updatedOptimizedContent,
        totalOptimizations: updatedOptimizedContent.length,
        lastOptimizedAt: optimizedContent.optimizedAt
      };
      
      this.currentUserSession = updatedSession;
      console.log('✅ User session updated with optimized content');
    } catch (error) {
      console.error('Error adding optimized content to session:', error);
    }
  }

  /**
   * Get all optimized content for current user
   * @returns Promise<OptimizedContentData[]> - Array of optimized content
   */
  static async getAllOptimizedContent(): Promise<OptimizedContentData[]> {
    try {
      const session = await this.getCurrentUserSession();
      return session?.optimizedContent || [];
    } catch (error) {
      console.error('Error getting optimized content:', error);
      return [];
    }
  }

  /**
   * Get optimized content for a specific section
   * @param section - The section name
   * @returns Promise<OptimizedContentData | null> - The optimized content or null
   */
  static async getOptimizedContentForSection(section: string): Promise<OptimizedContentData | null> {
    try {
      const allContent = await this.getAllOptimizedContent();
      return allContent.find(content => content.section === section) || null;
    } catch (error) {
      console.error('Error getting optimized content for section:', error);
      return null;
    }
  }

  /**
   * Save complete user object to database
   * @returns Promise<boolean> - Success status
   */
  static async saveCompleteUserObjectToDatabase(): Promise<boolean> {
    try {
      const session = await this.getCurrentUserSession();
      if (!session) {
        console.error('No user session found to save');
        return false;
      }

      // This will be implemented in the optimized content service
      // For now, just log the complete user object
      console.log('Complete user object to save:', session);
      return true;
    } catch (error) {
      console.error('Error saving complete user object:', error);
      return false;
    }
  }

  /**
   * Get stored user ID from memory
   * @returns Promise<string | null>
   */
  private static async getStoredUserId(): Promise<string | null> {
    try {
      return this.currentUserId;
    } catch (error) {
      console.error('Error getting stored user ID:', error);
      return null;
    }
  }

  /**
   * Store user ID in memory
   * @param userId - The user ID to store
   */
  private static async storeUserId(userId: string): Promise<void> {
    try {
      this.currentUserId = userId;
    } catch (error) {
      console.error('Error storing user ID:', error);
    }
  }

  /**
   * Create initial user session
   * @param userId - The user ID
   */
  private static async createUserSession(userId: string): Promise<void> {
    try {
      const session: UserSession = {
        userId,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      
      this.currentUserSession = session;
    } catch (error) {
      console.error('Error creating user session:', error);
    }
  }

  /**
   * Update user session last active timestamp
   * @param userId - The user ID
   */
  private static async updateUserSession(userId: string): Promise<void> {
    try {
      const existingSession = await this.getCurrentUserSession();
      if (existingSession) {
        const updatedSession: UserSession = {
          ...existingSession,
          lastActiveAt: new Date().toISOString()
        };
        this.currentUserSession = updatedSession;
      }
    } catch (error) {
      console.error('Error updating user session:', error);
    }
  }

  /**
   * Generate a unique user ID
   * @returns string - A unique user ID
   */
  private static generateUserId(): string {
    // Generate a UUID-like string
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    
    return `user_${timestamp}_${randomPart}_${randomPart2}`;
  }

  /**
   * Clear user data from memory
   */
  static async clearUserData(): Promise<void> {
    try {
      this.currentUserId = null;
      this.currentUserSession = null;
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  /**
   * Get user ID for database operations
   * @returns Promise<string> - The user ID
   */
  static async getUserIdForDatabase(): Promise<string> {
    return await this.getOrCreateUserId();
  }
}
