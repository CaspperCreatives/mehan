import { userManager } from './user-manager.service';
import { userContext } from './user-context.service';

/**
 * Example Usage Service
 * Demonstrates how to use the UserManager and UserContext services from anywhere in the backend
 */
export class ExampleUsageService {

  /**
   * Example: Get current user data from anywhere in the backend
   * This can be called from any service without passing user data around
   */
  getCurrentUserExample() {
    // Get current user from UserManager
    const currentUser = userManager.getCurrentUser();
    
    if (!currentUser) {
      console.log('❌ [EXAMPLE] No current user available');
      return null;
    }

    console.log('✅ [EXAMPLE] Current user:', {
      userId: currentUser.userId,
      profileId: currentUser.profileId,
      linkedinUrl: currentUser.linkedinUrl,
      hasProfileData: !!currentUser.profileData,
      totalOptimizations: currentUser.totalOptimizations
    });

    return currentUser;
  }

  /**
   * Example: Access user's profile data from anywhere
   */
  getCurrentUserProfileData() {
    const currentUser = userManager.getCurrentUser();
    
    if (!currentUser?.profileData) {
      console.log('❌ [EXAMPLE] No profile data available for current user');
      return null;
    }

    console.log('✅ [EXAMPLE] Profile data available:', {
      firstName: currentUser.profileData.firstName,
      lastName: currentUser.profileData.lastName,
      headline: currentUser.profileData.headline,
      // ... other profile fields
    });

    return currentUser.profileData;
  }

  /**
   * Example: Update current user data
   */
  async updateCurrentUserExample(updates: any) {
    const currentUser = userManager.getCurrentUser();
    
    if (!currentUser) {
      console.log('❌ [EXAMPLE] No current user to update');
      return false;
    }

    try {
      // Update user context (this will also update the database)
      const updatedUser = await userContext.updateCurrentUserContext(updates);
      
      if (updatedUser) {
        console.log('✅ [EXAMPLE] User updated successfully:', updatedUser.userId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ [EXAMPLE] Error updating user:', error);
      return false;
    }
  }

  /**
   * Example: Load user context by ID
   */
  async loadUserByIdExample(userId: string) {
    try {
      const success = await userContext.ensureUserContext(userId);
      
      if (success) {
        const user = userManager.getCurrentUser();
        console.log('✅ [EXAMPLE] User loaded successfully:', user?.userId);
        return user;
      } else {
        console.log('❌ [EXAMPLE] Failed to load user:', userId);
        return null;
      }
    } catch (error) {
      console.error('❌ [EXAMPLE] Error loading user:', error);
      return null;
    }
  }

  /**
   * Example: Check if user has specific data
   */
  checkUserDataExample() {
    const currentUser = userManager.getCurrentUser();
    
    if (!currentUser) {
      return {
        hasUser: false,
        hasProfileData: false,
        hasOptimizations: false
      };
    }

    return {
      hasUser: true,
      hasProfileData: !!currentUser.profileData,
      hasOptimizations: (currentUser.totalOptimizations || 0) > 0,
      userId: currentUser.userId,
      profileId: currentUser.profileId
    };
  }

  /**
   * Example: Get cache statistics
   */
  getCacheStatsExample() {
    const stats = userManager.getCacheStats();
    console.log('📊 [EXAMPLE] Cache statistics:', stats);
    return stats;
  }

  /**
   * Example: Clear user context
   */
  clearUserContextExample() {
    userContext.clearCurrentUserContext();
    console.log('🧹 [EXAMPLE] User context cleared');
  }

  /**
   * Example: Working with multiple users in cache
   */
  getCachedUsersExample() {
    const cachedUserIds = userManager.getCachedUserIds();
    console.log('👥 [EXAMPLE] Cached users:', cachedUserIds);
    
    return cachedUserIds.map(userId => {
      const user = userManager.getUserById(userId);
      return {
        userId,
        hasUser: !!user,
        profileId: user?.profileId
      };
    });
  }
}

// Export singleton instance
export const exampleUsage = new ExampleUsageService();
