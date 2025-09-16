"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperController = void 0;
const scraper_service_1 = __importDefault(require("../services/scraper.service"));
const ai_service_1 = require("../services/ai.service");
class ScraperController {
    constructor() {
        this.scraperService = new scraper_service_1.default();
        this.aiService = new ai_service_1.AIService();
    }
    /**
     * Scrape LinkedIn profile data
     */
    async scrapeLinkedInProfile(url) {
        try {
            if (!url) {
                throw new Error('URL is required');
            }
            const result = await this.scraperService.scrapeLinkedInProfile(url);
            return result;
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
    async analyzeLinkedInProfile(profileData, language) {
        try {
            if (!profileData) {
                throw new Error('Profile data is required');
            }
            const analysis = await this.aiService.analyzeLinkedInProfile(profileData, language);
            return analysis;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Get user object by user ID
     */
    async getUserObject(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            const result = await this.scraperService.getUserObject(userId);
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
exports.ScraperController = ScraperController;
exports.default = ScraperController;
//# sourceMappingURL=scraper.controller.js.map