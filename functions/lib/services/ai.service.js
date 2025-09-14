"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const ai_repository_1 = require("../repositories/ai.repository");
const Prompt_service_1 = require("./Prompt.service");
class AIService {
    constructor(aiRepo) {
        this.aiRepo = aiRepo || new ai_repository_1.OpenAIRepository();
        this.promptService = new Prompt_service_1.PromptService();
    }
    /**
     * Analyze LinkedIn profile with AI
     */
    async analyzeLinkedInProfile(profileData, language) {
        try {
            if (!profileData) {
                throw new Error('Profile data is required');
            }
            const analysis = await this.aiRepo.analyzeLinkedInProfile(profileData, language);
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
    async optimizeContent(content, section, language) {
        if (!section) {
            section = 'generic';
        }
        let sectionPrompt;
        // Use enhanced headline prompt if section is headline and user context is available
        if (section === 'headline' && this.promptService.hasUserContext()) {
            sectionPrompt = await this.promptService.getEnhancedHeadlinePrompt(content);
        }
        else {
            sectionPrompt = await this.promptService.getSectionPrompt(section);
        }
        const prompt = {
            sectionPrompt: sectionPrompt,
            content: content,
        };
        const optimizedContent = await this.aiRepo.generateText(JSON.stringify(prompt), language);
        return {
            originalContent: content,
            optimizedContent: optimizedContent,
            section: section,
            timestamp: new Date().toISOString()
        };
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map