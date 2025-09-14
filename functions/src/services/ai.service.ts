import { OpenAIRepository } from "../repositories/ai.repository";
import { AIRepository } from "../interfaces";
import { PromptService } from "./Prompt.service";


export class AIService {
    private aiRepo: AIRepository;
    private promptService: PromptService;

    constructor(aiRepo?: AIRepository) {
        this.aiRepo = aiRepo || new OpenAIRepository();
        this.promptService = new PromptService();
    }

    /**
     * Analyze LinkedIn profile with AI
     */
    async analyzeLinkedInProfile(profileData: any, language?: string): Promise<any> {
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
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async optimizeContent(content: string, section?: string, language?: string): Promise<any> {
        if (!section) {
            section = 'generic';
        }
        
        let sectionPrompt: string;
        
        // Use enhanced headline prompt if section is headline and user context is available
        if (section === 'headline' && this.promptService.hasUserContext()) {
            sectionPrompt = await this.promptService.getEnhancedHeadlinePrompt(content);
        } else {
            sectionPrompt = await this.promptService.getSectionPrompt(section);
        }
        
        const prompt = {
            sectionPrompt: sectionPrompt,
            content: content,
        }

        const optimizedContent = await this.aiRepo.generateText(JSON.stringify(prompt), language);
        
        return {
            originalContent: content,
            optimizedContent: optimizedContent,
            section: section,
            timestamp: new Date().toISOString()
        };
    }
}