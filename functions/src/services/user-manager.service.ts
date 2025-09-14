import { ICompleteUserObject } from '../repositories/optimized-content.repository';

/**
 * Centralized User Manager Service
 * Provides a singleton service to store and access user objects across the entire backend
 * This eliminates the need to pass user objects around or make repeated database calls
 */
export class UserManagerService {
  private static instance: UserManagerService;
  private currentUser: ICompleteUserObject | null = null;
  private userCache: Map<string, ICompleteUserObject> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds
  private cacheTimestamps: Map<string, number> = new Map();

  private constructor() {}

  /**
   * Get singleton instance of UserManagerService
   */
  public static getInstance(): UserManagerService {
    if (!UserManagerService.instance) {
      UserManagerService.instance = new UserManagerService();
    }
    return UserManagerService.instance;
  }

  /**
   * Set the current user for the request context
   * @param user - The complete user object
   */
  public setCurrentUser(user: ICompleteUserObject): void {
    this.currentUser = user;
    this.cacheUser(user);
    console.log(`✅ [USER_MANAGER] Current user set: ${user.userId}`);
  }

  /**
   * Get the current user from request context
   * @returns The current user object or null
   */
  public getCurrentUser(): ICompleteUserObject | null {
    return this.currentUser;
  }

  /**
   * Get user by ID from cache or return null
   * @param userId - The user ID
   * @returns The user object or null
   */
  public getUserById(userId: string): ICompleteUserObject | null {
    const cachedUser = this.userCache.get(userId);
    
    if (cachedUser && this.isCacheValid(userId)) {
      console.log(`✅ [USER_MANAGER] Retrieved user from cache: ${userId}`);
      return cachedUser;
    }

    // Remove expired cache entry
    if (cachedUser && !this.isCacheValid(userId)) {
      this.userCache.delete(userId);
      this.cacheTimestamps.delete(userId);
      console.log(`🗑️ [USER_MANAGER] Removed expired cache for user: ${userId}`);
    }

    return null;
  }

  /**
   * Cache a user object
   * @param user - The user object to cache
   */
  public cacheUser(user: ICompleteUserObject): void {
    this.userCache.set(user.userId, user);
    this.cacheTimestamps.set(user.userId, Date.now());
    console.log(`💾 [USER_MANAGER] Cached user: ${user.userId}`);
  }

  /**
   * Update cached user data
   * @param userId - The user ID
   * @param updatedData - Partial user data to update
   */
  public updateCachedUser(userId: string, updatedData: Partial<ICompleteUserObject>): void {
    const existingUser = this.userCache.get(userId);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...updatedData };
      this.userCache.set(userId, updatedUser);
      this.cacheTimestamps.set(userId, Date.now());
      
      // Update current user if it's the same user
      if (this.currentUser?.userId === userId) {
        this.currentUser = updatedUser;
      }
      
      console.log(`🔄 [USER_MANAGER] Updated cached user: ${userId}`);
    }
  }

  /**
   * Remove user from cache
   * @param userId - The user ID to remove
   */
  public removeUserFromCache(userId: string): void {
    this.userCache.delete(userId);
    this.cacheTimestamps.delete(userId);
    
    // Clear current user if it's the same user
    if (this.currentUser?.userId === userId) {
      this.currentUser = null;
    }
    
    console.log(`🗑️ [USER_MANAGER] Removed user from cache: ${userId}`);
  }

  /**
   * Clear all cached users
   */
  public clearAllCache(): void {
    this.userCache.clear();
    this.cacheTimestamps.clear();
    this.currentUser = null;
    console.log(`🧹 [USER_MANAGER] Cleared all user cache`);
  }

  /**
   * Get all cached user IDs
   * @returns Array of cached user IDs
   */
  public getCachedUserIds(): string[] {
    return Array.from(this.userCache.keys());
  }

  /**
   * Check if cache is valid for a user
   * @param userId - The user ID
   * @returns True if cache is valid, false otherwise
   */
  private isCacheValid(userId: string): boolean {
    const timestamp = this.cacheTimestamps.get(userId);
    if (!timestamp) return false;
    
    const now = Date.now();
    const isValid = (now - timestamp) < this.CACHE_TTL;
    
    if (!isValid) {
      console.log(`⏰ [USER_MANAGER] Cache expired for user: ${userId}`);
    }
    
    return isValid;
  }

  /**
   * Get cache statistics
   * @returns Object with cache statistics
   */
  public getCacheStats(): {
    totalCachedUsers: number;
    currentUserId: string | null;
    cacheSize: number;
    validCaches: number;
  } {
    const validCaches = Array.from(this.userCache.keys()).filter(userId => 
      this.isCacheValid(userId)
    ).length;

    return {
      totalCachedUsers: this.userCache.size,
      currentUserId: this.currentUser?.userId || null,
      cacheSize: this.userCache.size,
      validCaches
    };
  }

  /**
   * Check if a user is currently set
   * @returns True if current user is set, false otherwise
   */
  public hasCurrentUser(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get current user ID
   * @returns Current user ID or null
   */
  public getCurrentUserId(): string | null {
    return this.currentUser?.userId || null;
  }

  /**
   * Check if user exists in cache
   * @param userId - The user ID
   * @returns True if user exists in cache, false otherwise
   */
  public hasUserInCache(userId: string): boolean {
    return this.userCache.has(userId) && this.isCacheValid(userId);
  }
}

// Export singleton instance
export const userManager = UserManagerService.getInstance();
