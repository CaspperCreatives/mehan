/**
 * Optimized Content Service
 * Handles saving and retrieving optimized content from the database
 */

import { UserManager, UserSession, OptimizedContentData } from '../utils/userManager';

export interface OptimizedContent {
  id?: string;
  userId: string;
  profileId?: string;
  linkedinUrl?: string;
  section: string;
  originalContent: string;
  optimizedContent: string;
  sectionType?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: {
    wordCount?: number;
    characterCount?: number;
    optimizationScore?: number;
    language?: string;
  };
}

export interface SaveOptimizedContentRequest {
  section: string;
  originalContent: string;
  optimizedContent: string;
  sectionType?: string;
  profileId?: string;
  linkedinUrl?: string;
  metadata?: {
    wordCount?: number;
    characterCount?: number;
    optimizationScore?: number;
    language?: string;
  };
}

export class OptimizedContentService {
  private baseUrl: string;

  constructor() {
    // Use the Firebase Functions URL for the backend
    this.baseUrl = process.env.BASE_URL || '';
    
    // Validate that we have a proper API URL
    if (!this.baseUrl) {
      console.error('❌ BASE_URL is not configured. Please set BASE_URL in your environment variables.');
      throw new Error('BASE_URL is not configured. Please set BASE_URL in your environment variables.');
    }
    
    console.log('🔗 Using API URL:', this.baseUrl);
  }

  /**
   * Save optimized content to the database
   * @param contentData - The optimized content data to save
   * @returns Promise<OptimizedContent> - The saved content with ID
   */
  async saveOptimizedContent(contentData: SaveOptimizedContentRequest): Promise<OptimizedContent> {
    try {
      // Get user ID
      const userId = await UserManager.getUserIdForDatabase();
      
      // Get current user session for additional context
      const userSession = await UserManager.getCurrentUserSession();
      
      const payload = {
        userId,
        profileId: contentData.profileId || userSession?.profileId,
        linkedinUrl: contentData.linkedinUrl || userSession?.linkedinUrl,
        section: contentData.section,
        originalContent: contentData.originalContent,
        optimizedContent: contentData.optimizedContent,
        sectionType: contentData.sectionType,
        metadata: contentData.metadata || {}
      };

      const response = await fetch(`${this.baseUrl}/saveOptimizedContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to save optimized content: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save optimized content');
      }

      return result.data;
    } catch (error) {
      console.error('Error saving optimized content:', error);
      throw error;
    }
  }

  /**
   * Get optimized content for a user
   * @param userId - Optional user ID, uses current user if not provided
   * @param section - Optional section filter
   * @returns Promise<OptimizedContent[]> - Array of optimized content
   */
  async getOptimizedContent(userId?: string, section?: string): Promise<OptimizedContent[]> {
    try {
      const targetUserId = userId || await UserManager.getUserIdForDatabase();
      
      const params = new URLSearchParams({
        userId: targetUserId
      });
      
      if (section) {
        params.append('section', section);
      }

      const response = await fetch(`${this.baseUrl}/getOptimizedContent?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get optimized content: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get optimized content');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error getting optimized content:', error);
      throw error;
    }
  }

  /**
   * Get optimized content by ID
   * @param contentId - The content ID
   * @returns Promise<OptimizedContent | null> - The optimized content or null if not found
   */
  async getOptimizedContentById(contentId: string): Promise<OptimizedContent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/getOptimizedContentById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentId })
      });

      if (!response.ok) {
        throw new Error(`Failed to get optimized content by ID: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Error getting optimized content by ID:', error);
      return null;
    }
  }

  /**
   * Delete optimized content
   * @param contentId - The content ID to delete
   * @returns Promise<boolean> - Success status
   */
  async deleteOptimizedContent(contentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/deleteOptimizedContent`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentId })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete optimized content: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error deleting optimized content:', error);
      return false;
    }
  }

  /**
   * Update user session with profile information when content is saved
   * @param profileId - LinkedIn profile ID
   * @param linkedinUrl - LinkedIn profile URL
   */
  async updateUserSessionWithProfile(profileId: string, linkedinUrl: string): Promise<void> {
    try {
      await UserManager.updateUserSessionWithProfile(profileId, linkedinUrl);
    } catch (error) {
      console.error('Error updating user session with profile:', error);
    }
  }

  /**
   * Save complete user object with all optimized content
   * @param userSession - The complete user session object
   * @returns Promise<boolean> - Success status
   */
  async saveCompleteUserObject(userSession: UserSession): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/saveCompleteUserObject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSession)
      });

      if (!response.ok) {
        throw new Error(`Failed to save complete user object: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save complete user object');
      }

      return true;
    } catch (error) {
      console.error('❌ Error saving complete user object:', error);
      return false;
    }
  }

  /**
   * Get complete user object by user ID
   * @param userId - The user ID
   * @returns Promise<UserSession | null> - The complete user session or null
   */
  async getCompleteUserObject(userId: string): Promise<UserSession | null> {
    try {
      const response = await fetch(`${this.baseUrl}/getCompleteUserObject?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get complete user object: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('❌ Error getting complete user object:', error);
      return null;
    }
  }

  /**
   * Add optimized content to user session and save to database
   * @param optimizedContent - The optimized content data
   * @param profileData - Complete profile data
   * @param profileId - LinkedIn profile ID
   * @param linkedinUrl - LinkedIn profile URL
   * @returns Promise<boolean> - Success status
   */
  async addOptimizedContentToUserSession(
    optimizedContent: OptimizedContentData,
    profileData?: any,
    profileId?: string,
    linkedinUrl?: string
  ): Promise<boolean> {
    try {
      // Add to local session
      await UserManager.addOptimizedContentToSession(optimizedContent);
      
      // Update profile data if provided
      if (profileData && profileId && linkedinUrl) {
        await UserManager.updateUserSessionWithCompleteProfile(profileData, profileId, linkedinUrl);
      }
      
      // Save individual optimized content to database
      try {
        const individualContentData = {
          section: optimizedContent.section,
          originalContent: optimizedContent.originalContent,
          optimizedContent: optimizedContent.optimizedContent,
          sectionType: optimizedContent.sectionType,
          profileId: profileId || profileData?.profileId,
          linkedinUrl: linkedinUrl || profileData?.inputUrl || profileData?.linkedinUrl,
          metadata: optimizedContent.metadata
        };
        
        await this.saveOptimizedContent(individualContentData);
      } catch (individualSaveError) {
        // Continue with complete user object saving even if individual save fails
      }
      
      // Get the updated complete user session
      const completeUserSession = await UserManager.getCurrentUserSession();
      
      if (completeUserSession) {
        // Save complete user object to database
        const saved = await this.saveCompleteUserObject(completeUserSession);
        return saved;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error adding optimized content to user session:', error);
      return false;
    }
  }

  /**
   * Calculate content metadata
   * @param content - The content to analyze
   * @returns Object with metadata
   */
  calculateContentMetadata(content: string): {
    wordCount: number;
    characterCount: number;
    language?: string;
  } {
    const wordCount = content.trim().split(/\s+/).length;
    const characterCount = content.length;
    
    // Simple language detection (basic implementation)
    const language = this.detectLanguage(content);
    
    return {
      wordCount,
      characterCount,
      language
    };
  }

  /**
   * Simple language detection
   * @param content - The content to analyze
   * @returns string - Detected language code
   */
  private detectLanguage(content: string): string {
    // Basic language detection based on character patterns
    const arabicPattern = /[\u0600-\u06FF]/;
    const englishPattern = /[a-zA-Z]/;
    
    if (arabicPattern.test(content)) {
      return 'ar';
    } else if (englishPattern.test(content)) {
      return 'en';
    }
    
    return 'unknown';
  }
}
