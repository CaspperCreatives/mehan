import { OptimizedContentService } from '../services/optimized-content.service';
import { IOptimizedContent, ICompleteUserObject } from '../repositories/optimized-content.repository';

export class OptimizedContentController {
  private service: OptimizedContentService;

  constructor() {
    this.service = new OptimizedContentService();
  }

  /**
   * Save optimized content
   * @param request - The request data
   * @returns Promise<object> - Response object
   */
  async saveOptimizedContent(request: {
    userId: string;
    profileId?: string;
    linkedinUrl?: string;
    section: string;
    originalContent: string;
    optimizedContent: string;
    sectionType?: string;
    metadata?: {
      wordCount?: number;
      characterCount?: number;
      optimizationScore?: number;
      language?: string;
    };
  }): Promise<{
    success: boolean;
    data?: IOptimizedContent;
    error?: string;
  }> {
    try {
      console.log('🔍 [BACKEND] Saving optimized content for user:', request.userId);
      
      const contentData: Omit<IOptimizedContent, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: request.userId,
        profileId: request.profileId,
        linkedinUrl: request.linkedinUrl,
        section: request.section,
        originalContent: request.originalContent,
        optimizedContent: request.optimizedContent,
        sectionType: request.sectionType,
        metadata: request.metadata
      };

      const savedContent = await this.service.saveOptimizedContent(contentData);
      
      return {
        success: true,
        data: savedContent
      };
    } catch (error) {
      console.error('❌ [BACKEND] Error in saveOptimizedContent controller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get optimized content
   * @param userId - The user ID
   * @param section - Optional section filter
   * @returns Promise<object> - Response object
   */
  async getOptimizedContent(userId: string, section?: string): Promise<{
    success: boolean;
    data?: IOptimizedContent[];
    error?: string;
  }> {
    try {
      console.log('🔍 [BACKEND] Getting optimized content for user:', userId, section ? `section: ${section}` : '');
      
      const content = await this.service.getOptimizedContent(userId, section);
      
      return {
        success: true,
        data: content
      };
    } catch (error) {
      console.error('❌ [BACKEND] Error in getOptimizedContent controller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get optimized content by ID
   * @param contentId - The content ID
   * @returns Promise<object> - Response object
   */
  async getOptimizedContentById(contentId: string): Promise<{
    success: boolean;
    data?: IOptimizedContent | null;
    error?: string;
  }> {
    try {
      console.log('🔍 [BACKEND] Getting optimized content by ID:', contentId);
      
      const content = await this.service.getOptimizedContentById(contentId);
      
      return {
        success: true,
        data: content
      };
    } catch (error) {
      console.error('❌ [BACKEND] Error in getOptimizedContentById controller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete optimized content
   * @param contentId - The content ID
   * @returns Promise<object> - Response object
   */
  async deleteOptimizedContent(contentId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('🔍 [BACKEND] Deleting optimized content:', contentId);
      
      const success = await this.service.deleteOptimizedContent(contentId);
      
      return {
        success
      };
    } catch (error) {
      console.error('❌ [BACKEND] Error in deleteOptimizedContent controller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user content statistics
   * @param userId - The user ID
   * @returns Promise<object> - Response object
   */
  async getUserContentStats(userId: string): Promise<{
    success: boolean;
    data?: {
      totalContent: number;
      sectionsCount: { [section: string]: number };
      lastOptimizedAt?: any;
    };
    error?: string;
  }> {
    try {
      console.log('🔍 [BACKEND] Getting content stats for user:', userId);
      
      const stats = await this.service.getUserContentStats(userId);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ [BACKEND] Error in getUserContentStats controller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Save complete user object
   * @param userObject - The complete user object data
   * @returns Promise<object> - Response object
   */
  async saveCompleteUserObject(userObject: Omit<ICompleteUserObject, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    data?: ICompleteUserObject;
    error?: string;
  }> {
    try {
      console.log('🔍 [BACKEND] Saving complete user object for user:', userObject.userId);
      
      const savedUserObject = await this.service.saveCompleteUserObject(userObject);
      
      return {
        success: true,
        data: savedUserObject
      };
    } catch (error) {
      console.error('❌ [BACKEND] Error in saveCompleteUserObject controller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get complete user object
   * @param userId - The user ID
   * @returns Promise<object> - Response object
   */
  async getCompleteUserObject(userId: string): Promise<{
    success: boolean;
    data?: ICompleteUserObject | null;
    error?: string;
  }> {
    try {
      console.log('🔍 [BACKEND] Getting complete user object for user:', userId);
      
      const userObject = await this.service.getCompleteUserObject(userId);
      
      return {
        success: true,
        data: userObject
      };
    } catch (error) {
      console.error('❌ [BACKEND] Error in getCompleteUserObject controller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user object statistics
   * @param userId - The user ID
   * @returns Promise<object> - Response object
   */
  async getUserObjectStats(userId: string): Promise<{
    success: boolean;
    data?: {
      totalOptimizations: number;
      sectionsCount: { [section: string]: number };
      lastOptimizedAt?: string;
      profileDataExists: boolean;
    };
    error?: string;
  }> {
    try {
      console.log('🔍 [BACKEND] Getting user object stats for user:', userId);
      
      const stats = await this.service.getUserObjectStats(userId);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ [BACKEND] Error in getUserObjectStats controller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
