import OpenAI from "openai";
import { AIRepository } from "../interfaces";
import { PromptService } from "../services/Prompt.service";
import * as dotenv from "dotenv";


dotenv.config();

export class OpenAIRepository implements AIRepository {
    private _openai: OpenAI | null = null;
    private promptService: PromptService;

    constructor() {
        this.promptService = new PromptService();
    }

    // Lazy getter for OpenAI client
    private get openai(): OpenAI {
        if (!this._openai) {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OPENAI_API_KEY environment variable is not set');
            }

            this._openai = new OpenAI({
                apiKey: apiKey,
            });
        }
        return this._openai;
    }

    async generateText(prompt: string, language?: string): Promise<string> {
        try {
            const systemMessage = language === 'ar' 
                ? "You are a professional LinkedIn profile optimization expert. Your task is to generate optimized content in Arabic that can directly replace the original content and meets the specific scoring criteria for maximum points. Do NOT provide advice, recommendations, or analysis. Return ONLY the optimized content text in Arabic."
                : "You are a professional LinkedIn profile optimization expert. Your task is to generate optimized content that can directly replace the original content and meets the specific scoring criteria for maximum points. Do NOT provide advice, recommendations, or analysis. Return ONLY the optimized content text.";

            const completion = await this.openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: systemMessage
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7,
            });

            return completion.choices[0]?.message?.content || "No response generated";
        } catch (error) {

            throw error;
        }
    }

    async analyzeLinkedInProfile(profileData: any, language?: string): Promise<any> {
        try {
            const prompt = this.promptService.analyzeLinkedInProfilePrompt(profileData, language || 'en');
            const analysis = await this.generateText(prompt, language);

            return this.parseAnalysisResponse(analysis);
        } catch (error) {

            throw error;
        }
    }


    private parseAnalysisResponse(analysis: string): any {
        try {
            // Clean the analysis string by removing markdown code blocks if present
            let cleanAnalysis = analysis.trim();
            
            // Remove markdown code blocks if they exist
            if (cleanAnalysis.startsWith('```json')) {
                cleanAnalysis = cleanAnalysis.replace(/^```json\s*/, '');
            }
            if (cleanAnalysis.endsWith('```')) {
                cleanAnalysis = cleanAnalysis.replace(/\s*```$/, '');
            }
            
            // Parse the cleaned JSON
            const parsed = JSON.parse(cleanAnalysis);
            
            return parsed;
        } catch (error) {
            return {
                rawAnalysis: analysis,
                error: "Failed to parse analysis response",
                parseError: error instanceof Error ? error.message : String(error)
            };
        }
    }
}


