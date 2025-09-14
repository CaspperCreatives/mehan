import { Request, Response, NextFunction } from 'express';
import { userContext } from '../services/user-context.service';
import { userManager } from '../services/user-manager.service';

/**
 * User Context Middleware
 * Automatically loads user context for requests that include userId or linkedinUrl
 */
export class UserContextMiddleware {
  
  /**
   * Middleware to load user context from request parameters
   * Looks for userId in query params or body, and linkedinUrl as fallback
   */
  static async loadUserContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.query.userId as string || req.body?.userId;
      const linkedinUrl = req.query.linkedinUrl as string || req.body?.linkedinUrl;

      if (!userId && !linkedinUrl) {
        console.log('⚠️ [USER_MIDDLEWARE] No userId or linkedinUrl provided, skipping user context loading');
        return next();
      }

      if (userId) {
        console.log(`🔍 [USER_MIDDLEWARE] Loading user context for userId: ${userId}`);
        const success = await userContext.ensureUserContext(userId, linkedinUrl);
        
        if (success) {
          console.log(`✅ [USER_MIDDLEWARE] User context loaded successfully: ${userId}`);
        } else {
          console.log(`⚠️ [USER_MIDDLEWARE] Failed to load user context: ${userId}`);
        }
      } else if (linkedinUrl) {
        console.log(`🔍 [USER_MIDDLEWARE] No userId provided, will create new user context for: ${linkedinUrl}`);
        // User context will be created when profile is scraped
      }

      next();
    } catch (error) {
      console.error('❌ [USER_MIDDLEWARE] Error loading user context:', error);
      next(); // Continue even if user context loading fails
    }
  }

  /**
   * Middleware to require user context
   * Returns 400 error if no user context is available
   */
  static requireUserContext(req: Request, res: Response, next: NextFunction): void {
    if (!userManager.hasCurrentUser()) {
      console.log('❌ [USER_MIDDLEWARE] User context required but not available');
      res.status(400).json({
        success: false,
        error: 'User context is required for this operation'
      });
      return;
    }

    console.log(`✅ [USER_MIDDLEWARE] User context verified: ${userManager.getCurrentUserId()}`);
    next();
  }

  /**
   * Middleware to add user context to response
   * Adds current user info to response headers or body
   */
  static addUserContextToResponse(req: Request, res: Response, next: NextFunction): void {
    const currentUser = userManager.getCurrentUser();
    
    if (currentUser) {
      // Add user info to response headers
      res.set('X-User-ID', currentUser.userId);
      res.set('X-Profile-ID', currentUser.profileId || '');
      
      // Add user info to response body if it's a JSON response
      const originalJson = res.json;
      res.json = function(body: any) {
        if (body && typeof body === 'object') {
          body.userContext = {
            userId: currentUser.userId,
            profileId: currentUser.profileId,
            hasProfileData: !!currentUser.profileData,
            totalOptimizations: currentUser.totalOptimizations || 0
          };
        }
        return originalJson.call(this, body);
      };
    }

    next();
  }

  /**
   * Middleware to clear user context after request
   * Useful for cleaning up after each request
   */
  static clearUserContext(req: Request, res: Response, next: NextFunction): void {
    // Clear user context after response is sent
    res.on('finish', () => {
      userContext.clearCurrentUserContext();
      console.log('🧹 [USER_MIDDLEWARE] User context cleared after request');
    });

    next();
  }

  /**
   * Get current user context info for debugging
   */
  static getUserContextInfo(): {
    hasUser: boolean;
    userId: string | null;
    profileId: string | null;
    cacheStats: any;
  } {
    const currentUser = userManager.getCurrentUser();
    return {
      hasUser: !!currentUser,
      userId: currentUser?.userId || null,
      profileId: currentUser?.profileId || null,
      cacheStats: userManager.getCacheStats()
    };
  }
}

// Export convenience functions
export const loadUserContext = UserContextMiddleware.loadUserContext;
export const requireUserContext = UserContextMiddleware.requireUserContext;
export const addUserContextToResponse = UserContextMiddleware.addUserContextToResponse;
export const clearUserContext = UserContextMiddleware.clearUserContext;
export const getUserContextInfo = UserContextMiddleware.getUserContextInfo;
