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
        try {
            if (!section) {
                section = 'generic';
            }
            console.log(`🤖 [AI_SERVICE] Starting content optimization for section: ${section}`);
            let sectionPrompt;
            // Use enhanced headline prompt if section is headline and user context is available
            if (section === 'headline' && this.promptService.hasUserContext()) {
                console.log(`📝 [AI_SERVICE] Using enhanced headline prompt with user context`);
                sectionPrompt = await this.promptService.getEnhancedHeadlinePrompt(content);
            }
            else {
                console.log(`📝 [AI_SERVICE] Using standard prompt for section: ${section}`);
                sectionPrompt = await this.promptService.getSectionPrompt(section);
            }
            const prompt = {
                sectionPrompt: sectionPrompt,
                content: content,
            };
            console.log(`🚀 [AI_SERVICE] Calling OpenAI API for content generation`);
            const optimizedContent = await this.aiRepo.generateText(JSON.stringify(prompt), language);
            console.log(`✅ [AI_SERVICE] Content optimization completed successfully`);
            // Clear large objects from memory
            sectionPrompt = undefined;
            return {
                originalContent: content,
                optimizedContent: optimizedContent,
                section: section,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error(`❌ [AI_SERVICE] Error during content optimization:`, error);
            throw error;
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map