import * as admin from 'firebase-admin';
import { FirebaseRepository } from './firebase.repository';

export interface ILinkedInProfile {
  id?: string;
  url: string;
  data: any;
  timestamp: string;
  profileId: string;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

export class ProfileRepository extends FirebaseRepository<ILinkedInProfile> {
  constructor() {
    super('linkedin_profiles');
  }

  /**
   * Find profile by profile ID (extracted from LinkedIn URL)
   */
  async findByProfileId(profileId: string): Promise<ILinkedInProfile | null> {
    try {
      const query = this.db.collection(this.collectionName)
        .where('profileId', '==', profileId)
        .limit(1);
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as ILinkedInProfile;
    } catch (error) {
      throw new Error(`Failed to find profile by ID: ${error}`);
    }
  }

  /**
   * Find profile by LinkedIn URL
   */
  async findByUrl(url: string): Promise<ILinkedInProfile | null> {
    try {
      const query = this.db.collection(this.collectionName)
        .where('url', '==', url)
        .limit(1);
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as ILinkedInProfile;
    } catch (error) {
      throw new Error(`Failed to find profile by URL: ${error}`);
    }
  }

  /**
   * Save or update profile data
   */
  async saveProfile(profileData: Omit<ILinkedInProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ILinkedInProfile> {
    try {
      // Fallback to regular Date if admin.firestore.Timestamp.now() is not available
      let now: any;
      try {
        now = admin.firestore.Timestamp.now();
      } catch (timestampError) {
        console.warn('🔍 [BACKEND DEBUG] admin.firestore.Timestamp.now() not available, using regular Date:', timestampError);
        now = new Date();
      }
      
      const docData = {
        ...profileData,
        createdAt: now,
        updatedAt: now,
      };

      // Check if profile already exists
      const existingProfile = await this.findByProfileId(profileData.profileId);
      
      if (existingProfile && existingProfile.id) {
        // Update existing profile
        await this.db.collection(this.collectionName).doc(existingProfile.id).update({
          ...docData,
          updatedAt: now,
        });
        
        return {
          ...existingProfile,
          ...docData,
          updatedAt: now,
        };
      } else {
        // Create new profile
        const docRef = await this.db.collection(this.collectionName).add(docData);
        const savedDoc = await docRef.get();
        
        return {
          id: docRef.id,
          ...savedDoc.data(),
        } as ILinkedInProfile;
      }
    } catch (error) {
      throw new Error(`Failed to save profile: ${error}`);
    }
  }

  /**
   * Delete profile by profile ID
   */
  async deleteByProfileId(profileId: string): Promise<boolean> {
    try {
      const profile = await this.findByProfileId(profileId);
      
      if (!profile || !profile.id) {
        return false;
      }
      
      await this.db.collection(this.collectionName).doc(profile.id).delete();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete profile: ${error}`);
    }
  }

  /**
   * Check if profile exists and is valid (less than 24 hours old)
   */
  async isProfileValid(profileId: string): Promise<{ isValid: boolean; profile?: ILinkedInProfile }> {
    try {
      const profile = await this.findByProfileId(profileId);
      
      if (!profile) {
        return { isValid: false };
      }
      
      const cacheTime = new Date(profile.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60);
      const isValid = hoursDiff < 24;
      
      return { isValid, profile };
    } catch (error) {
      throw new Error(`Failed to check profile validity: ${error}`);
    }
  }
}
