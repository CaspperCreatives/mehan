"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIRepository = void 0;
const openai_1 = __importDefault(require("openai"));
const logger = __importStar(require("firebase-functions/logger"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class OpenAIRepository {
    constructor() {
        this._openai = null;
    }
    // Lazy getter for OpenAI client
    get openai() {
        if (!this._openai) {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OPENAI_API_KEY environment variable is not set');
            }
            this._openai = new openai_1.default({
                apiKey: apiKey,
            });
        }
        return this._openai;
    }
    async generateText(prompt) {
        var _a, _b;
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
            return ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "No response generated";
        }
        catch (error) {
            logger.error('Error generating text with OpenAI:', error);
            throw error;
        }
    }
    async analyzeLinkedInProfile(profileData) {
        try {
            const prompt = this.createAnalysisPrompt(profileData);
            const analysis = await this.generateText(prompt);
            return this.parseAnalysisResponse(analysis);
        }
        catch (error) {
            logger.error('Error analyzing LinkedIn profile:', error);
            throw error;
        }
    }
    createAnalysisPrompt(profileData) {
        return `
        Analyze the following LinkedIn profile data and provide insights:

        Profile Information:
        - Name: ${profileData.name || 'Not provided'}
        - Headline: ${profileData.headline || 'Not provided'}
        - Summary: ${profileData.summary || 'Not provided'}
        - Location: ${profileData.location || 'Not provided'}
        - Industry: ${profileData.industry || 'Not provided'}

        Experience:
        ${profileData.experience ? profileData.experience.map((exp) => `- ${exp.title} at ${exp.company} (${exp.duration || 'Duration not specified'})`).join('\n') : 'No experience listed'}

        Education:
        ${profileData.education ? profileData.education.map((edu) => `- ${edu.degree} from ${edu.school} (${edu.year || 'Year not specified'})`).join('\n') : 'No education listed'}

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
    parseAnalysisResponse(analysis) {
        try {
            // Simple parsing - you can enhance this based on your needs
            return {
                rawAnalysis: analysis,
                summary: analysis.substring(0, 200) + "...",
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            logger.error('Error parsing analysis response:', error);
            return {
                rawAnalysis: analysis,
                error: "Failed to parse analysis response"
            };
        }
    }
}
exports.OpenAIRepository = OpenAIRepository;
//# sourceMappingURL=ai.repository.js.map