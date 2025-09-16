"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const firebase_functions_1 = require("firebase-functions");
const scraper_controller_1 = require("../controllers/scraper.controller");
const score_service_1 = require("./score.service");
const user_context_service_1 = require("./user-context.service");
const user_manager_service_1 = require("./user-manager.service");
class ProfileService {
    constructor() {
        this.scraperController = new scraper_controller_1.ScraperController();
        this.scoreService = new score_service_1.ScoreService();
    }
    /**
     * Scrape LinkedIn profile data
     */
    async scrapeProfile(url) {
        try {
            const profileData = await this.scraperController.scrapeLinkedInProfile(url);
            if (!profileData.success) {
                throw new Error(profileData.error || 'Failed to scrape profile');
            }
            return {
                success: true,
                data: profileData.data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Service temporarily unavailable'
            };
        }
    }
    /**
     * Analyze LinkedIn profile with AI
     */
    async analyzeProfile(url, language, forceRefresh = false, userId) {
        try {
            let profileData;
            let analysis;
            if (forceRefresh) {
                profileData = await this.scraperController.scrapeLinkedInProfile(url);
                if (!profileData.success) {
                    throw new Error(profileData.error || 'Failed to scrape profile');
                }
                analysis = await this.scraperController.analyzeLinkedInProfile(profileData.data[0], language);
            }
            else {
                if (userId) {
                    const userObject = await this.scraperController.getUserObject(userId);
                    if (userObject.success) {
                        profileData = { success: true, data: [userObject.data.profileData] };
                        // If no analysis data in user object, we need to analyze it
                        analysis = await this.scraperController.analyzeLinkedInProfile(userObject.data.profileData, language);
                    }
                    else {
                        // If getUserObject fails, fall back to scraping
                        profileData = await this.scraperController.scrapeLinkedInProfile(url);
                        if (!profileData.success) {
                            throw new Error(profileData.error || 'Failed to scrape profile');
                        }
                        analysis = await this.scraperController.analyzeLinkedInProfile(profileData.data[0], language);
                    }
                }
                else {
                    // No userId provided, fall back to scraping
                    profileData = await this.scraperController.scrapeLinkedInProfile(url);
                    if (!profileData.success) {
                        throw new Error(profileData.error || 'Failed to scrape profile');
                    }
                    analysis = await this.scraperController.analyzeLinkedInProfile(profileData.data[0], language);
                }
            }
            if (!analysis.success) {
                throw new Error(analysis.error || 'Failed to analyze profile');
            }
            const profileScore = await this.calculateProfileScore(profileData.data[0]);
            const result = {
                profile: profileData.data,
                analysis: analysis.data,
                profileScore: profileScore.success ? profileScore.data : null
            };
            let savedUserId = null;
            try {
                // Create a properly formatted user object for the user context
                const profileDataForUser = profileData.data[0];
                const { generateUserId, extractProfileId, normalizeLinkedInUrl } = await import('../utils/user-id-generator.js');
                const profileId = extractProfileId(profileDataForUser);
                const normalizedUrl = normalizeLinkedInUrl(url);
                const userId = generateUserId(profileId || 'unknown', normalizedUrl);
                const userObjectForContext = {
                    userId,
                    profileId,
                    linkedinUrl: normalizedUrl,
                    profileData: profileDataForUser,
                    analysis: analysis.data,
                    profileScore: profileScore.success ? profileScore.data : null,
                    optimizedContent: [],
                    totalOptimizations: 0
                };
                savedUserId = await this.saveUserAndProfileData(url, userObjectForContext);
                firebase_functions_1.logger.info('✅ [BACKEND] User and profile data saved to database:', savedUserId);
            }
            catch (saveError) {
                firebase_functions_1.logger.error('❌ [BACKEND] Error saving user and profile data:', saveError);
            }
            return {
                success: true,
                data: result,
                cached: false,
                timestamp: new Date().toISOString(),
                userId: savedUserId
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                cached: false,
                error: error instanceof Error ? error.message : 'Service temporarily unavailable'
            };
        }
    }
    /**
     * Calculate profile score
     */
    async calculateProfileScore(profileData) {
        try {
            const profileScore = this.scoreService.calculateProfileScore(profileData);
            return {
                success: true,
                data: profileScore
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to calculate profile score'
            };
        }
    }
    /**
     * Get current user from UserManager
     * @returns Current user object or null
     */
    getCurrentUser() {
        return user_manager_service_1.userManager.getCurrentUser();
    }
    /**
     * Load user context by ID
     * @param userId - The user ID to load
     * @param linkedinUrl - Optional LinkedIn URL for fallback
     * @returns Promise<boolean> - True if user loaded successfully
     */
    async loadUserContext(userId, linkedinUrl) {
        return await user_context_service_1.userContext.ensureUserContext(userId, linkedinUrl);
    }
    /**
     * Save user and profile data to database and set in UserManager
     * @param profileData - The scraped profile data
     * @param linkedinUrl - The LinkedIn profile URL
     * @param analysisData - The AI analysis data (optional)
     * @returns Promise<string | null> - The user ID if successful, null otherwise
     */
    async saveUserAndProfileData(linkedinUrl, userObjectData) {
        try {
            const userObject = await user_context_service_1.userContext.createAndLoadUserContext(userObjectData);
            firebase_functions_1.logger.info('✅ [BACKEND] User context created and loaded successfully =====>', userObject);
            if (userObject) {
                firebase_functions_1.logger.info('✅ [BACKEND] User context created and loaded successfully');
                if (userObjectData.analysis) {
                    await this.saveAnalysisToUser(userObject.userId, userObjectData.analysis);
                }
                return userObject.userId;
            }
            else {
                firebase_functions_1.logger.error('❌ [BACKEND] Failed to create and load user context');
                return null;
            }
        }
        catch (error) {
            firebase_functions_1.logger.error('❌ [BACKEND] Error saving user and profile data:', error);
            throw error;
        }
    }
    /**
     * Save AI analysis data to user object
     * @param userId - The user ID
     * @param analysisData - The AI analysis data
     */
    async saveAnalysisToUser(userId, analysisData) {
        try {
            // Use the optimized content service to update the user object with analysis data
            const { OptimizedContentService } = await import('./optimized-content.service.js');
            const optimizedContentService = new OptimizedContentService();
            // Get the current user object
            const userObject = await optimizedContentService.getCompleteUserObject(userId);
            if (userObject) {
                // Update the user object with analysis data
                const updatedUserObject = Object.assign(Object.assign({}, userObject), { analysisData: analysisData, lastAnalyzedAt: new Date().toISOString() });
                // Save the updated user object
                await optimizedContentService.saveCompleteUserObject(updatedUserObject);
            }
            else {
            }
        }
        catch (error) {
            // Don't throw the error - this shouldn't break the main flow
        }
    }
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map