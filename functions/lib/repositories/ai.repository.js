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
const Prompt_service_1 = require("../services/Prompt.service");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class OpenAIRepository {
    constructor() {
        this._openai = null;
        this.promptService = new Prompt_service_1.PromptService();
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
    async generateText(prompt, language) {
        var _a, _b;
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
            return ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "No response generated";
        }
        catch (error) {
            throw error;
        }
    }
    async analyzeLinkedInProfile(profileData, language) {
        try {
            const prompt = this.promptService.analyzeLinkedInProfilePrompt(profileData, language || 'en');
            const analysis = await this.generateText(prompt, language);
            return this.parseAnalysisResponse(analysis);
        }
        catch (error) {
            throw error;
        }
    }
    parseAnalysisResponse(analysis) {
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
        }
        catch (error) {
            return {
                rawAnalysis: analysis,
                error: "Failed to parse analysis response",
                parseError: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
exports.OpenAIRepository = OpenAIRepository;
//# sourceMappingURL=ai.repository.js.map