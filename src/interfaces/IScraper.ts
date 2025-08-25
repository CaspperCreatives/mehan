export interface LinkedInProfileData {
    name?: string;
    headline?: string;
    location?: string;
    summary?: string;
    experience?: Array<{
      title: string;
      company: string;
      duration: string;
      description?: string;
    }>;
    education?: Array<{
      school: string;
      degree: string;
      field: string;
      year?: string;
    }>;
    skills?: string[];
    recommendations?: number;
    connections?: number;
    profilePicture?: string;
    backgroundImage?: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      website?: string;
    };
    certifications?: Array<{
      name: string;
      issuer: string;
      issueDate?: string;
      expiryDate?: string;
    }>;
    languages?: Array<{
      name: string;
      proficiency?: string;
    }>;
    interests?: string[];
    volunteering?: Array<{
      organization: string;
      role: string;
      duration: string;
      description?: string;
    }>;
    publications?: Array<{
      title: string;
      publisher: string;
      date?: string;
      url?: string;
    }>;
    patents?: Array<{
      title: string;
      patentNumber: string;
      date?: string;
      description?: string;
    }>;
    courses?: Array<{
      name: string;
      institution: string;
      date?: string;
    }>;
    projects?: Array<{
      title: string;
      description: string;
      url?: string;
      technologies?: string[];
    }>;
    honors?: Array<{
      title: string;
      issuer: string;
      date?: string;
      description?: string;
    }>;
    testScores?: Array<{
      test: string;
      score: string;
      date?: string;
    }>;
  }
  
  export interface ScrapeProfileRequest {
    url: string;
    options?: {
      includeContactInfo?: boolean;
      includeRecommendations?: boolean;
      includeConnections?: boolean;
      includeSkills?: boolean;
      includeEducation?: boolean;
      includeExperience?: boolean;
      includeCertifications?: boolean;
      includeLanguages?: boolean;
      includeInterests?: boolean;
      includeVolunteering?: boolean;
      includePublications?: boolean;
      includePatents?: boolean;
      includeCourses?: boolean;
      includeProjects?: boolean;
      includeHonors?: boolean;
      includeTestScores?: boolean;
    };
  }
  
  export interface ScrapeProfileResponse {
    success: boolean;
    data?: LinkedInProfileData;
    error?: string;
    message?: string;
    metadata?: {
      scrapeTime?: number;
      url?: string;
      timestamp?: string;
    };
  }
  
  export interface ScrapeBatchRequest {
    urls: string[];
    options?: ScrapeProfileRequest['options'];
  }
  
  export interface ScrapeBatchResponse {
    success: boolean;
    data?: Array<{
      url: string;
      profile: LinkedInProfileData;
      success: boolean;
      error?: string;
    }>;
    error?: string;
    metadata?: {
      totalUrls: number;
      successfulScrapes: number;
      failedScrapes: number;
      totalTime: number;
    };
  }