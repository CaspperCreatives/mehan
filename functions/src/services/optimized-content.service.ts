import { logger } from 'firebase-functions';
import { OptimizedContentRepository, IOptimizedContent, CompleteUserObjectRepository, ICompleteUserObject } from '../repositories/optimized-content.repository';

export class OptimizedContentService {
  private repository: OptimizedContentRepository;
  private completeUserRepository: CompleteUserObjectRepository;

  constructor() {
    this.repository = new OptimizedContentRepository();
    this.completeUserRepository = new CompleteUserObjectRepository();
  }

  /**
   * Save optimized content
   * @param contentData - The optimized content data
   * @returns Promise<IOptimizedContent> - The saved content
   */
  async saveOptimizedContent(contentData: Omit<IOptimizedContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<IOptimizedContent> {
    try {
      // Validate required fields
      if (!contentData.userId) {
        throw new Error('User ID is required');
      }
      if (!contentData.section) {
        throw new Error('Section is required');
      }
      if (!contentData.originalContent) {
        throw new Error('Original content is required');
      }
      if (!contentData.optimizedContent) {
        throw new Error('Optimized content is required');
      }

      // Calculate metadata if not provided
      if (!contentData.metadata) {
        contentData.metadata = this.calculateContentMetadata(contentData.optimizedContent);
      }

      const savedContent = await this.repository.saveOptimizedContent(contentData);
      
      
      return savedContent;
    } catch (error) {
      console.error('❌ [BACKEND] Error saving optimized content:', error);
      throw error;
    }
  }

  /**
   * Get optimized content by user ID
   * @param userId - The user ID
   * @param section - Optional section filter
   * @returns Promise<IOptimizedContent[]> - Array of optimized content
   */
  async getOptimizedContent(userId: string, section?: string): Promise<IOptimizedContent[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      let content: IOptimizedContent[];
      
      if (section) {
        content = await this.repository.findByUserIdAndSection(userId, section);
      } else {
        content = await this.repository.findByUserId(userId);
      }

      
      return content;
    } catch (error) {
      console.error('❌ [BACKEND] Error getting optimized content:', error);
      throw error;
    }
  }

  /**
   * Get optimized content by ID
   * @param contentId - The content ID
   * @returns Promise<IOptimizedContent | null> - The optimized content or null if not found
   */
  async getOptimizedContentById(contentId: string): Promise<IOptimizedContent | null> {
    try {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      const content = await this.repository.getById(contentId);
      
      if (content) {
      } else {
      }
      
      return content;
    } catch (error) {
      console.error('❌ [BACKEND] Error getting optimized content by ID:', error);
      throw error;
    }
  }

  /**
   * Delete optimized content
   * @param contentId - The content ID
   * @returns Promise<boolean> - Success status
   */
  async deleteOptimizedContent(contentId: string): Promise<boolean> {
    try {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      const success = await this.repository.deleteOptimizedContent(contentId);
      
      if (success) {
      } else {
      }
      
      return success;
    } catch (error) {
      console.error('❌ [BACKEND] Error deleting optimized content:', error);
      throw error;
    }
  }

  /**
   * Get user content statistics
   * @param userId - The user ID
   * @returns Promise<object> - Statistics object
   */
  async getUserContentStats(userId: string): Promise<{
    totalContent: number;
    sectionsCount: { [section: string]: number };
    lastOptimizedAt?: any;
  }> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const stats = await this.repository.getUserContentStats(userId);
      
      
      return stats;
    } catch (error) {
      console.error('❌ [BACKEND] Error getting user content stats:', error);
      throw error;
    }
  }

  /**
   * Calculate content metadata
   * @param content - The content to analyze
   * @returns Object with metadata
   */
  private calculateContentMetadata(content: string): {
    wordCount: number;
    characterCount: number;
    language?: string;
  } {
    const wordCount = content.trim().split(/\s+/).length;
    const characterCount = content.length;
    
    // Simple language detection
    const language = this.detectLanguage(content);
    
    return {
      wordCount,
      characterCount,
      language
    };
  }

  /**
   * Save complete user object
   * @param userObject - The complete user object data
   * @returns Promise<ICompleteUserObject> - The saved user object
   */
  async saveCompleteUserObject(userObject: Omit<ICompleteUserObject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICompleteUserObject> {
    try {
      if (!userObject.userId) {
        throw new Error('User ID is required');
      }

      const savedUserObject = await this.completeUserRepository.saveOrUpdateCompleteUserObject(userObject);
      return savedUserObject;
    } catch (error) {
      logger.error('❌ [BACKEND] Error saving complete user object:', error);
      throw error;
    }
  }

  /**
   * Get complete user object by user ID
   * @param userId - The user ID
   * @returns Promise<ICompleteUserObject | null> - The complete user object or null
   */
  async getCompleteUserObject(userId: string): Promise<ICompleteUserObject | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const userObject = await this.completeUserRepository.findByUserId(userId);
      
      if (userObject) {
      } else {
      }
      
      return userObject;
    } catch (error) {
      console.error('❌ [BACKEND] Error getting complete user object:', error);
      throw error;
    }
  }

  /**
   * Get user object statistics
   * @param userId - The user ID
   * @returns Promise<object> - Statistics object
   */
  async getUserObjectStats(userId: string): Promise<{
    totalOptimizations: number;
    sectionsCount: { [section: string]: number };
    lastOptimizedAt?: string;
    profileDataExists: boolean;
  }> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const stats = await this.completeUserRepository.getUserObjectStats(userId);
      
      
      return stats;
    } catch (error) {
      console.error('❌ [BACKEND] Error getting user object stats:', error);
      throw error;
    }
  }

  /**
   * Find user by LinkedIn URL
   * @param linkedinUrl - The LinkedIn URL to search for
   * @returns Promise<ICompleteUserObject | null> - The user object or null
   */
  async findUserByLinkedInUrl(linkedinUrl: string): Promise<ICompleteUserObject | null> {
    try {
      if (!linkedinUrl) {
        throw new Error('LinkedIn URL is required');
      }

      const userObject = await this.completeUserRepository.findByLinkedInUrl(linkedinUrl);
      
      if (userObject) {
      } else {
      }
      
      return userObject;
    } catch (error) {
      console.error('❌ [BACKEND] Error finding user by LinkedIn URL:', error);
      throw error;
    }
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
