"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const scraper_controller_1 = require("../controllers/scraper.controller");
const score_service_1 = require("./score.service");
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
    async analyzeProfile(url) {
        try {
            const profileData = await this.scraperController.scrapeLinkedInProfile(url);
            if (!profileData.success) {
                throw new Error(profileData.error || 'Failed to scrape profile');
            }
            const analysis = await this.scraperController.analyzeLinkedInProfile(profileData.data);
            if (!analysis.success) {
                throw new Error(analysis.error || 'Failed to analyze profile');
            }
            // Calculate profile score
            const profileScore = await this.calculateProfileScore(profileData.data);
            const result = {
                profile: profileData.data,
                analysis: analysis.data,
                profileScore: profileScore.success ? profileScore.data : null
            };
            return {
                success: true,
                data: result,
                cached: false,
                timestamp: new Date().toISOString()
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
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map