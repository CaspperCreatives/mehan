/**
 * Optimization Limiter
 * Limits the total number of optimization trials to 1 across all sections
 * Uses database user object instead of Chrome storage
 */

import { UserManager } from './userManager';

const OPTIMIZATION_LIMIT = 1;

export class OptimizationLimiter {
  private static async getOptimizationData(): Promise<{
    remainingOptimizations: number;
    hasOptimized: boolean;
    optimizedSection?: string;
    optimizedAt?: string;
  }> {
    try {
      const userSession = await UserManager.getCurrentUserSession();
      if (!userSession?.optimizationLimit) {
        return {
          remainingOptimizations: OPTIMIZATION_LIMIT,
          hasOptimized: false,
          optimizedSection: undefined,
          optimizedAt: undefined
        };
      }
      return userSession.optimizationLimit;
    } catch (error) {
      return {
        remainingOptimizations: OPTIMIZATION_LIMIT,
        hasOptimized: false,
        optimizedSection: undefined,
        optimizedAt: undefined
      };
    }
  }

  /**
   * Check if user can still optimize content
   * @returns Promise<{ canOptimize: boolean; hasOptimized: boolean; optimizedSection?: string; optimizedAt?: string; remainingOptimizations: number }>
   */
  static async canOptimize(): Promise<{ 
    canOptimize: boolean; 
    hasOptimized: boolean; 
    optimizedSection?: string; 
    optimizedAt?: string;
    remainingOptimizations: number;
  }> {
    const data = await this.getOptimizationData();
    
    return {
      canOptimize: data.remainingOptimizations > 0,
      hasOptimized: data.hasOptimized,
      optimizedSection: data.optimizedSection || undefined,
      optimizedAt: data.optimizedAt || undefined,
      remainingOptimizations: data.remainingOptimizations
    };
  }

  /**
   * Force check optimization limit from database (bypasses session cache)
   * @returns Promise<{ canOptimize: boolean; hasOptimized: boolean; optimizedSection?: string; optimizedAt?: string; remainingOptimizations: number }>
   */
  static async canOptimizeFromDatabase(): Promise<{ 
    canOptimize: boolean; 
    hasOptimized: boolean; 
    optimizedSection?: string; 
    optimizedAt?: string;
    remainingOptimizations: number;
  }> {
    try {
      // Get current user session to get userId
      const userSession = await UserManager.getCurrentUserSession();
      if (!userSession?.userId) {
        // Fallback to session data if no userId
        return await this.canOptimize();
      }

      // Import the optimized content service to fetch from database
      const { OptimizedContentService } = await import('../services/optimizedContentService');
      const service = new OptimizedContentService();
      
      // Get complete user object from database
      const completeUserObject = await service.getCompleteUserObject(userSession.userId);
      
      if (completeUserObject?.optimizationLimit) {
        const optimizationLimit = completeUserObject.optimizationLimit;
        
        return {
          canOptimize: optimizationLimit.remainingOptimizations > 0,
          hasOptimized: optimizationLimit.hasOptimized,
          optimizedSection: optimizationLimit.optimizedSection || undefined,
          optimizedAt: optimizationLimit.optimizedAt || undefined,
          remainingOptimizations: optimizationLimit.remainingOptimizations
        };
      }
      
      // Fallback to session data if database fetch fails
      return await this.canOptimize();
    } catch (error) {
      // Fallback to session data if database fetch fails
      return await this.canOptimize();
    }
  }

  /**
   * Mark that user has optimized content
   * @param section - The section that was optimized
   */
  static async markAsOptimized(section: string): Promise<void> {
    try {
      const userSession = await UserManager.getCurrentUserSession();
      
      if (!userSession) {
        return;
      }

      // Update the optimization limit in the user session
      const updatedOptimizationLimit = {
        remainingOptimizations: 0,
        hasOptimized: true,
        optimizedSection: section,
        optimizedAt: new Date().toISOString()
      };

      // Update the user session
      const updatedSession = {
        ...userSession,
        optimizationLimit: updatedOptimizationLimit,
        lastActiveAt: new Date().toISOString()
      };

      UserManager['currentUserSession'] = updatedSession;

      // Save the updated user session to database
      try {
        const { OptimizedContentService } = await import('../services/optimizedContentService');
        const service = new OptimizedContentService();
        await service.saveCompleteUserObject(updatedSession);
      } catch (dbError) {
        console.error('❌ Error saving optimization limit to database:', dbError);
      }
    } catch (error) {
      console.error('❌ Error marking as optimized:', error);
    }
  }

  /**
   * Reset optimization limit (for testing purposes)
   */
  static async resetLimit(): Promise<void> {
    try {
      const userSession = await UserManager.getCurrentUserSession();
      
      if (!userSession) {
        return;
      }

      // Reset the optimization limit in the user session
      const resetOptimizationLimit = {
        remainingOptimizations: OPTIMIZATION_LIMIT,
        hasOptimized: false,
        optimizedSection: undefined,
        optimizedAt: undefined
      };

      // Update the user session
      const updatedSession = {
        ...userSession,
        optimizationLimit: resetOptimizationLimit,
        lastActiveAt: new Date().toISOString()
      };

      UserManager['currentUserSession'] = updatedSession;
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Get optimization status info
   * @returns Promise<{ hasOptimized: boolean; optimizedSection?: string; optimizedAt?: string; remainingOptimizations: number }>
   */
  static async getOptimizationStatus(): Promise<{ 
    hasOptimized: boolean; 
    optimizedSection?: string; 
    optimizedAt?: string;
    remainingOptimizations: number;
  }> {
    const data = await this.getOptimizationData();
    
    return {
      hasOptimized: data.hasOptimized,
      optimizedSection: data.optimizedSection || undefined,
      optimizedAt: data.optimizedAt || undefined,
      remainingOptimizations: data.remainingOptimizations
    };
  }
}
