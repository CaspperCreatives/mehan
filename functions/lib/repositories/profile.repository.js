"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRepository = void 0;
const admin = __importStar(require("firebase-admin"));
const firebase_repository_1 = require("./firebase.repository");
class ProfileRepository extends firebase_repository_1.FirebaseRepository {
    constructor() {
        super('linkedin_profiles');
    }
    /**
     * Find profile by profile ID (extracted from LinkedIn URL)
     */
    async findByProfileId(profileId) {
        try {
            const query = this.db.collection(this.collectionName)
                .where('profileId', '==', profileId)
                .limit(1);
            const snapshot = await query.get();
            if (snapshot.empty) {
                return null;
            }
            const doc = snapshot.docs[0];
            return Object.assign({ id: doc.id }, doc.data());
        }
        catch (error) {
            throw new Error(`Failed to find profile by ID: ${error}`);
        }
    }
    /**
     * Find profile by LinkedIn URL
     */
    async findByUrl(url) {
        try {
            const query = this.db.collection(this.collectionName)
                .where('url', '==', url)
                .limit(1);
            const snapshot = await query.get();
            if (snapshot.empty) {
                return null;
            }
            const doc = snapshot.docs[0];
            return Object.assign({ id: doc.id }, doc.data());
        }
        catch (error) {
            throw new Error(`Failed to find profile by URL: ${error}`);
        }
    }
    /**
     * Save or update profile data
     */
    async saveProfile(profileData) {
        try {
            // Fallback to regular Date if admin.firestore.Timestamp.now() is not available
            let now;
            try {
                now = admin.firestore.Timestamp.now();
            }
            catch (timestampError) {
                console.warn('🔍 [BACKEND DEBUG] admin.firestore.Timestamp.now() not available, using regular Date:', timestampError);
                now = new Date();
            }
            const docData = Object.assign(Object.assign({}, profileData), { createdAt: now, updatedAt: now });
            // Check if profile already exists
            const existingProfile = await this.findByProfileId(profileData.profileId);
            if (existingProfile && existingProfile.id) {
                // Update existing profile
                await this.db.collection(this.collectionName).doc(existingProfile.id).update(Object.assign(Object.assign({}, docData), { updatedAt: now }));
                return Object.assign(Object.assign(Object.assign({}, existingProfile), docData), { updatedAt: now });
            }
            else {
                // Create new profile
                const docRef = await this.db.collection(this.collectionName).add(docData);
                const savedDoc = await docRef.get();
                return Object.assign({ id: docRef.id }, savedDoc.data());
            }
        }
        catch (error) {
            throw new Error(`Failed to save profile: ${error}`);
        }
    }
    /**
     * Delete profile by profile ID
     */
    async deleteByProfileId(profileId) {
        try {
            const profile = await this.findByProfileId(profileId);
            if (!profile || !profile.id) {
                return false;
            }
            await this.db.collection(this.collectionName).doc(profile.id).delete();
            return true;
        }
        catch (error) {
            throw new Error(`Failed to delete profile: ${error}`);
        }
    }
    /**
     * Check if profile exists and is valid (less than 24 hours old)
     */
    async isProfileValid(profileId) {
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
        }
        catch (error) {
            throw new Error(`Failed to check profile validity: ${error}`);
        }
    }
}
exports.ProfileRepository = ProfileRepository;
//# sourceMappingURL=profile.repository.js.map