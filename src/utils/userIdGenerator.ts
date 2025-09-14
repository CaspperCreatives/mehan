/**
 * Utility functions for generating consistent user IDs across the application
 * This matches the backend implementation to ensure consistency
 */

/**
 * Generate a consistent user ID based on LinkedIn profile information
 * @param profileId - The LinkedIn profile ID
 * @param linkedinUrl - The LinkedIn profile URL
 * @returns string - A consistent user ID
 */
export function generateUserId(profileId: string, linkedinUrl: string): string {
  // Extract the username from the LinkedIn URL (the part after the last slash)
  const username = linkedinUrl.split('/').pop() || 'unknown';
  
  // Generate a consistent user ID using profile ID and username
  return `user_${profileId || 'unknown'}_${username}`;
}

/**
 * Extract profile ID from various possible fields in profile data
 * @param profileData - The profile data object
 * @returns string | null - The profile ID or null if not found
 */
export function extractProfileId(profileData: any): string | null {
  return profileData?.profileId || 
         profileData?.id || 
         profileData?.publicIdentifier || 
         null;
}

/**
 * Normalize LinkedIn URL to ensure consistency
 * @param linkedinUrl - The LinkedIn URL
 * @returns string - The normalized LinkedIn URL
 */
export function normalizeLinkedInUrl(linkedinUrl: string): string {
  // Remove trailing slash and normalize
  return linkedinUrl.replace(/\/$/, '');
}
