import { ApiResponse, FirebaseRepository } from "./firebase-repository";
import { UserManager } from "../utils/userManager";

export class AiRepository extends FirebaseRepository {
    async optimizeContent(content: string, section?: string, language?: string): Promise<ApiResponse<string>> {
        // Get user context for headline optimization
        const userSession = await UserManager.getCurrentUserSession();
        const userId = userSession?.userId;
        const linkedinUrl = userSession?.linkedinUrl;
        
        return await this.callMethod('optimizeContent', { 
            content: content, 
            section: section,
            language: language,
            userId: userId,
            linkedinUrl: linkedinUrl
        });
    }
}