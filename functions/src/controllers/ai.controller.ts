import { AIService } from "../services/ai.service";

export class AiController {
    private aiService: AIService;

    constructor() {
        this.aiService = new AIService();
    }

    async optimizeContent(content: string, section?: string, language?: string): Promise<any> {
        const result = await this.aiService.optimizeContent(content, section, language);
        return result;
    }
}