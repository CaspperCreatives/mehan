import { getOpenAIAPIKey, getGeminiAPIKey } from './apiKeys';

/**
 * Retrieves the OpenAI API key from environment variables
 * @returns {string} The OpenAI API key
 */
const getOpenAIKey = (): string => {
  // Try to get from environment variable first
  if (typeof process !== 'undefined' && process.env && process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  // Return empty string if not available - will be handled by error handling
  return '';
};

/**
 * Retrieves the Gemini API key from environment variables
 * @returns {string} The Gemini API key
 */
const getGeminiKey = (): string => {
  // Try to get from environment variable first
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  // Return empty string if not available - will be handled by error handling
  return '';
};


/**
 * Interface defining scoring criteria for profile evaluation
 */
interface ScoringCriteria {
  section: string;
  criteria: string;
  max_score: string;
  calculate?: {
    type?: string;
    min?: number;
    section?: string;
  };
}

/**
 * Interface for scoring results of individual sections
 */
interface ScoringResult {
  title: string;
  score: number;
  maxPossiblePoints: number;
  criteria: Array<{
    title: string;
    point: number;
  }>;
}

/**
 * Interface for the complete AI analysis result
 */
export interface AIAnalysisResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  industryInsights: string;
  profileOptimization: string[];
  analysis_recommendations: string[];
  keywordAnalysis: {
    relevantKeywords: string[];
    missingKeywords: string[];
  };
  competitiveAnalysis: string;
  summary: string;
  scoringBreakdown?: ScoringResult[];
}

/**
 * Scoring criteria configuration for LinkedIn profile evaluation
 * Each criteria defines a section, evaluation method, and maximum possible points
 */
const SCORING_CRITERIA: ScoringCriteria[] = [
  {
    section: "linkedInUrl",
    criteria: "check",
    max_score: "5"
  },
  {
    section: "country",
    criteria: "notEmpty",
    max_score: "5"
  },
  {
    section: "headline",
    criteria: "length",
    calculate: {
      type: "words",
      min: 10
    },
    max_score: "10"
  },
  {
    section: "headline",
    criteria: "keywords",
    max_score: "10"
  },
  {
    section: "summary",
    criteria: "length",
    calculate: {
      type: "words",
      min: 200
    },
    max_score: "20"
  },
  {
    section: "summary",
    criteria: "email",
    max_score: "10"
  },
  {
    section: "experiences",
    criteria: "notEmpty",
    calculate: {
      section: "description"
    },
    max_score: "10"
  },
  {
    section: "experiences",
    criteria: "length",
    calculate: {
      min: 3
    },
    max_score: "10"
  },
  {
    section: "education",
    criteria: "notEmpty",
    max_score: "10"
  },
  {
    section: "skills",
    criteria: "length",
    calculate: {
      min: 3
    },
    max_score: "15"
  },
  {
    section: "publications",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "languages",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "certificates",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "honorsAwards",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "volunteer",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "patents",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "testScores",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "organizations",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "featured",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "projects",
    criteria: "notEmpty",
    max_score: "1"
  },
  {
    section: "recommendations",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "causes",
    criteria: "length",
    calculate: {
      min: 1
    },
    max_score: "1"
  },
  {
    section: "contactInfo",
    criteria: "notEmpty",
    max_score: "1"
  }
];



/**
 * Main class for analyzing LinkedIn profiles using AI and scoring criteria
 */
export class AIProfileAnalyzer {
  private openAIKey = getOpenAIKey();
  private geminiKey = getGeminiKey();

  private language = (document.body.dir === 'rtl' || document.documentElement.lang === 'ar')? 'ar' : 'en';

  /**
   * Calculates profile score based on predefined scoring criteria
   * @param {any} profileData - The profile data to analyze
   * @returns {Object} Object containing overall score and detailed scoring breakdown
   */
  private calculateScore(profileData: any): { overallScore: number; scoringBreakdown: ScoringResult[] } {
    const scoringBreakdown: ScoringResult[] = [];
    let totalScore = 0;
    let totalMaxScore = 0;

    // Define all possible sections for comprehensive breakdown
    const allSections = this.getAllSections();
    
    // Group criteria by section
    const criteriaBySection = this.groupCriteriaBySection();

    // Process each section with its criteria
    allSections.forEach(section => {
      const sectionCriteria = criteriaBySection[section] || [];
      const sectionResult = this.processSection(section, sectionCriteria, profileData);
      
      if (sectionResult.score > 0 || sectionResult.maxPossiblePoints > 0) {
        scoringBreakdown.push(sectionResult);
        totalScore += sectionResult.score;
        totalMaxScore += sectionResult.maxPossiblePoints;
      }
    });

    const overallScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

    return { overallScore, scoringBreakdown };
  }

  /**
   * Returns all possible profile sections for comprehensive analysis
   * @returns {string[]} Array of section names
   */
  private getAllSections(): string[] {
    return [
      'linkedInUrl',
      'country', 
      'headline',
      'summary',
      'experiences',
      'education',
      'skills',
      'projects',
      'recommendations',
      'publications',
      'courses',
      'honorsAwards',
      'languages',
      'certificates',
      'awards',
      'volunteer',
      'profilePicture',
      'backgroundImage',
      'patents',
      'testScores',
      'organizations',
      'contactInfo',
      'causes'
    ];
  }

  /**
   * Groups scoring criteria by their respective sections
   * @returns {Record<string, ScoringCriteria[]>} Object mapping section names to their criteria
   */
  private groupCriteriaBySection(): Record<string, ScoringCriteria[]> {
    const criteriaBySection: Record<string, ScoringCriteria[]> = {};
    SCORING_CRITERIA.forEach(criteria => {
      if (!criteriaBySection[criteria.section]) {
        criteriaBySection[criteria.section] = [];
      }
      criteriaBySection[criteria.section].push(criteria);
    });
    return criteriaBySection;
  }

  /**
   * Processes a specific section and calculates its score based on criteria
   * @param {string} section - The section name to process
   * @param {ScoringCriteria[]} sectionCriteria - Criteria for this section
   * @param {any} profileData - The profile data to analyze
   * @returns {ScoringResult} Scoring result for this section
   */
  private processSection(section: string, sectionCriteria: ScoringCriteria[], profileData: any): ScoringResult {
    let sectionScore = 0;
    let sectionMaxScore = 0;
    const criteriaDetails: Array<{title: string, point: number, maxPossiblePoints: number, score: number}> = [];
    
    const sectionResult: ScoringResult = {
      title: section,
      score: 0,
      maxPossiblePoints: 0,
      criteria: []
    };

    // Process criteria-based scoring for this section
    sectionCriteria.forEach(criteria => {
      const criteriaResult = this.processCriteria(criteria, profileData);
      if (criteriaResult) {
        criteriaDetails.push(criteriaResult);
        sectionScore += criteriaResult.score;
        sectionMaxScore += criteriaResult.maxPossiblePoints;
      }
    });

    sectionResult.score = sectionScore;
    sectionResult.maxPossiblePoints = sectionMaxScore;
    sectionResult.criteria = criteriaDetails.map(detail => ({
      title: detail.title,
      point: detail.score
    }));

    return sectionResult;
  }

  /**
   * Processes individual scoring criteria and returns the result
   * @param {ScoringCriteria} criteria - The criteria to process
   * @param {any} profileData - The profile data to analyze
   * @returns {Object|null} Criteria result or null if not applicable
   */
  private processCriteria(criteria: ScoringCriteria, profileData: any): {title: string, point: number, maxPossiblePoints: number, score: number} | null {
    const maxScore = parseInt(criteria.max_score);

    switch (criteria.section) {
      case "linkedInUrl":
        return this.processLinkedInUrlCriteria(criteria, profileData, maxScore);
      
      case "location":
        return this.processLocationCriteria(criteria, profileData, maxScore);
      
      case "headline":
        return this.processHeadlineCriteria(criteria, profileData, maxScore);
      
      case "summary":
        return this.processSummaryCriteria(criteria, profileData, maxScore);
      
      case "experiences":
        return this.processExperiencesCriteria(criteria, profileData, maxScore);
      
      case "education":
        return this.processEducationCriteria(criteria, profileData, maxScore);
      
      case "skills":
        return this.processSkillsCriteria(criteria, profileData, maxScore);

      case "publications":
        return this.processPublicationsCriteria(criteria, profileData, maxScore);

      case "certificates":
        return this.processCertificatesCriteria(criteria, profileData, maxScore);

      case "honorsAwards":
        return this.processHonorsAwardsCriteria(criteria, profileData, maxScore);

      case "languages":
        return this.processLanguagesCriteria(criteria, profileData, maxScore);

      case "volunteer":
        return this.processVolunteerCriteria(criteria, profileData, maxScore);

      case "projects":
        return this.processProjectsCriteria(criteria, profileData, maxScore);

      case "recommendations":
        return this.processRecommendationsCriteria(criteria, profileData, maxScore);

      case "causes":
        return this.processCausesCriteria(criteria, profileData, maxScore);

      case "patents":
        return this.processPatentsCriteria(criteria, profileData, maxScore);

      case "testScores":
        return this.processTestScoresCriteria(criteria, profileData, maxScore);

      case "organizations":
        return this.processOrganizationsCriteria(criteria, profileData, maxScore);

      case "contactInfo":
        return this.processContactInfoCriteria(criteria, profileData, maxScore);

      case "featured":
        return this.processFeaturedCriteria(criteria, profileData, maxScore);

      default:
        return null;
    }
  }

  private processLinkedInUrlCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "check") {
      // Extract the last parameter from the current URL
      const currentUrl = window.location.href;
      const linkedInUrlMatch = currentUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
      
      let hasNumbersInUrl = false;
      let customUrlValue = '';
      
      if (linkedInUrlMatch && linkedInUrlMatch[1]) {
        const urlParam = linkedInUrlMatch[1];
        // Check if the URL parameter ends with numbers
        hasNumbersInUrl = /\d+$/.test(urlParam);
        customUrlValue = urlParam;
      }
      
      const score = hasNumbersInUrl ? 0 : maxScore;
      
      // Get current language and translations
      const { getTranslation } = require('./translations');
      const noCustomUrlText = getTranslation(this.language, 'noCustomLinkedInUrlFound');
      const customUrlText = getTranslation(this.language, 'customLinkedInUrlFound');
      
      return {
        title: hasNumbersInUrl ? noCustomUrlText : `${customUrlText} ${customUrlValue}`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score,
      };
    }

    return null;
  }

  private processPublicationsCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length") {
      // Handle both AI response format (publications as number) and original format
      const publicationsCount = typeof profileData.publications === 'number' ? profileData.publications : 
                               parseInt(profileData.publications) || 0;
      const minPublications = criteria.calculate?.min || 1;
      const score = publicationsCount >= minPublications ? maxScore : Math.round((publicationsCount / minPublications) * maxScore);
      
      // Get current language and translations
      // const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const { getTranslation } = require('./translations');
      const publicationsText = getTranslation(this.language, 'publications');
      
      return {
        title: `${publicationsText} (${publicationsCount}/${minPublications})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processLanguagesCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length") {
      // Handle both AI response format (languages as number) and original format
      const languagesCount = typeof profileData.languages === 'number' ? profileData.languages : 
                            parseInt(profileData.languages) || 0;
      const minLanguages = criteria.calculate?.min || 1;
      const score = languagesCount >= minLanguages ? maxScore : Math.round((languagesCount / minLanguages) * maxScore);

      const { getTranslation } = require('./translations');
      const languagesText = getTranslation(this.language, 'languages');
      
      return {
        title: `${languagesText} (${languagesCount}/${minLanguages})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };  
    }
    return null;
  }

  private processCertificatesCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length") {
      // Handle both AI response format (certificates as number) and original format
      const certificatesCount = typeof profileData.certificates === 'number' ? profileData.certificates : 
                               parseInt(profileData.certificates) || 0;
      const minCertificates = criteria.calculate?.min || 1;
      const score = certificatesCount >= minCertificates ? maxScore : Math.round((certificatesCount / minCertificates) * maxScore);
      
      // Get current language and translations
      // const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const { getTranslation } = require('./translations');
      const certificatesText = getTranslation(this.language, 'certificates');
      
      return {
        title: `${certificatesText} (${certificatesCount}/${minCertificates})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processHonorsAwardsCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length") {
      // Handle both AI response format (honorsAwards as number) and original format
      const honorsAwardsCount = typeof profileData.honorsAwards === 'number' ? profileData.honorsAwards : 
                                parseInt(profileData.honorsAwards) || 0;
      const minHonorsAwards = criteria.calculate?.min || 1;
      const score = honorsAwardsCount >= minHonorsAwards ? maxScore : Math.round((honorsAwardsCount / minHonorsAwards) * maxScore);
      
      // Get current language and translations
      // const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const { getTranslation } = require('./translations');
      const honorsAwardsText = getTranslation(this.language, 'honorsAwards');
      
      return {
        title: `${honorsAwardsText} (${honorsAwardsCount}/${minHonorsAwards})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processVolunteerCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length") {
      // Handle both AI response format (volunteering as number) and original format (volunteer)
      const volunteerCount = typeof profileData.volunteering === 'number' ? profileData.volunteering : 
                            typeof profileData.volunteer === 'number' ? profileData.volunteer :
                            parseInt(profileData.volunteer) || 0;
      const minVolunteer = criteria.calculate?.min || 1;
      const score = volunteerCount >= minVolunteer ? maxScore : Math.round((volunteerCount / minVolunteer) * maxScore);
      
      // Get current language and translations
      // const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const { getTranslation } = require('./translations');
      const volunteerText = getTranslation(this.language, 'volunteer');
      
      return {
        title: `${volunteerText} (${volunteerCount}/${minVolunteer})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processLocationCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "notEmpty") {
      // Handle both AI response format (location) and original format (country)
      const hasLocation = !!(profileData.country || profileData.location);
      const score = hasLocation ? maxScore : 0;
      
      // Get current language and translations
      // const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const { getTranslation } = require('./translations');
      const countryInformationText = getTranslation(this.language, 'countryInformation');
      
      return {
        title: countryInformationText,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processHeadlineCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length" && criteria.calculate?.type === "words") {
      // Handle both AI response format (headline) and original format
      const headlineText = profileData.headline || '';
      const wordCount = headlineText ? headlineText.split(/\s+/).length : 0;
      const minWords = criteria.calculate.min || 10;
      const score = wordCount >= minWords ? maxScore : Math.round((wordCount / minWords) * maxScore);
      
      // Get current language and translations
      const { getTranslation } = require('./translations');
      const headlineLengthText = getTranslation(this.language, 'headlineLength');
      const wordsText = getTranslation(this.language, 'words');
      
      return {
        title: `${headlineLengthText} (${wordCount}/${minWords} ${wordsText})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    } 
    return null;
  }

  private processSummaryCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length" && criteria.calculate?.type === "words") {
      // Handle both AI response format (about) and original format (summary)
      const summaryText = profileData.about || profileData.summary || '';
      const wordCount = summaryText ? summaryText.split(/\s+/).length : 0;
      const minWords = criteria.calculate.min || 200;
      const score = wordCount >= minWords ? maxScore : Math.round((wordCount / minWords) * maxScore); // Full mark on length regardless of word count
      
      // Get current language and translations
      // const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const { getTranslation } = require('./translations');
      const summaryLengthText = getTranslation(this.language, 'summaryLength');
      const wordsText = getTranslation(this.language, 'words');
      
      return {
        title: `${summaryLengthText} (${wordCount}/${minWords} ${wordsText})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processExperiencesCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "notEmpty" && criteria.calculate?.section === "description") {
      // Handle both AI response format (experience) and original format (experiences)
      const experiences = Array.isArray(profileData.experience) ? profileData.experience : 
                         Array.isArray(profileData.experiences) ? profileData.experiences : [];
      const experiencesWithContent = experiences.filter((exp: any) => 
        exp && exp.description && exp.description.trim().length > 0
      );

      const score = experiencesWithContent.length > 0 ? maxScore : 0;
      
      // Get current language and translations
      const { getTranslation } = require('./translations');
      const hasExperienceDescriptionsText = getTranslation(this.language, 'hasExperienceDescriptions');
      
      return {
        title: `${hasExperienceDescriptionsText} (${experiencesWithContent.length})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    } else if (criteria.criteria === "length") {
      // Handle both AI response format (experience) and original format (experiences)
      const experienceCount = Array.isArray(profileData.experience) ? profileData.experience.length : 
                             Array.isArray(profileData.experiences) ? profileData.experiences.length : 0;
      const minExperiences = criteria.calculate?.min || 3;
      const score = experienceCount >= minExperiences ? maxScore : Math.round((experienceCount / minExperiences) * maxScore);
      
      // Get current language and translations
      // const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const { getTranslation } = require('./translations');
      const numberOfExperiencesText = getTranslation(this.language, 'numberOfExperiences');
      
      return {
        title: `${numberOfExperiencesText} (${experienceCount}/${minExperiences})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processEducationCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "notEmpty") {
      // Handle both AI response format (education) and original format
      const educationCount = Array.isArray(profileData.education) ? profileData.education.length : 0;
      const score = educationCount > 0 ? maxScore : 0;
      
      // Get current language and translations
      // const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const { getTranslation } = require('./translations');
      const educationEntriesText = getTranslation(this.language, 'educationEntries');
      
      return {
        title: `${educationEntriesText} (${educationCount})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processSkillsCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length") {
      const skillsCount = profileData.skillsCount || 
                         (Array.isArray(profileData.skills) ? profileData.skills.length : 0);
      const minSkills = criteria.calculate?.min || 3;
      const score = skillsCount >= minSkills ? maxScore : Math.round((skillsCount / minSkills) * maxScore);
      
      const { getTranslation } = require('./translations');
      const numberOfSkillsText = getTranslation(this.language, 'numberOfSkills');
      
      return {
        title: `${numberOfSkillsText} (${skillsCount}/${minSkills})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processProjectsCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "notEmpty") {
      // Handle both AI response format (projects as array) and original format (projects as object with content)
      const projectsCount = Array.isArray(profileData.projects) ? profileData.projects.length : 
                           (profileData.projects?.content ? 1 : 0);
      const score = projectsCount > 0 ? maxScore : 0;
      
      const { getTranslation } = require('./translations');
      const projectsPresentText = getTranslation(this.language, 'projectsPresent');
      
      return {
        title: `${projectsPresentText} (${projectsCount})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processRecommendationsCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length") {
      // Handle both AI response format (recommendationsCount as number) and original format (recommendations as object with content)
      const recommendationsCount = typeof profileData.recommendationsCount === 'number' ? profileData.recommendationsCount : 
                                  (profileData.recommendations?.content ? 1 : 0);
      const minRecommendations = criteria.calculate?.min || 1;
      const score = recommendationsCount >= minRecommendations ? maxScore : Math.round((recommendationsCount / minRecommendations) * maxScore);
      
      const { getTranslation } = require('./translations');
      const recommendationsText = getTranslation(this.language, 'recommendations');
      
      return {
        title: `${recommendationsText} (${recommendationsCount}/${minRecommendations})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processCausesCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length") {
      // Handle both AI response format (causes as number) and original format (causes as object with content)
      const causesCount = typeof profileData.causes === 'number' ? profileData.causes : 
                         (profileData.causes?.content ? 1 : 0);
      const minCauses = criteria.calculate?.min || 1;
      const score = causesCount >= minCauses ? maxScore : Math.round((causesCount / minCauses) * maxScore);
      
      const { getTranslation } = require('./translations');
      const causesText = getTranslation(this.language, 'causes') || 'Causes';
      
      return {
        title: `${causesText} (${causesCount}/${minCauses})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }

  private processPatentsCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    const content = profileData.patents?.content || '';
    let score = 0;
    if (criteria.criteria === 'length') {
      score = content && content.length > 0 ? maxScore : 0;
    }
    return {
      title: 'Patents',
      point: score,
      maxPossiblePoints: maxScore,
      score: score,
    };
  }
  private processTestScoresCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    const content = profileData.testScores || '';
    let score = 0;
    if (criteria.criteria === 'length') {
      score = content && content.length > 0 ? maxScore : 0;
    }
    return {
      title: 'Test Scores',
      point: score,
      maxPossiblePoints: maxScore,
      score: score,
    };
  }
  private processOrganizationsCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    const content = profileData.organizations || '';
    let score = 0;
    if (criteria.criteria === 'length') {
      score = parseInt(content ) > 0 ? maxScore : 0;
    }
    return {
      title: 'Organizations',
      point: score,
      maxPossiblePoints: maxScore,
      score: score,
    };
  }

  private processFeaturedCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    if (criteria.criteria === "length") {
      // Handle both AI response format (featured as number) and original format
      const featuredCount = typeof profileData.featured === 'number' ? profileData.featured : 
                           profileData.featured?.content ? 1 : 0;
      const minFeatured = criteria.calculate?.min || 1;
      const score = featuredCount >= minFeatured ? maxScore : Math.round((featuredCount / minFeatured) * maxScore);
      
      // Get current language and translations
      const { getTranslation } = require('./translations');
      const featuredText = getTranslation(this.language, 'featured');
      
      return {
        title: `${featuredText} (${featuredCount}/${minFeatured})`,
        point: score,
        maxPossiblePoints: maxScore,
        score: score
      };
    }
    return null;
  }
  private processContactInfoCriteria(criteria: ScoringCriteria, profileData: any, maxScore: number) {
    const content = profileData.contactInfo?.content || '';
    let score = 0;
    if (criteria.criteria === 'notEmpty') {
      score = content && content.length > 0 ? maxScore : 0;
    }
    return {
      title: 'Contact Info',
      point: score,
      maxPossiblePoints: maxScore,
      score: score,
    };
  }


  /**
   * Analyzes a LinkedIn profile using AI and returns comprehensive insights
   * @param {any} profileData - The profile data to analyze
   * @param {number} retryCount - Current retry attempt (internal use)
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh analysis
   * @param {string} [aiProvider='openai'] - AI provider to use ('openai' or 'gemini')
   * @returns {Promise<AIAnalysisResult>} Comprehensive analysis result
   */
  async analyzeProfile(profileData: any, retryCount: number = 0, forceRefresh: boolean = false, aiProvider: string = 'openai'): Promise<AIAnalysisResult> {
    const maxRetries = 3;
    const cachedResult = localStorage.getItem(window.location.href);

    if (cachedResult && !forceRefresh) {
      return JSON.parse(cachedResult);
    }

    try {
      // const language = document.documentElement.lang === 'ar' ? 'Arabic' : 'English';
      const prompt = this.buildAnalysisPrompt(profileData);
      
      const response = await this.callAI(prompt, aiProvider);
      
      const aiResult = this.parseAIResponse(response);
      localStorage.setItem(window.location.href, JSON.stringify(aiResult));
      return aiResult;
    } catch (error) {
      // Retry logic for certain types of errors
      if (retryCount < maxRetries && this.shouldRetry(error)) {
        await this.delay(13000 * (retryCount + 1)); // Exponential backoff
        return this.analyzeProfile(profileData, retryCount + 1, forceRefresh, aiProvider);
      }

      // If OpenAI fails, try Gemini as fallback
      if (aiProvider === 'openai' && retryCount === 0) {
        try {
          return this.analyzeProfile(profileData, 0, forceRefresh, 'gemini');
        } catch (geminiError) {
          // If both fail, use fallback analysis
        }
      }

      return this.getEnhancedFallbackAnalysis(profileData);
    }
  }

  /**
   * Calls the appropriate AI provider based on the specified provider
   * @param {string} prompt - The prompt to send to the AI
   * @param {string} provider - The AI provider to use ('openai' or 'gemini')
   * @returns {Promise<string>} The AI response
   */
  private async callAI(prompt: string, provider: string = 'openai'): Promise<string> {
    switch (provider.toLowerCase()) {
      case 'gemini':
        return this.callGemini(prompt);
      case 'openai':
      default:
        return this.callOpenAI(prompt);
    }
  }

  /**
   * Determines if an error should trigger a retry attempt
   * @param {unknown} error - The error to evaluate
   * @returns {boolean} True if the error is retryable
   */
  private shouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // Retry on network errors, rate limits, or temporary API issues
      return message.includes('network') || 
             message.includes('timeout') || 
             message.includes('rate limit') ||
             message.includes('quota') ||
             message.includes('temporary');
    }
    return false;
  }

  /**
   * Creates a delay promise for retry backoff
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>} Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Makes a request to the OpenAI API
   * @param {string} prompt - The prompt to send to the AI
   * @returns {Promise<string>} The AI response
   * @throws {Error} When the API request fails
   */
  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.openAIKey) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openAIKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Makes a request to the Gemini AI API
   * @param {string} prompt - The prompt to send to the AI
   * @returns {Promise<string>} The AI response
   * @throws {Error} When the API request fails
   */
  private async callGemini(prompt: string): Promise<string> {
    if (!this.geminiKey) {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }



  /**
   * Builds the analysis prompt for the OpenAI API
   * @param {any} profileData - The profile data to include in the prompt
   * @returns {string} The formatted prompt string
   */
  private buildAnalysisPrompt(profileData: any): string {
    return `Analyze this LinkedIn profile data and provide a comprehensive assessment. Return your response in JSON format with the following structure:

    {
        "profilePicture": string,
        "backgroundImage": string,
        "headline": string,
        "profileImageTitle": string,
        "location": string,
        "connections": number ,
        "followers": number ,
        "about": string,
        "aboutLength": number,
        "openToWork": boolean,
        "certificates": number,
        "volunteering": number,
        "languages": number,
        "name": string,
        "testScores": string,
        "patents": number,
        "causes": number,
        "organizations": number,
        "topSkills": ["skill1", "skill2", ...],
        "experience": [
            {
            "title": string,
            "description": string,
            "role": string,
            "company": string,
            "duration": string, 
            "length": "year month days"
            }
        ],
        "experienceCount": number,
        "education": [
            {
            "school": string,
            "degree": string,
            "field": string,
            "duration": string
            }
        ],
      "educationCount": number,
        "projects": [
          {
          "title": string,
          "description": string,
          "url": string
          }
      ],
      "projectsCount": number,

      "skills": [
          {
          "name": string,
          "endorsements": number
          }
      ],
      "skillsCount": number,

      "recommendationsCount": number,

      "publications": number,
      "courses": number,
      "honorsAwards": number,

      "overallScore": number (1-100),
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
        "honorsAwards": ["recommendation1", "recommendation2", ...],
        "languages": ["recommendation1", "recommendation2", ...],
        "certificates": ["recommendation1", "recommendation2", ...],
        "volunteer": ["recommendation1", "recommendation2", ...],
        "linkedinurl": ["recommendation1", "recommendation2", ...],
        "headline": ["recommendation1", "recommendation2", ...],
        "country": ["recommendation1", "recommendation2", ...],
        "featured": number,
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
      "summary": "string",
      "scoringBreakdown": [
          {
              "title": "string",
              "score": number,
              "maxPossiblePoints": number,
              "recommendations": ["recommendation1", "recommendation2", ...],
              "criteria": [
                  {
                      "title": "string",
                      "point": number
                  }
              ]
          }
      ],
    }

    Profile Data:
    - Extract from "${profileData?.headline || 'Not provided'}": full name, number of connections, number of followers, location formatted as "country, city", and headline.
    - Extract from "${profileData?.about?.content || 'Not provided'}": get the whole content for linkedin about section (about) and a list of top skills ( topSkills).
    - Extract from "${profileData?.experience?.content || 'Not provided'}": a detailed array of experiences including title, description, role, company, duration, length, and total number of experiences ( number of experiences is usually in text like "show all {number of experiences} experiences" or عرض ال{number of experiences}  خبرات كلها).
    - Extract from "${profileData?.education?.content || 'Not provided'}": a detailed array of education entries including school, degree, field of study, duration, and total number of education entries.
    - Extract from "${profileData?.projects?.content || 'Not provided'}": a detailed array of projects including title, description, URL, and total number of projects (projectsCount) the number of all projects usualy is be in text like "show all {number of projects} projects" or عرض ال{number of projects}  مشاريع كلها.
    - Extract from "${profileData?.skills?.content || 'Not provided'}": a detailed array of skills including name, number of endorsements, and total number of skills (skillsCount) the number of all skills usualy is be in text like "show all {number of skills} skills" or عرض ال{number of skills}  مهارات كلها.
    - Extract from "${profileData?.recommendations?.content || 'Not provided'}": total number of recommendations (recommendationsCount).
    - Extract from "${profileData?.publications?.content || 'Not provided'}": total number of publications.
    - Extract from "${profileData?.courses?.content || 'Not provided'}": total number of courses.
    - Extract from "${profileData?.honorsAwards?.content || 'Not provided'}": total number of honors and awards.
    - Extract from "${profileData?.languages?.content || 'Not provided'}": a detailed array of languages including name and proficiency level ["language1", "language2", ...].
    - Extract from "${profileData?.basicInfo?.profilePicture || 'Not provided'}": URL of the profile picture.
    - Extract from "${profileData?.basicInfo?.backgroundImage || 'Not provided'}": URL of the background image.
    - Extract from "${profileData?.basicInfo?.profileImageTitle || 'Not provided'}": whether the profile is marked as open to work (true or false).
    - Extract from "${profileData?.volunteering?.content || 'Not provided'}": total number of volunteering experiences (volunteering).
    - Extract from "${profileData?.certificates?.content || 'Not provided'}": total number of certificates (certificates).
    - Extract from "${profileData?.testScores?.content || 'Not provided'}": total number of test scores (testScores).
    - Extract from "${profileData?.organizations?.content || 'Not provided'}": total number of organizations (organizations).
    - Extract from "${profileData?.causes?.content || 'Not provided'}": total number of causes (causes).

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
    
    

    Return in the ${this.language === 'ar' ? 'Arabic' : 'English'} only valid JSON without any additional text or formatting.`;
  }

  /**
   * Parses the AI response and extracts the analysis result
   * @param {string} response - The raw response from the AI
   * @returns {AIAnalysisResult} The parsed analysis result
   * @throws {Error} When parsing fails
   */
  private parseAIResponse(response: string): AIAnalysisResult {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        
        const parsed = JSON.parse(jsonString);
        const { overallScore, scoringBreakdown } = this.calculateScore(parsed);
        
        return {
          ...{...parsed, ...{overallScore, scoringBreakdown}}
        };
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      throw error; // Re-throw to trigger fallback
    }
  }

  /**
   * Provides a fallback analysis when AI analysis fails
   * @param {any} profileData - The profile data to analyze
   * @returns {AIAnalysisResult} Basic analysis result using scoring system
   */
  private getEnhancedFallbackAnalysis(profileData: any): AIAnalysisResult {
    // Use the new comprehensive scoring system
    const { overallScore, scoringBreakdown } = this.calculateScore(profileData);
    
    // Extract basic insights from available data
    const hasName = !!profileData.name;
    const hasHeadline = !!profileData.headline;
    const hasSummary = !!profileData.about;
    const hasExperience = Array.isArray(profileData.experience) && profileData.experience.length > 0;
    const hasEducation = Array.isArray(profileData.education) && profileData.education.length > 0;
    const hasSkills = Array.isArray(profileData.skills) && profileData.skills.length > 0;
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    const profileOptimization: string[] = [];
    
    // Analyze strengths and weaknesses based on scoring breakdown
    scoringBreakdown.forEach(item => {
      const totalCriteriaPoints = item.criteria.reduce((sum, criteria) => sum + criteria.point, 0);
      const maxPossiblePoints = item.maxPossiblePoints;
      const percentage = maxPossiblePoints > 0 ? Math.round((totalCriteriaPoints / maxPossiblePoints) * 100) : 0;
      
      if (totalCriteriaPoints > 0) {
        const criteriaDetails = item.criteria.map(c => `${c.title} (${c.point}pts)`).join(', ');
        strengths.push(`${item.title}: ${criteriaDetails} - ${percentage}% complete`);
      } else {
        weaknesses.push(`${item.title}: Missing or incomplete (0/${maxPossiblePoints} points)`);
      }
    });
    
    // Generate recommendations based on scoring
    if (!hasSummary) recommendations.push('Add a compelling professional summary (minimum 200 words)');
    if (!hasHeadline) recommendations.push('Create a professional headline (minimum 10 words)');
    if (!hasExperience) recommendations.push('Add your work experience (minimum 3 positions)');
    if (!hasEducation) recommendations.push('Include your educational background');
    if (!hasSkills) recommendations.push('List relevant professional skills (minimum 3 skills)');
    if (hasSkills && Array.isArray(profileData.skills) && profileData.skills.length < 3) recommendations.push('Add more skills to increase visibility');
    if (!profileData.country) recommendations.push('Add your location information');
    if (!hasCustomLinkedInUrl()) recommendations.push('Create a custom LinkedIn URL');
    
    // Profile optimization suggestions
    profileOptimization.push('Complete all profile sections');
    profileOptimization.push('Add a professional profile photo');
    profileOptimization.push('Include relevant keywords in your summary');
    profileOptimization.push('Request recommendations from colleagues');
    profileOptimization.push('Engage with industry content regularly');
    profileOptimization.push('Add email contact information to your summary');
    
    // Extract keywords from available data
    const relevantKeywords: string[] = [];
    const missingKeywords: string[] = [];
    
    if (hasHeadline) {
      const headlineWords = profileData.headline.toLowerCase().split(/\s+/);
      relevantKeywords.push(...headlineWords.filter((word: any) => word.length > 3));
    }
    
    if (hasSkills && Array.isArray(profileData.skills)) {
      profileData.skills.forEach((skill: any) => {
        if (skill && skill.name) {
          relevantKeywords.push(skill.name.toLowerCase());
        }
      });
    }
    
    // Remove duplicates and limit
    const uniqueKeywords = relevantKeywords.filter((keyword, index) => relevantKeywords.indexOf(keyword) === index).slice(0, 10);
    
    return {
      overallScore,
      strengths: strengths.length > 0 ? strengths : ['Profile data extracted successfully'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['AI analysis temporarily unavailable'],
      recommendations: recommendations.length > 0 ? recommendations : ['Try refreshing the analysis later'],
      analysis_recommendations: recommendations.length > 0 ? recommendations : ['Try refreshing the analysis later'],
      industryInsights: 'Profile analysis completed using comprehensive scoring system. For deeper insights, ensure all profile sections are complete and try the AI analysis again.',
      profileOptimization,
      keywordAnalysis: {
        relevantKeywords: uniqueKeywords,
        missingKeywords: missingKeywords
      },
      competitiveAnalysis: 'Basic profile assessment completed. Complete your profile sections to get more detailed competitive analysis.',
      summary: `${profileData.name || 'This profile'} has a ${overallScore}/100 completeness score based on comprehensive criteria. ${strengths.length > 0 ? 'Top strengths: ' + strengths.slice(0, 2).join('; ') : 'Focus on completing profile sections.'} The analysis covers ${scoringBreakdown.length} profile sections with detailed scoring breakdown.`,
      scoringBreakdown
    };
  }



}

/**
 * Singleton instance of the AI profile analyzer
 */
export const aiAnalyzer = new AIProfileAnalyzer(); 

/**
 * Checks if the current LinkedIn profile has a custom URL
 * @returns {boolean} True if the profile has a custom URL, false otherwise
 */
export function hasCustomLinkedInUrl(): boolean {
  const currentUrl = window.location.href;
  const linkedInUrlMatch = currentUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
  if (linkedInUrlMatch && linkedInUrlMatch[1]) {
    const urlParam = linkedInUrlMatch[1];
    // Check if the URL parameter ends with numbers (non-customized) or doesn't end with numbers (customized)
    // A customized URL should NOT end with numbers
    return !/\d+$/.test(urlParam);
  }
  return false;
}