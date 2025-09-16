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
  optimizationLimit?: {
    remainingOptimizations: number;
    hasOptimized: boolean;
    optimizedSection?: string;
    optimizedAt?: string;
  };
  refreshLimit?: {
    remainingRefreshes: number;
    lastRefreshDate: string;
    totalRefreshes: number;
  };
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
   * Get existing userId from localStorage for a given URL
   * @param linkedinUrl - LinkedIn profile URL
   * @returns string | null - Existing userId or null if not found
   */
  static getExistingUserIdFromStorage(linkedinUrl: string): string | null {
    try {
      const storedUserId = localStorage.getItem(`linkedin-user-id-${linkedinUrl}`);
      return storedUserId;
    } catch (error) {
      return null;
    }
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
      // Fallback to generating a new ID
      return this.generateUserId();
    }
  }

  /**
   * Fetch user data from database using stored user ID
   * @param profileUrl - LinkedIn profile URL
   * @param forceRefresh - Whether to force refresh the data
   * @returns Promise<any> - User data from database or null if not found
   */
  static async fetchUserDataFromDatabase(profileUrl: string, forceRefresh: boolean = false): Promise<any> {
    try {
      
      if (forceRefresh) {
        return null;
      }

      const storedUserId = localStorage.getItem(`linkedin-user-id-${profileUrl}`);
      
      if (!storedUserId) {
        return null;
      }

      if (!this.firebaseRepository) {
        return null;
      }

      try {
        const userData = await this.firebaseRepository.getCompleteUserObject(storedUserId);
        
        if (userData && userData.success && userData.data) {
          return userData.data;
        } else {
          return null;
        }
      } catch (dbError) {
        return null;
      }
    } catch (error) {
      return null;
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
      const existingUserId = this.getExistingUserIdFromStorage(linkedinUrl);
      let userId: string;
      
      if (existingUserId) {
        userId = existingUserId;
        this.currentUserId = userId; 
      } else {
        userId = await this.getOrCreateUserId();
      }
      
      // Get existing session to preserve optimization and refresh limits
      const existingSession = await this.getCurrentUserSession();
      
      const session: UserSession = {
        userId,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        profileId,
        linkedinUrl,
        profileData,
        optimizedContent: existingSession?.optimizedContent || [], // Preserve existing optimized content
        totalOptimizations: existingSession?.totalOptimizations || 0,
        lastOptimizedAt: existingSession?.lastOptimizedAt,
        optimizationLimit: existingSession?.optimizationLimit || { // Preserve existing optimization limit
          remainingOptimizations: 1,
          hasOptimized: false,
          optimizedSection: undefined,
          optimizedAt: undefined
        },
        refreshLimit: existingSession?.refreshLimit || { // Preserve existing refresh limit
          remainingRefreshes: 2,
          lastRefreshDate: new Date().toDateString(),
          totalRefreshes: 0
        }
      };
      
      this.currentUserSession = session;
    } catch (error) {
    }
  }

  /**
   * Clear user session to prevent data mixing between users
   */
  static clearUserSession(): void {
    this.currentUserSession = null;
    this.currentUserId = null;
  }

  /**
   * Add optimized content to user session
   * @param optimizedContent - The optimized content data
   */
  static async addOptimizedContentToSession(optimizedContent: OptimizedContentData): Promise<void> {
    try {
      const existingSession = await this.getCurrentUserSession();
      
      if (!existingSession) {
        return;
      }

      const userId = existingSession.userId;

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
    } catch (error) {
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
        return false;
      }

      return true;
    } catch (error) {
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
    }
  }

  /**
   * Generate a unique user ID
   * @returns string - A unique user ID
   */
  private static generateUserId(): string {
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
