"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const profile_service_1 = require("../services/profile.service");
class ProfileController {
    constructor() {
        this.profileService = new profile_service_1.ProfileService();
    }
    /**
     * Scrape LinkedIn profile data
     */
    async scrapeProfile(url) {
        try {
            if (!url) {
                throw new Error('URL is required');
            }
            return await this.profileService.scrapeProfile(url);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Analyze LinkedIn profile with AI
     */
    async analyzeProfile(url, language, forceRefresh) {
        try {
            if (!url) {
                throw new Error('URL is required');
            }
            const result = await this.profileService.analyzeProfile(url, language, forceRefresh);
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}
exports.ProfileController = ProfileController;
//# sourceMappingURL=profile.controller.js.map