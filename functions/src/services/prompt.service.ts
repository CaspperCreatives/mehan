export class PromptService {

    analyzeLinkedInProfilePrompt(profileData: any, language: string = 'en'): string {


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
}