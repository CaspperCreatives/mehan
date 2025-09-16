import { userManager } from './user-manager.service';
import { OptimizedContentService } from './optimized-content.service';
import { ICompleteUserObject } from '../repositories/optimized-content.repository';
import { logger } from 'firebase-functions';

/**
 * User Context Service
 * Handles automatic user loading and context management for requests
 */
export class UserContextService {
  private optimizedContentService: OptimizedContentService;

  constructor() {
    this.optimizedContentService = new OptimizedContentService();
  }

  /**
   * Load user context from database and set it in UserManager
   * @param userId - The user ID to load
   * @param linkedinUrl - Optional LinkedIn URL for fallback loading
   * @returns Promise<ICompleteUserObject | null> - The loaded user object
   */
  public async loadUserContext(userId: string, linkedinUrl?: string): Promise<ICompleteUserObject | null> {
    try {
      const cachedUser = userManager.getUserById(userId);
      if (cachedUser) {
        userManager.setCurrentUser(cachedUser);
        return cachedUser;
      }

      // Load from database
      const userObject = await this.optimizedContentService.getCompleteUserObject(userId);
      
      if (userObject) {
        // Cache and set as current user
        userManager.cacheUser(userObject);
        userManager.setCurrentUser(userObject);
        return userObject;
      }

      // If no user found and LinkedIn URL provided, try to find by URL
      if (linkedinUrl) {
        const userByUrl = await this.findUserByLinkedInUrl(linkedinUrl);
        if (userByUrl) {
          userManager.cacheUser(userByUrl);
          userManager.setCurrentUser(userByUrl);
          return userByUrl;
        }
      }

      return null;

    } catch (error) {
      console.error(`❌ [USER_CONTEXT] Error loading user context:`, error);
      throw error;
    }
  }

  /**
   * Create and load new user context
   * @param profileData - The profile data to create user from
   * @param linkedinUrl - The LinkedIn URL
   * @returns Promise<ICompleteUserObject> - The created user object
   */
  public async createAndLoadUserContext(result: any): Promise<ICompleteUserObject> {
    try {

      const savedUser = await this.optimizedContentService.saveCompleteUserObject(result);
      userManager.cacheUser(savedUser);
      userManager.setCurrentUser(savedUser);
      
      logger.info(`✅ [USER_CONTEXT] User context created/updated and loaded: ${savedUser.userId}`);
      return savedUser;

    } catch (error) {
      logger.error(`❌ [USER_CONTEXT] Error creating user context:`, error);
      throw error;
    }
  }

  /**
   * Update current user context
   * @param updatedData - Partial user data to update
   * @returns Promise<ICompleteUserObject | null> - The updated user object
   */
  public async updateCurrentUserContext(updatedData: Partial<ICompleteUserObject>): Promise<ICompleteUserObject | null> {
    try {
      const currentUser = userManager.getCurrentUser();
      if (!currentUser) {
        console.warn(`⚠️ [USER_CONTEXT] No current user to update`);
        return null;
      }


      // Update in database
      const updatedUser = await this.optimizedContentService.saveCompleteUserObject({
        ...currentUser,
        ...updatedData
      });

      // Update cache and current user
      userManager.updateCachedUser(currentUser.userId, updatedUser);
      userManager.setCurrentUser(updatedUser);

      return updatedUser;

    } catch (error) {
      console.error(`❌ [USER_CONTEXT] Error updating user context:`, error);
      throw error;
    }
  }

  /**
   * Clear current user context
   */
  public clearCurrentUserContext(): void {
    console.log(`🧹 [USER_CONTEXT] Clearing current user context`);
    userManager.setCurrentUser(null as any);
  }

  /**
   * Get current user context
   * @returns The current user object or null
   */
  public getCurrentUserContext(): ICompleteUserObject | null {
    return userManager.getCurrentUser();
  }

  /**
   * Check if user context is loaded
   * @returns True if user context is loaded, false otherwise
   */
  public hasUserContext(): boolean {
    return userManager.hasCurrentUser();
  }

  /**
   * Find user by LinkedIn URL (helper method)
   * @param linkedinUrl - The LinkedIn URL
   * @returns Promise<ICompleteUserObject | null> - The user object or null
   */
  public async findUserByLinkedInUrl(linkedinUrl: string): Promise<ICompleteUserObject | null> {
    try {
      
      // Use the optimized content service to find user by LinkedIn URL
      const userObject = await this.optimizedContentService.findUserByLinkedInUrl(linkedinUrl);
      
      if (userObject) {
        return userObject;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`❌ [USER_CONTEXT] Error finding user by LinkedIn URL:`, error);
      return null;
    }
  }

  /**
   * Ensure user context is loaded for a request
   * @param userId - The user ID
   * @param linkedinUrl - Optional LinkedIn URL
   * @returns Promise<boolean> - True if context loaded successfully
   */
  public async ensureUserContext(userId: string, linkedinUrl?: string): Promise<boolean> {
    try {
      if (userManager.hasCurrentUser() && userManager.getCurrentUserId() === userId) {
        return true;
      }

      const user = await this.loadUserContext(userId, linkedinUrl);
      return user !== null;

    } catch (error) {
      console.error(`❌ [USER_CONTEXT] Error ensuring user context:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const userContext = new UserContextService();
