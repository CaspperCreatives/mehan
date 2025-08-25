import OpenAI from "openai";
import { AIRepository } from "../interfaces";
import * as logger from "firebase-functions/logger";
import * as dotenv from "dotenv";

dotenv.config();

export class OpenAIRepository implements AIRepository {
    private _openai: OpenAI | null = null;

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

    async generateText(prompt: string): Promise<string> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional LinkedIn profile analyzer. Provide insightful analysis in a structured format."
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
            logger.error('Error generating text with OpenAI:', error);
            throw error;
        }
    }

    async analyzeLinkedInProfile(profileData: any): Promise<any> {
        try {
            const prompt = this.createAnalysisPrompt(profileData);
            const analysis = await this.generateText(prompt);
            
            return this.parseAnalysisResponse(analysis);
        } catch (error) {
            logger.error('Error analyzing LinkedIn profile:', error);
            throw error;
        }
    }

    private createAnalysisPrompt(profileData: any): string {
        return `
        Analyze the following LinkedIn profile data and provide insights:

        Profile Information:
        - Name: ${profileData.name || 'Not provided'}
        - Headline: ${profileData.headline || 'Not provided'}
        - Summary: ${profileData.summary || 'Not provided'}
        - Location: ${profileData.location || 'Not provided'}
        - Industry: ${profileData.industry || 'Not provided'}

        Experience:
        ${profileData.experience ? profileData.experience.map((exp: any) => 
            `- ${exp.title} at ${exp.company} (${exp.duration || 'Duration not specified'})`
        ).join('\n') : 'No experience listed'}

        Education:
        ${profileData.education ? profileData.education.map((edu: any) => 
            `- ${edu.degree} from ${edu.school} (${edu.year || 'Year not specified'})`
        ).join('\n') : 'No education listed'}

        Skills:
        ${profileData.skills ? profileData.skills.join(', ') : 'No skills listed'}

        Please provide:
        1. Professional Summary
        2. Key Strengths
        3. Career Trajectory Analysis
        4. Recommendations for Profile Enhancement
        5. Industry Insights
        `;
    }

    private parseAnalysisResponse(analysis: string): any {
        try {
            // Simple parsing - you can enhance this based on your needs
            return {
                rawAnalysis: analysis,
                summary: analysis.substring(0, 200) + "...",
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error parsing analysis response:', error);
            return {
                rawAnalysis: analysis,
                error: "Failed to parse analysis response"
            };
        }
    }
}
