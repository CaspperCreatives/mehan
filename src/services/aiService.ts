import { AiRepository } from "../repositories/aiRepository";

export class AiService {
    private aiRepository: AiRepository;

    constructor() {
        this.aiRepository = new AiRepository();
    }

    async optimizeContent(content: string, sectionType?: string, language?: string): Promise<any> {
        return await this.aiRepository.optimizeContent(content, sectionType, language);
    }
}