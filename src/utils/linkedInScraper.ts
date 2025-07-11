export interface LinkedInProfile {
  name: string;
  headline: string;
  experience: Array<{
    title: string;
    company: string;
    dateRange: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    dateRange: string;
  }>;
  skills: string[];
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function scrapeLinkedInProfile(profileUrl: string): Promise<LinkedInProfile> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // First check if the backend is running
      const healthCheck = await fetch('http://localhost:3000/health');
      if (!healthCheck.ok) {
        throw new Error('Backend server is not running');
      }

      const response = await fetch('http://localhost:3000/api/scrape-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to scrape profile');
      }

      return await response.json();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error as Error;
      
      if (attempt < MAX_RETRIES) {
        await wait(RETRY_DELAY * attempt);
      }
    }
  }

  throw lastError || new Error('Failed to scrape profile after multiple attempts');
} 