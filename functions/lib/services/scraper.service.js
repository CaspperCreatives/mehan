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
const logger = __importStar(require("firebase-functions/logger"));
const optimized_content_service_1 = require("./optimized-content.service");
const user_id_generator_1 = require("../utils/user-id-generator");
class ScraperService {
    constructor() {
        this.optimizedContentService = new optimized_content_service_1.OptimizedContentService();
    }
    async scrapeLinkedInProfile(url) {
        try {
            const apifyUrl = process.env.APIFY_URL;
            const apifyToken = process.env.APIFY_TOKEN;
            if (!apifyUrl) {
                logger.error('APIFY_URL environment variable is not set');
                return {
                    success: false,
                    error: 'APIFY_URL environment variable is not set'
                };
            }
            if (!apifyToken) {
                logger.error('APIFY_TOKEN environment variable is not set');
                return {
                    success: false,
                    error: 'APIFY_TOKEN environment variable is not set'
                };
            }
            logger.info('Starting LinkedIn profile scraping for URL:', url);
            logger.info('Using Apify URL:', apifyUrl);
            logger.info('Using Apify Token:', apifyToken);
            const profileData = await fetch(apifyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apifyToken}`
                },
                body: JSON.stringify({
                    "urls": [
                        {
                            "url": url,
                            "method": "GET"
                        }
                    ],
                    "findContacts": false,
                    "scrapeCompany": false
                }),
            });
            if (!profileData.ok) {
                const errorText = await profileData.text();
                logger.error('Apify API request failed:', {
                    status: profileData.status,
                    statusText: profileData.statusText,
                    error: errorText
                });
                return {
                    success: false,
                    error: `Apify API request failed: ${profileData.status} ${profileData.statusText}`
                };
            }
            const data = await profileData.json();
            logger.info('Apify API response received:', {
                hasData: !!data,
                dataType: typeof data,
                dataKeys: data ? Object.keys(data) : 'null/undefined'
            });
            // Save user and profile data to database
            try {
                await this.saveUserAndProfileData(data, url);
            }
            catch (saveError) {
                logger.error('❌ [SCRAPER] Error saving user and profile data:', saveError);
                // Don't throw the error - this shouldn't break the main flow
            }
            // Wrap the response in the expected format
            return {
                success: true,
                data: data
            };
        }
        catch (error) {
            logger.error('Error scraping LinkedIn profile:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred during scraping'
            };
        }
    }
    /**
     * Save user and profile data to database
     * @param scrapedData - The scraped profile data from Apify
     * @param linkedinUrl - The LinkedIn profile URL
     */
    async saveUserAndProfileData(scrapedData, linkedinUrl) {
        try {
            logger.info('🔍 [SCRAPER] Saving user and profile data to database...--------', scrapedData);
            // Extract profile data from the scraped response
            // The structure might vary depending on Apify response format
            let profileData = null;
            if (scrapedData && Array.isArray(scrapedData) && scrapedData.length > 0) {
                profileData = scrapedData[0];
            }
            else if (scrapedData && scrapedData.data && Array.isArray(scrapedData.data) && scrapedData.data.length > 0) {
                profileData = scrapedData.data[0];
            }
            else if (scrapedData && scrapedData.profile && Array.isArray(scrapedData.profile) && scrapedData.profile.length > 0) {
                profileData = scrapedData.profile[0];
            }
            else if (scrapedData && scrapedData.profiles && Array.isArray(scrapedData.profiles) && scrapedData.profiles.length > 0) {
                profileData = scrapedData.profiles[0];
            }
            else {
                logger.warn('⚠️ [SCRAPER] No profile data found in scraped response');
                return;
            }
            // Extract profile information using utility function
            const profileId = (0, user_id_generator_1.extractProfileId)(profileData);
            const firstName = profileData === null || profileData === void 0 ? void 0 : profileData.firstName;
            const lastName = profileData === null || profileData === void 0 ? void 0 : profileData.lastName;
            logger.info('🔍 [SCRAPER] Profile info:', { profileId, firstName, lastName, linkedinUrl });
            if (!profileId) {
                logger.warn('⚠️ [SCRAPER] No profile ID found, skipping database save');
                return;
            }
            // Normalize LinkedIn URL
            const normalizedLinkedInUrl = (0, user_id_generator_1.normalizeLinkedInUrl)(linkedinUrl);
            // Generate a consistent user ID using utility function
            const userId = (0, user_id_generator_1.generateUserId)(profileId, normalizedLinkedInUrl);
            // Create complete user object
            const completeUserObject = {
                userId,
                profileId,
                linkedinUrl: normalizedLinkedInUrl,
                profileData,
                optimizedContent: [], // Will be populated when user optimizes content
                totalOptimizations: 0
                // lastOptimizedAt is optional and will be set when content is optimized
            };
            // Save complete user object to database
            const saved = await this.optimizedContentService.saveCompleteUserObject(completeUserObject);
            if (saved) {
                logger.info('✅ [SCRAPER] Complete user object saved to database successfully');
            }
            else {
                logger.error('❌ [SCRAPER] Failed to save complete user object to database');
            }
        }
        catch (error) {
            logger.error('❌ [SCRAPER] Error saving user and profile data:', error);
            throw error;
        }
    }
}
exports.default = ScraperService;
//# sourceMappingURL=scraper.service.js.map