import { FirebaseRepository } from './firebase.repository';
import * as admin from 'firebase-admin';

export interface IOptimizedContent {
  id?: string;
  userId: string;
  profileId?: string;
  linkedinUrl?: string;
  section: string;
  originalContent: string;
  optimizedContent: string;
  sectionType?: string;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
  metadata?: {
    wordCount?: number;
    characterCount?: number;
    optimizationScore?: number;
    language?: string;
  };
}

export interface ICompleteUserObject {
  id?: string;
  userId: string;
  profileId?: string;
  linkedinUrl?: string;
  profileData?: any;
  optimizedContent?: Array<{
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
    optimizedAt: string;
  }>;
  totalOptimizations?: number;
  lastOptimizedAt?: string;
  optimizationLimit?: {
    remainingOptimizations: number;
    hasOptimized: boolean;
    optimizedSection?: string;
    optimizedAt?: string;
  };
  refreshLimit?: {
    remainingRefreshes: number;
    lastRefreshDate: string;
    totalRefreshes: number;
  };
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

export class OptimizedContentRepository extends FirebaseRepository<IOptimizedContent> {
  constructor() {
    super('optimized_content');
  }

  /**
   * Find optimized content by user ID
   * @param userId - The user ID
   * @returns Promise<IOptimizedContent[]> - Array of optimized content
   */
  async findByUserId(userId: string): Promise<IOptimizedContent[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as IOptimizedContent[];
    } catch (error) {
      throw new Error(`Failed to find optimized content by user ID: ${error}`);
    }
  }

  /**
   * Find optimized content by user ID and section
   * @param userId - The user ID
   * @param section - The section name
   * @returns Promise<IOptimizedContent[]> - Array of optimized content
   */
  async findByUserIdAndSection(userId: string, section: string): Promise<IOptimizedContent[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where('userId', '==', userId)
        .where('section', '==', section)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as IOptimizedContent[];
    } catch (error) {
      throw new Error(`Failed to find optimized content by user ID and section: ${error}`);
    }
  }

  /**
   * Find optimized content by profile ID
   * @param profileId - The LinkedIn profile ID
   * @returns Promise<IOptimizedContent[]> - Array of optimized content
   */
  async findByProfileId(profileId: string): Promise<IOptimizedContent[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where('profileId', '==', profileId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as IOptimizedContent[];
    } catch (error) {
      throw new Error(`Failed to find optimized content by profile ID: ${error}`);
    }
  }

  /**
   * Save optimized content
   * @param contentData - The optimized content data
   * @returns Promise<IOptimizedContent> - The saved content
   */
  async saveOptimizedContent(contentData: Omit<IOptimizedContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<IOptimizedContent> {
    try {
      // Fallback to regular Date if admin.firestore.Timestamp.now() is not available
      let now: any;
      try {
        now = admin.firestore.Timestamp.now();
      } catch (timestampError) {
        now = new Date();
      }
      const docData = {
        ...contentData,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.db.collection(this.collectionName).add(docData);
      const savedDoc = await docRef.get();
      
      return {
        id: docRef.id,
        ...savedDoc.data(),
      } as IOptimizedContent;
    } catch (error) {
      throw new Error(`Failed to save optimized content: ${error}`);
    }
  }

  /**
   * Update optimized content
   * @param contentId - The content ID
   * @param contentData - The updated content data
   * @returns Promise<IOptimizedContent> - The updated content
   */
  async updateOptimizedContent(contentId: string, contentData: Partial<Omit<IOptimizedContent, 'id' | 'createdAt'>>): Promise<IOptimizedContent> {
    try {
      // Fallback to regular Date if admin.firestore.Timestamp.now() is not available
      let now: any;
      try {
        now = admin.firestore.Timestamp.now();
      } catch (timestampError) {
        now = new Date();
      }
      
      const updateData = {
        ...contentData,
        updatedAt: now,
      };

      await this.db.collection(this.collectionName).doc(contentId).update(updateData);
      
      const updatedDoc = await this.getById(contentId);
      if (!updatedDoc) {
        throw new Error(`Optimized content with ID ${contentId} not found`);
      }

      return updatedDoc;
    } catch (error) {
      throw new Error(`Failed to update optimized content: ${error}`);
    }
  }

  /**
   * Delete optimized content by ID
   * @param contentId - The content ID
   * @returns Promise<boolean> - Success status
   */
  async deleteOptimizedContent(contentId: string): Promise<boolean> {
    try {
      await this.delete(contentId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get optimized content statistics for a user
   * @param userId - The user ID
   * @returns Promise<object> - Statistics object
   */
  async getUserContentStats(userId: string): Promise<{
    totalContent: number;
    sectionsCount: { [section: string]: number };
    lastOptimizedAt?: admin.firestore.Timestamp;
  }> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where('userId', '==', userId)
        .get();

      const content = snapshot.docs.map(doc => doc.data() as IOptimizedContent);
      
      const sectionsCount: { [section: string]: number } = {};
      let lastOptimizedAt: admin.firestore.Timestamp | undefined;

      content.forEach(item => {
        sectionsCount[item.section] = (sectionsCount[item.section] || 0) + 1;
        
        if (!lastOptimizedAt || (item.createdAt && item.createdAt > lastOptimizedAt)) {
          lastOptimizedAt = item.createdAt;
        }
      });

      return {
        totalContent: content.length,
        sectionsCount,
        lastOptimizedAt
      };
    } catch (error) {
      throw new Error(`Failed to get user content stats: ${error}`);
    }
  }
}

export class CompleteUserObjectRepository extends FirebaseRepository<ICompleteUserObject> {
  constructor() {
    super('complete_user_objects');
  }

  /**
   * Find complete user object by user ID
   * @param userId - The user ID
   * @returns Promise<ICompleteUserObject | null> - The complete user object or null
   */
  async findByUserId(userId: string): Promise<ICompleteUserObject | null> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as ICompleteUserObject;
    } catch (error) {
      throw new Error(`Failed to find complete user object by user ID: ${error}`);
    }
  }

  /**
   * Find complete user object by LinkedIn URL
   * @param linkedinUrl - The LinkedIn profile URL
   * @returns Promise<ICompleteUserObject | null> - The complete user object or null
   */
  async findByLinkedInUrl(linkedinUrl: string): Promise<ICompleteUserObject | null> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where('linkedinUrl', '==', linkedinUrl)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as ICompleteUserObject;
    } catch (error) {
      throw new Error(`Failed to find complete user object by LinkedIn URL: ${error}`);
    }
  }

  /**
   * Find complete user object by profile ID
   * @param profileId - The LinkedIn profile ID
   * @returns Promise<ICompleteUserObject | null> - The complete user object or null
   */
  async findByProfileId(profileId: string): Promise<ICompleteUserObject | null> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where('profileId', '==', profileId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as ICompleteUserObject;
    } catch (error) {
      throw new Error(`Failed to find complete user object by profile ID: ${error}`);
    }
  }

  /**
   * Save or update complete user object
   * @param userObject - The complete user object data
   * @returns Promise<ICompleteUserObject> - The saved user object
   */
  async saveOrUpdateCompleteUserObject(userObject: Omit<ICompleteUserObject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICompleteUserObject> {
    try {
      // Fallback to regular Date if admin.firestore.Timestamp.now() is not available
      let now: any;
      try {
        now = admin.firestore.Timestamp.now();
      } catch (timestampError) {
        now = new Date();
      }
      
      // Check if user object already exists by LinkedIn URL first (most reliable identifier)
      let existingUser = null;
      
      if (userObject.linkedinUrl) {
        existingUser = await this.findByLinkedInUrl(userObject.linkedinUrl);
      }
      
      // If not found by LinkedIn URL, try by profile ID
      if (!existingUser && userObject.profileId) {
        existingUser = await this.findByProfileId(userObject.profileId);
      }
      
      // If still not found, try by userId as fallback
      if (!existingUser) {
        existingUser = await this.findByUserId(userObject.userId);
      }
      
      if (existingUser && existingUser.id) {
        // Update existing user object
        const updateData = {
          ...userObject,
          updatedAt: now,
        };
        
        // Filter out undefined values to prevent Firestore errors
        const filteredUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined)
        );
        
        await this.db.collection(this.collectionName).doc(existingUser.id).update(filteredUpdateData);
        
        return {
          ...existingUser,
          ...updateData,
          updatedAt: now,
        };
      } else {
        // Create new user object
        const docData = {
          ...userObject,
          createdAt: now,
          updatedAt: now,
        };

        // Filter out undefined values to prevent Firestore errors
        const filteredDocData = Object.fromEntries(
          Object.entries(docData).filter(([_, value]) => value !== undefined)
        );

        const docRef = await this.db.collection(this.collectionName).add(filteredDocData);
        const savedDoc = await docRef.get();
        
        return {
          id: docRef.id,
          ...savedDoc.data(),
        } as ICompleteUserObject;
      }
    } catch (error) {
      throw new Error(`Failed to save or update complete user object: ${error}`);
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
      const userObject = await this.findByUserId(userId);
      
      if (!userObject) {
        return {
          totalOptimizations: 0,
          sectionsCount: {},
          profileDataExists: false
        };
      }

      const optimizedContent = userObject.optimizedContent || [];
      const sectionsCount: { [section: string]: number } = {};

      optimizedContent.forEach(item => {
        sectionsCount[item.section] = (sectionsCount[item.section] || 0) + 1;
      });

      return {
        totalOptimizations: optimizedContent.length,
        sectionsCount,
        lastOptimizedAt: userObject.lastOptimizedAt,
        profileDataExists: !!userObject.profileData
      };
    } catch (error) {
      throw new Error(`Failed to get user object stats: ${error}`);
    }
  }
}
