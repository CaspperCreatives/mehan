import { UserManager } from './userManager';

const REFRESH_LIMIT = 2;

export class RefreshLimiter {
  private static getToday(): string {
    return new Date().toDateString();
  }

  private static async getRefreshData(): Promise<{
    remainingRefreshes: number;
    lastRefreshDate: string;
    totalRefreshes: number;
  }> {
    try {
      const userSession = await UserManager.getCurrentUserSession();
      
      if (!userSession?.refreshLimit) {
        // Initialize with default values if not set
        return {
          remainingRefreshes: REFRESH_LIMIT,
          lastRefreshDate: this.getToday(),
          totalRefreshes: 0
        };
      }
      
      return userSession.refreshLimit;
    } catch (error) {
      return {
        remainingRefreshes: REFRESH_LIMIT,
        lastRefreshDate: this.getToday(),
        totalRefreshes: 0
      };
    }
  }

  static async canRefresh(): Promise<{ canRefresh: boolean; remaining: number; resetTime: string }> {
    const today = this.getToday();
    const data = await this.getRefreshData();

    // Reset count if it's a new day
    if (data.lastRefreshDate !== today) {
      await this.updateRefreshData({
        remainingRefreshes: REFRESH_LIMIT,
        lastRefreshDate: today,
        totalRefreshes: 0
      });
      return {
        canRefresh: true,
        remaining: REFRESH_LIMIT,
        resetTime: this.getNextResetTime()
      };
    }

    return {
      canRefresh: data.remainingRefreshes > 0,
      remaining: data.remainingRefreshes,
      resetTime: this.getNextResetTime()
    };
  }

  static async incrementRefreshCount(): Promise<void> {
    try {
      const userSession = await UserManager.getCurrentUserSession();
      
      if (!userSession) {
        return;
      }

      const today = this.getToday();
      const currentRefreshLimit = userSession.refreshLimit || {
        remainingRefreshes: REFRESH_LIMIT,
        lastRefreshDate: today,
        totalRefreshes: 0
      };

      let updatedRefreshLimit;
      
      if (currentRefreshLimit.lastRefreshDate !== today) {
        // New day, reset count
        updatedRefreshLimit = {
          remainingRefreshes: REFRESH_LIMIT - 1,
          lastRefreshDate: today,
          totalRefreshes: 1
        };
      } else {
        // Same day, decrement remaining and increment total
        updatedRefreshLimit = {
          remainingRefreshes: Math.max(0, currentRefreshLimit.remainingRefreshes - 1),
          lastRefreshDate: today,
          totalRefreshes: currentRefreshLimit.totalRefreshes + 1
        };
      }

      // Update the user session
      const updatedSession = {
        ...userSession,
        refreshLimit: updatedRefreshLimit,
        lastActiveAt: new Date().toISOString()
      };

      UserManager['currentUserSession'] = updatedSession;
    } catch (error) {
      // Silent error handling
    }
  }

  private static async updateRefreshData(refreshData: {
    remainingRefreshes: number;
    lastRefreshDate: string;
    totalRefreshes: number;
  }): Promise<void> {
    try {
      const userSession = await UserManager.getCurrentUserSession();
      
      if (!userSession) {
        return;
      }

      // Update the user session
      const updatedSession = {
        ...userSession,
        refreshLimit: refreshData,
        lastActiveAt: new Date().toISOString()
      };

      UserManager['currentUserSession'] = updatedSession;
    } catch (error) {
      // Silent error handling
    }
  }

  private static getNextResetTime(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toLocaleString();
  }

  static async getRemainingRefreshes(): Promise<number> {
    const { remaining } = await this.canRefresh();
    return remaining;
  }

  static async resetDailyLimit(): Promise<void> {
    await this.updateRefreshData({
      remainingRefreshes: REFRESH_LIMIT,
      lastRefreshDate: this.getToday(),
      totalRefreshes: 0
    });
  }
} 