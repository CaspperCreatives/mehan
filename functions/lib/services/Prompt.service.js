"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptService = void 0;
const prompts_repository_1 = require("../repositories/prompts.repository");
const critera_1 = require("./critera");
const user_manager_service_1 = require("./user-manager.service");
class PromptService {
    constructor() {
        var _a, _b, _c, _d, _e, _f;
        this.defaultPrompts = {
            summary: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the summary section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Length: Minimum 200 words (20 points)
      - Include professional email address (10 points)
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.

      the returing result must meet the ${(_a = critera_1.SCORING_CRITERIA.find(criteria => criteria.section === 'summary')) === null || _a === void 0 ? void 0 : _a.criteria} criteria
      
      Return ONLY the optimized content text, nothing else.
      `,
            experience: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the experience section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Include detailed descriptions for each position (10 points)
      - Minimum 3 experience positions (10 points)
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.

      the returing result must meet the ${(_b = critera_1.SCORING_CRITERIA.find(criteria => criteria.section === 'experience')) === null || _b === void 0 ? void 0 : _b.criteria} criteria

      Return ONLY the optimized content text, nothing else.
      `,
            experiences: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the experiences section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Include detailed descriptions for each position (10 points)
      - Minimum 3 experience positions (10 points)
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.

      the returing result must meet the ${(_c = critera_1.SCORING_CRITERIA.find(criteria => criteria.section === 'experiences')) === null || _c === void 0 ? void 0 : _c.criteria} criteria
        
      Return ONLY the optimized content text, nothing else.
      `,
            education: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the education section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Must not be empty (10 points)
      - Include school name, degree, field of study, and dates
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.

      the returing result must meet the ${(_d = critera_1.SCORING_CRITERIA.find(criteria => criteria.section === 'education')) === null || _d === void 0 ? void 0 : _d.criteria} criteria
        
      Return ONLY the optimized content text, nothing else.
      `,
            skills: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the skills section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Minimum 3 skills (15 points)
      - Include both technical and soft skills
      - Use industry-relevant keywords
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.

      the returing result must meet the ${(_e = critera_1.SCORING_CRITERIA.find(criteria => criteria.section === 'skills')) === null || _e === void 0 ? void 0 : _e.criteria} criteria
        
      Return ONLY the optimized content text, nothing else.
      `,
            headline: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the headline section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Length: Minimum 10 words (10 points)
      - Include professional keywords (10 points)
      - Make it attention-grabbing and keyword-rich
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.

      the returing result must meet the ${(_f = critera_1.SCORING_CRITERIA.find(criteria => criteria.section === 'headline')) === null || _f === void 0 ? void 0 : _f.criteria} criteria
      and it should be relevant to the profile data
        
      Return ONLY the optimized headline text, nothing else.
      `,
            linkedinurl: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the LinkedIn URL section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Must be a valid LinkedIn URL (5 points)
      - Should be professional and memorable
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
      
        
      Return ONLY the optimized content text, nothing else.
      `,
            recommendations: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the recommendations section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Minimum 1 recommendation (1 point)
      - Should be from colleagues, managers, or clients
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
        
      Return ONLY the optimized content text, nothing else.
      `,
            projects: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the projects section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Minimum 1 project (1 point)
      - Include project description, technologies used, and outcomes
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
        
      Return ONLY the optimized content text, nothing else.
      `,
            publications: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the publications section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Minimum 1 publication (1 point)
      - Include title, authors, and publication details
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
        
      Return ONLY the optimized content text, nothing else.
      `,
            courses: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the courses section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Minimum 1 course (1 point)
      - Include course name, institution, and completion date
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
        
      Return ONLY the optimized content text, nothing else.
      `,
            honorsawards: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the honors and awards section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Minimum 1 honor/award (1 point)
      - Include award name, issuing organization, and date
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.

        
      Return ONLY the optimized content text, nothing else.
      `,
            languages: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the languages section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Minimum 1 language (1 point)
      - Include proficiency level
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
        
      Return ONLY the optimized content text, nothing else.
      `,
            certificates: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the certificates section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Minimum 1 certificate (1 point)
      - Include certificate name, issuing organization, and date
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.

      Return ONLY the optimized content text, nothing else.
      `,
            volunteer: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the volunteer section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Minimum 1 volunteer experience (1 point)
      - Include organization, role, and duration
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
      
      Return ONLY the optimized content text, nothing else.
      `,
            country: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the country section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Must not be empty (5 points)
      - Include country and city if applicable
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
      
      Return ONLY the optimized content text, nothing else.
      `,
            featured: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the featured section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Minimum 1 featured item (1 point)
      - Include title, description, and URL
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
      
      Return ONLY the optimized content text, nothing else.
      `,
            connections: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the connections section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Must not be empty (1 point)
      - Include relevant connection information
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
      
      Return ONLY the optimized content text, nothing else.
      `,
            followers: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the followers section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Must not be empty (1 point)
      - Include follower count and engagement metrics
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
      
      Return ONLY the optimized content text, nothing else.
      `,
            openToWork: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the open to work section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Must not be empty (1 point)
      - Include job preferences and availability
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
      
      Return ONLY the optimized content text, nothing else.
      `,
            generic: `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT: Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.
      
      Return ONLY the optimized content text, nothing else.
      `,
        };
        this.promptRepository = new prompts_repository_1.PromptsRepository();
    }
    analyzeLinkedInProfilePrompt(profileData, language = 'en') {
        return `
          according to this json object ${JSON.stringify(profileData)} return the following:          
          
          Analyze this LinkedIn profile data and provide a comprehensive assessment. Return your response in JSON format with the following structure:

    {

        "strengths": ["strength1", "strength2", ...],
        "weaknesses": ["weakness1", "weakness2", ...],
        "analysis_recommendations":{
          "summary": ["recommendation1", "recommendation2", ...],
          "skills": ["recommendation1", "recommendation2", ...],
          "experience": ["recommendation1", "recommendation2", ...],
          "projects": ["recommendation1", "recommendation2", ...],
          "education": ["recommendation1", "recommendation2", ...],
          "recommendations": ["recommendation1", "recommendation2", ...],
          "publications": ["recommendation1", "recommendation2", ...],
          "courses": ["recommendation1", "recommendation2", ...],
          "honorsawards": ["recommendation1", "recommendation2", ...],
          "languages": ["recommendation1", "recommendation2", ...],
          "certificates": ["recommendation1", "recommendation2", ...],
          "volunteer": ["recommendation1", "recommendation2", ...],
          "linkedinurl": ["recommendation1", "recommendation2", ...],
          "headline": ["recommendation1", "recommendation2", ...],
          "country": ["recommendation1", "recommendation2", ...],
          "featured": ["recommendation1", "recommendation2", ...],
          "connections": ["recommendation1", "recommendation2", ...],
          "followers": ["recommendation1", "recommendation2", ...],
          "openToWork": ["recommendation1", "recommendation2", ...],
          "experiences": ["recommendation1", "recommendation2", ...],
        },
        "industryInsights": "string",
        "profileOptimization": ["optimization1", "optimization2", ...],
        "keywordAnalysis": {
            "relevantKeywords": ["keyword1", "keyword2", ...],
            "missingKeywords": ["keyword1", "keyword2", ...]
        },
        "competitiveAnalysis": "string",
        "aiSummary": "string",
        
    }
    according to the all the data provided, return the following (be kind and friendly and encourage the user to improve their profile):
    - summary: "{{first name}}'s {{say something good about the profile}}", {{add a short summary about the profile | 250 words}} 
    - strengths: ["strength1", "strength2", ...]
    - weaknesses: ["weakness1", "weakness2", ...]
    - analysis_recommendations: {
      "summary": ["recommendation1", "recommendation2", ...],
      "skills": ["recommendation1", "recommendation2", ...],
      "experience": ["recommendation1", "recommendation2", ...],
      "education": ["recommendation1", "recommendation2", ...],
      "projects": ["recommendation1", "recommendation2", ...],
      "recommendations": ["recommendation1", "recommendation2", ...],
      "publications": ["recommendation1", "recommendation2", ...],
      "courses": ["recommendation1", "recommendation2", ...],
      "honorsawards": ["recommendation1", "recommendation2", ...],
      "languages": ["recommendation1", "recommendation2", ...],
      "certificates": ["recommendation1", "recommendation2", ...],
      "volunteer": ["recommendation1", "recommendation2", ...],
    }
    - industryInsights: "string"
    - profileOptimization: ["optimization1", "optimization2", ...]
    - keywordAnalysis: { relevantKeywords: ["keyword1", "keyword2", ...], missingKeywords: ["keyword1", "keyword2", ...] }


    Please provide a professional, constructive analysis that would help improve this LinkedIn profile for career advancement and networking opportunities. Focus on:
    1. Profile completeness and professionalism
    2. Industry relevance and keyword optimization
    3. Networking potential and engagement
    4. Career progression and positioning
    5. Specific actionable improvements
    
    

    Return in the ${language === 'ar' ? 'Arabic' : 'English'} only valid JSON without any additional text or formatting.`;
    }
    async getAllPrompts() {
        return await this.promptRepository.getPrompts();
    }
    async getSectionPrompt(section, language) {
        const prompt = this.defaultPrompts[section];
        if (!prompt) {
            const basePrompt = `You are a professional LinkedIn profile optimization expert. Your task is to OPTIMIZE and REWRITE the following content for the ${section} section to make it more compelling, professional, and impactful for LinkedIn. IMPORTANT: Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content. Return ONLY the optimized content text, nothing else.`;
            if (language === 'ar') {
                return `${basePrompt}\n\nIMPORTANT: Generate the optimized content in Arabic language.`;
            }
            return basePrompt;
        }
        if (language === 'ar') {
            return `${prompt}\n\nIMPORTANT: Generate the optimized content in Arabic language.`;
        }
        return prompt;
    }
    /**
     * Get current user from UserManager
     * @returns Current user object or null
     */
    getCurrentUser() {
        return user_manager_service_1.userManager.getCurrentUser();
    }
    /**
     * Get current user's profile data
     * @returns Profile data or null
     */
    getCurrentUserProfileData() {
        const currentUser = user_manager_service_1.userManager.getCurrentUser();
        return (currentUser === null || currentUser === void 0 ? void 0 : currentUser.profileData) || null;
    }
    /**
     * Check if user context is available
     * @returns True if user context is loaded
     */
    hasUserContext() {
        return user_manager_service_1.userManager.hasCurrentUser();
    }
    /**
     * Get current user ID
     * @returns Current user ID or null
     */
    getCurrentUserId() {
        return user_manager_service_1.userManager.getCurrentUserId();
    }
    /**
     * Get enhanced headline prompt with summary context
     * @param content - The headline content to optimize
     * @param language - The language for the output
     * @returns Enhanced prompt with summary context
     */
    async getEnhancedHeadlinePrompt(content, language) {
        var _a, _b;
        const currentUser = this.getCurrentUser();
        const profileData = this.getCurrentUserProfileData();
        if (!currentUser || !profileData) {
            console.warn('No user context available, using default headline prompt');
            return await this.getSectionPrompt('headline', language);
        }
        // Get the summary from profile data
        const summary = profileData.summary || ((_a = profileData.about) === null || _a === void 0 ? void 0 : _a.content) || '';
        if (!summary) {
            console.warn('No summary available, using default headline prompt');
            return await this.getSectionPrompt('headline', language);
        }
        // Create enhanced headline prompt with summary context
        const enhancedPrompt = `
      You are a professional LinkedIn profile optimization expert.
      Your task is to OPTIMIZE and REWRITE the following content for the headline section to make it more compelling, professional, and impactful for LinkedIn.
      
      IMPORTANT SCORING CRITERIA (must meet for maximum points):
      - Length: Minimum 10 words (10 points)
      - Include professional keywords (10 points)
      - Make it attention-grabbing and keyword-rich
      
      Your optimized content MUST meet these exact requirements to score maximum points.
      Do NOT give advice or recommendations. Instead, provide the OPTIMIZED CONTENT that should replace the original content.

      the returing result must meet the ${(_b = critera_1.SCORING_CRITERIA.find(criteria => criteria.section === 'headline')) === null || _b === void 0 ? void 0 : _b.criteria} criteria
      and it should be relevant to the profile data
      
      CONTEXT: Use the following summary to create a headline that is well-written and related to the user's professional background:
      
      SUMMARY: ${summary}
      
      HEADLINE TO OPTIMIZE: ${content}
      
      Create a headline that:
      1. Reflects the key themes and expertise mentioned in the summary
      2. Uses relevant keywords from the summary
      3. Maintains professional tone and impact
      4. Is concise but comprehensive (minimum 10 words)
      5. Aligns with the user's professional positioning from the summary
        
      Return ONLY the optimized headline text, nothing else.
      `;
        if (language === 'ar') {
            return `${enhancedPrompt}\n\nIMPORTANT: Generate the optimized content in Arabic language.`;
        }
        return enhancedPrompt;
    }
}
exports.PromptService = PromptService;
//# sourceMappingURL=Prompt.service.js.map