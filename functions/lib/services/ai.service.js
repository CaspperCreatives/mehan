"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const ai_repository_1 = require("../repositories/ai.repository");
class AIService {
    constructor(aiRepo) {
        this.aiRepo = aiRepo || new ai_repository_1.OpenAIRepository();
    }
    /**
     * Analyze LinkedIn profile with AI
     */
    async analyzeLinkedInProfile(profileData) {
        try {
            if (!profileData) {
                throw new Error('Profile data is required');
            }
            const analysis = await this.aiRepo.analyzeLinkedInProfile(profileData);
            const wrappedResult = {
                success: true,
                data: analysis
            };
            return wrappedResult;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map