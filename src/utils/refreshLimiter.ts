interface RefreshData {
  count: number;
  date: string;
}

const REFRESH_LIMIT = 2;
const STORAGE_KEY = 'linkedin_profile_refresh_data';

export class RefreshLimiter {
  private static getToday(): string {
    return new Date().toDateString();
  }

  private static async getRefreshData(): Promise<RefreshData> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        const data = result[STORAGE_KEY] as RefreshData;
        if (!data) {
          resolve({ count: 0, date: this.getToday() });
        } else {
          resolve(data);
        }
      });
    });
  }

  private static async setRefreshData(data: RefreshData): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
    });
  }

  static async canRefresh(): Promise<{ canRefresh: boolean; remaining: number; resetTime: string }> {
    const today = this.getToday();
    const data = await this.getRefreshData();

    // Reset count if it's a new day
    if (data.date !== today) {
      await this.setRefreshData({ count: 0, date: today });
      return {
        canRefresh: true,
        remaining: REFRESH_LIMIT,
        resetTime: this.getNextResetTime()
      };
    }

    const remaining = Math.max(0, REFRESH_LIMIT - data.count);
    return {
      canRefresh: data.count < REFRESH_LIMIT,
      remaining,
      resetTime: this.getNextResetTime()
    };
  }

  static async incrementRefreshCount(): Promise<void> {
    const today = this.getToday();
    const data = await this.getRefreshData();

    if (data.date !== today) {
      // New day, reset count
      await this.setRefreshData({ count: 1, date: today });
    } else {
      // Same day, increment count
      await this.setRefreshData({ count: data.count + 1, date: today });
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
    await this.setRefreshData({ count: 0, date: this.getToday() });
  }
} 