import { OpenAIRepository } from "../repositories/ai.repository";
import { AIRepository } from "../interfaces";

export class AIService {
    private aiRepo: AIRepository;

    constructor(aiRepo?: AIRepository) {
        this.aiRepo = aiRepo || new OpenAIRepository();
    }

    /**
     * Analyze LinkedIn profile with AI
     */
    async analyzeLinkedInProfile(profileData: any): Promise<any> {
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
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}