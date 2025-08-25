export interface ScoringCriteria {
  section: string;
  criteria: string;
  max_score: string;
  calculate?: {
    type?: string;
    min?: number;
    section?: string;
  };
}

export interface SectionScore {
  section: string;
  score: number;
  maxScore: number;
  details: string;
}

export interface ProfileScore {
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  sectionScores: SectionScore[];
  grade: string;
}

export class ScoreService {
  private readonly SCORING_CRITERIA: ScoringCriteria[] = [
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

  public calculateProfileScore(profileData: any): ProfileScore {
    const sectionScores: SectionScore[] = [];
    let totalScore = 0;
    let maxTotalScore = 0;

    for (const criteria of this.SCORING_CRITERIA) {
      const maxScore = parseInt(criteria.max_score);
      maxTotalScore += maxScore;
      
      const score = this.calculateSectionScore(profileData, criteria);
      totalScore += score;
      
      sectionScores.push({
        section: criteria.section,
        score: score,
        maxScore: maxScore,
        details: this.getScoreDetails(profileData, criteria, score)
      });
    }

    const percentage = Math.round((totalScore / maxTotalScore) * 100);
    const grade = this.calculateGrade(percentage);

    return {
      totalScore,
      maxTotalScore,
      percentage,
      sectionScores,
      grade
    };
  }

  private calculateSectionScore(profileData: any, criteria: ScoringCriteria): number {
    const section = criteria.section;
    const criteriaType = criteria.criteria;
    
    switch (section) {
      case "linkedInUrl":
        return this.scoreLinkedInUrl(profileData, criteria);
      
      case "country":
        return this.scoreCountry(profileData, criteria);
      
      case "headline":
        if (criteriaType === "length") {
          return this.scoreHeadlineLength(profileData, criteria);
        } else if (criteriaType === "keywords") {
          return this.scoreHeadlineKeywords(profileData, criteria);
        }
        break;
      
      case "summary":
        if (criteriaType === "length") {
          return this.scoreSummaryLength(profileData, criteria);
        } else if (criteriaType === "email") {
          return this.scoreSummaryEmail(profileData, criteria);
        }
        break;
      
      case "experiences":
        if (criteriaType === "notEmpty") {
          return this.scoreExperiencesNotEmpty(profileData, criteria);
        } else if (criteriaType === "length") {
          return this.scoreExperiencesLength(profileData, criteria);
        }
        break;
      
      case "education":
        return this.scoreEducation(profileData, criteria);
      
      case "skills":
        return this.scoreSkills(profileData, criteria);
      
      case "publications":
        return this.scorePublications(profileData, criteria);
      
      case "languages":
        return this.scoreLanguages(profileData, criteria);
      
      case "certificates":
        return this.scoreCertificates(profileData, criteria);
      
      case "honorsAwards":
        return this.scoreHonorsAwards(profileData, criteria);
      
      case "volunteer":
        return this.scoreVolunteer(profileData, criteria);
      
      case "patents":
        return this.scorePatents(profileData, criteria);
      
      case "testScores":
        return this.scoreTestScores(profileData, criteria);
      
      case "organizations":
        return this.scoreOrganizations(profileData, criteria);
      
      case "featured":
        return this.scoreFeatured(profileData, criteria);
      
      case "projects":
        return this.scoreProjects(profileData, criteria);
      
      case "recommendations":
        return this.scoreRecommendations(profileData, criteria);
      
      case "causes":
        return this.scoreCauses(profileData, criteria);
      
      case "contactInfo":
        return this.scoreContactInfo(profileData, criteria);
      
      default:
        return 0;
    }
    
    return 0;
  }

  private scoreLinkedInUrl(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    return profileData.inputUrl ? maxScore : 0;
  }

  private scoreCountry(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    return (profileData.geoCountryName || profileData.countryCode) ? maxScore : 0;
  }

  private scoreHeadlineLength(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minWords = criteria.calculate?.min || 10;
    
    if (!profileData.headline) return 0;
    
    const wordCount = profileData.headline.trim().split(/\s+/).length;
    return wordCount >= minWords ? maxScore : Math.round((wordCount / minWords) * maxScore);
  }

  private scoreHeadlineKeywords(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    if (!profileData.headline) return 0;
    
    const headline = profileData.headline.toLowerCase();
    const keywords = ['developer', 'engineer', 'specialist', 'manager', 'lead', 'senior', 'junior', 'full-stack', 'frontend', 'backend'];
    const foundKeywords = keywords.filter(keyword => headline.includes(keyword));
    
    return Math.min(foundKeywords.length * 2, maxScore);
  }

  private scoreSummaryLength(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minWords = criteria.calculate?.min || 200;
    
    if (!profileData.summary) return 0;
    
    const wordCount = profileData.summary.trim().split(/\s+/).length;
    return wordCount >= minWords ? maxScore : Math.round((wordCount / minWords) * maxScore);
  }

  private scoreSummaryEmail(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    if (!profileData.summary) return 0;
    
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    return emailRegex.test(profileData.summary) ? maxScore : 0;
  }

  private scoreExperiencesNotEmpty(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    if (!profileData.positions || !Array.isArray(profileData.positions)) return 0;
    
    const hasDescriptions = profileData.positions.some((pos: any) => 
      pos.description && pos.description.trim().length > 0
    );
    
    return hasDescriptions ? maxScore : 0;
  }

  private scoreExperiencesLength(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 3;
    
    if (!profileData.positions || !Array.isArray(profileData.positions)) return 0;
    
    const experienceCount = profileData.positions.length;
    return experienceCount >= minCount ? maxScore : Math.round((experienceCount / minCount) * maxScore);
  }

  private scoreEducation(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    return (profileData.educations && profileData.educations.length > 0) ? maxScore : 0;
  }

  private scoreSkills(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 3;
    
    if (!profileData.skills || !Array.isArray(profileData.skills)) return 0;
    
    const skillCount = profileData.skills.length;
    return skillCount >= minCount ? maxScore : Math.round((skillCount / minCount) * maxScore);
  }

  private scorePublications(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    // Check for publications in the profile data
    const publicationCount = profileData.publications?.length || 0;
    return publicationCount >= minCount ? maxScore : 0;
  }

  private scoreLanguages(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    const languageCount = profileData.languages?.length || 0;
    return languageCount >= minCount ? maxScore : 0;
  }

  private scoreCertificates(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    const certificateCount = profileData.certifications?.length || 0;
    return certificateCount >= minCount ? maxScore : 0;
  }

  private scoreHonorsAwards(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    const honorsCount = profileData.honors?.length || 0;
    return honorsCount >= minCount ? maxScore : 0;
  }

  private scoreVolunteer(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    const volunteerCount = profileData.volunteerExperiences?.length || 0;
    return volunteerCount >= minCount ? maxScore : 0;
  }

  private scorePatents(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    // Check for patents in the profile data
    const patentCount = profileData.patents?.length || 0;
    return patentCount >= minCount ? maxScore : 0;
  }

  private scoreTestScores(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    // Check for test scores in the profile data
    const testScoreCount = profileData.testScores?.length || 0;
    return testScoreCount >= minCount ? maxScore : 0;
  }

  private scoreOrganizations(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    // Check for organizations in the profile data
    const organizationCount = profileData.organizations?.length || 0;
    return organizationCount >= minCount ? maxScore : 0;
  }

  private scoreFeatured(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    // Check for featured content in the profile data
    const featuredCount = profileData.featured?.length || 0;
    return featuredCount >= minCount ? maxScore : 0;
  }

  private scoreProjects(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    
    // Check for projects in the profile data
    const hasProjects = profileData.projects && profileData.projects.length > 0;
    return hasProjects ? maxScore : 0;
  }

  private scoreRecommendations(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    // Check for recommendations in the profile data
    const recommendationCount = profileData.recommendations?.length || 0;
    return recommendationCount >= minCount ? maxScore : 0;
  }

  private scoreCauses(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    const minCount = criteria.calculate?.min || 1;
    
    // Check for causes in the profile data
    const causeCount = profileData.causes?.length || 0;
    return causeCount >= minCount ? maxScore : 0;
  }

  private scoreContactInfo(profileData: any, criteria: ScoringCriteria): number {
    const maxScore = parseInt(criteria.max_score);
    
    // Check if we have any contact information
    const hasContactInfo = profileData.followersCount !== undefined || 
                          profileData.connectionsCount !== undefined ||
                          profileData.pictureUrl;
    
    return hasContactInfo ? maxScore : 0;
  }

  private getScoreDetails(profileData: any, criteria: ScoringCriteria, score: number): string {
    const section = criteria.section;
    const maxScore = parseInt(criteria.max_score);
    
    switch (section) {
      case "linkedInUrl":
        return profileData.inputUrl ? `LinkedIn URL present (${score}/${maxScore})` : `No LinkedIn URL (${score}/${maxScore})`;
      
      case "country":
        const country = profileData.geoCountryName || profileData.countryCode;
        return country ? `Country: ${country} (${score}/${maxScore})` : `No country specified (${score}/${maxScore})`;
      
      case "headline":
        if (criteria.criteria === "length") {
          const wordCount = profileData.headline ? profileData.headline.trim().split(/\s+/).length : 0;
          const minWords = criteria.calculate?.min || 10;
          return `Headline: ${wordCount} words (min: ${minWords}) (${score}/${maxScore})`;
        } else if (criteria.criteria === "keywords") {
          return `Headline keywords analysis (${score}/${maxScore})`;
        }
        break;
      
      case "summary":
        if (criteria.criteria === "length") {
          const wordCount = profileData.summary ? profileData.summary.trim().split(/\s+/).length : 0;
          const minWords = criteria.calculate?.min || 200;
          return `Summary: ${wordCount} words (min: ${minWords}) (${score}/${maxScore})`;
        } else if (criteria.criteria === "email") {
          const hasEmail = profileData.summary && /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(profileData.summary);
          return hasEmail ? `Email found in summary (${score}/${maxScore})` : `No email in summary (${score}/${maxScore})`;
        }
        break;
      
      case "experiences":
        if (criteria.criteria === "notEmpty") {
          const hasMeaningfulContent = profileData.positions && profileData.positions.some((pos: any) => 
            pos.title && pos.title.trim().length > 0 && 
            pos.companyName && pos.companyName.trim().length > 0
          );
          return hasMeaningfulContent ? `Experience content present (${score}/${maxScore})` : `No meaningful experience content (${score}/${maxScore})`;
        } else if (criteria.criteria === "length") {
          const experienceCount = profileData.positions?.length || 0;
          const minCount = criteria.calculate?.min || 3;
          return `Experiences: ${experienceCount} (min: ${minCount}) (${score}/${maxScore})`;
        }
        break;
      
      case "education":
        const educationCount = profileData.educations?.length || 0;
        return `Education entries: ${educationCount} (${score}/${maxScore})`;
      
      case "skills":
        const skillCount = profileData.skills?.length || 0;
        const minCount = criteria.calculate?.min || 3;
        return `Skills: ${skillCount} (min: ${minCount}) (${score}/${maxScore})`;
      
      case "publications":
        const publicationCount = profileData.publications?.length || 0;
        const pubMinCount = criteria.calculate?.min || 1;
        return `Publications: ${publicationCount} (min: ${pubMinCount}) (${score}/${maxScore})`;
      
      case "languages":
        const languageCount = profileData.languages?.length || 0;
        const langMinCount = criteria.calculate?.min || 1;
        return `Languages: ${languageCount} (min: ${langMinCount}) (${score}/${maxScore})`;
      
      case "certificates":
        const certificateCount = profileData.certifications?.length || 0;
        const certMinCount = criteria.calculate?.min || 1;
        return `Certifications: ${certificateCount} (min: ${certMinCount}) (${score}/${maxScore})`;
      
      case "honorsAwards":
        const honorsCount = profileData.honors?.length || 0;
        const honorsMinCount = criteria.calculate?.min || 1;
        return `Honors/Awards: ${honorsCount} (min: ${honorsMinCount}) (${score}/${maxScore})`;
      
      case "volunteer":
        const volunteerCount = profileData.volunteerExperiences?.length || 0;
        const volMinCount = criteria.calculate?.min || 1;
        return `Volunteer experiences: ${volunteerCount} (min: ${volMinCount}) (${score}/${maxScore})`;
      
      case "patents":
        const patentCount = profileData.patents?.length || 0;
        const patentMinCount = criteria.calculate?.min || 1;
        return `Patents: ${patentCount} (min: ${patentMinCount}) (${score}/${maxScore})`;
      
      case "testScores":
        const testScoreCount = profileData.testScores?.length || 0;
        const testMinCount = criteria.calculate?.min || 1;
        return `Test scores: ${testScoreCount} (min: ${testMinCount}) (${score}/${maxScore})`;
      
      case "organizations":
        const organizationCount = profileData.organizations?.length || 0;
        const orgMinCount = criteria.calculate?.min || 1;
        return `Organizations: ${organizationCount} (min: ${orgMinCount}) (${score}/${maxScore})`;
      
      case "featured":
        const featuredCount = profileData.featured?.length || 0;
        const featMinCount = criteria.calculate?.min || 1;
        return `Featured content: ${featuredCount} (min: ${featMinCount}) (${score}/${maxScore})`;
      
      case "projects":
        const hasProjects = profileData.projects && profileData.projects.length > 0;
        return hasProjects ? `Projects present (${score}/${maxScore})` : `No projects (${score}/${maxScore})`;
      
      case "recommendations":
        const recommendationCount = profileData.recommendations?.length || 0;
        const recMinCount = criteria.calculate?.min || 1;
        return `Recommendations: ${recommendationCount} (min: ${recMinCount}) (${score}/${maxScore})`;
      
      case "causes":
        const causeCount = profileData.causes?.length || 0;
        const causeMinCount = criteria.calculate?.min || 1;
        return `Causes: ${causeCount} (min: ${causeMinCount}) (${score}/${maxScore})`;
      
      case "contactInfo":
        const hasContactInfo = profileData.followersCount !== undefined || 
                              profileData.connectionsCount !== undefined ||
                              profileData.pictureUrl;
        return hasContactInfo ? `Contact info present (${score}/${maxScore})` : `No contact info (${score}/${maxScore})`;
      
      default:
        return `${section}: ${score}/${maxScore}`;
    }
    
    return `${section}: ${score}/${maxScore}`;
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return "A+";
    if (percentage >= 85) return "A";
    if (percentage >= 80) return "A-";
    if (percentage >= 75) return "B+";
    if (percentage >= 70) return "B";
    if (percentage >= 65) return "B-";
    if (percentage >= 60) return "C+";
    if (percentage >= 55) return "C";
    if (percentage >= 50) return "C-";
    if (percentage >= 45) return "D+";
    if (percentage >= 40) return "D";
    if (percentage >= 35) return "D-";
    return "F";
  }
}
