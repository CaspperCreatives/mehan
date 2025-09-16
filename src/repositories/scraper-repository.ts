import { firebaseRepository, ApiResponse, CallMethodOptions } from './firebase-repository';
import { LinkedInProfileData, ScrapeProfileRequest, ScrapeProfileResponse, ScrapeBatchResponse } from '../interfaces/IScraper';

export class ScraperRepository {
  private firebaseRepo = firebaseRepository;

  /**
   * Scrape a single LinkedIn profile
   * @param url - LinkedIn profile URL to scrape
   * @param options - Optional scraping configuration
   * @param callOptions - Firebase call options
   * @returns Promise with scraped profile data
   */
  async scrapeLinkedInProfile(
    url: string,
    options?: ScrapeProfileRequest['options'],
    callOptions?: CallMethodOptions
  ): Promise<ScrapeProfileResponse> {
    try {
      const requestData: ScrapeProfileRequest = {
        url,
        options: options || {
          includeContactInfo: true,
          includeRecommendations: true,
          includeConnections: true,
          includeSkills: true,
          includeEducation: true,
          includeExperience: true,
          includeCertifications: true,
          includeLanguages: true,
          includeInterests: true,
          includeVolunteering: true,
          includePublications: true,
          includePatents: true,
          includeCourses: true,
          includeProjects: true,
          includeHonors: true,
          includeTestScores: true
        }
      };

      const defaultCallOptions: CallMethodOptions = {
        timeout: 120000, // 2 minutes for scraping
        retries: 3,
        retryDelay: 2000,
        ...callOptions
      };

      const result = await this.firebaseRepo.callMethodWithType<LinkedInProfileData>(
        'scrapeLinkedInProfile',
        requestData,
        defaultCallOptions
      );

      
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: {
          scrapeTime: Date.now(),
          url,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          scrapeTime: Date.now(),
          url,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Scrape multiple LinkedIn profiles in batch
   * @param urls - Array of LinkedIn profile URLs
   * @param options - Optional scraping configuration
   * @param callOptions - Firebase call options
   * @returns Promise with batch scraped data
   */
  async scrapeLinkedInProfilesBatch(
    urls: string[],
    options?: ScrapeProfileRequest['options'],
    callOptions?: CallMethodOptions
  ): Promise<ScrapeBatchResponse> {
    const startTime = Date.now();
    const results: Array<{
      url: string;
      profile: LinkedInProfileData;
      success: boolean;
      error?: string;
    }> = [];

    let successfulScrapes = 0;
    let failedScrapes = 0;

    for (const url of urls) {
      try {
        const result = await this.scrapeLinkedInProfile(url, options, callOptions);
        
        if (result.success && result.data) {
          results.push({
            url,
            profile: result.data,
            success: true
          });
          successfulScrapes++;
        } else {
          results.push({
            url,
            profile: {},
            success: false,
            error: result.error
          });
          failedScrapes++;
        }
      } catch (error) {
        results.push({
          url,
          profile: {},
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failedScrapes++;
      }
    }

    const totalTime = Date.now() - startTime;

    return {
      success: successfulScrapes > 0,
      data: results,
      metadata: {
        totalUrls: urls.length,
        successfulScrapes,
        failedScrapes,
        totalTime
      }
    };
  }


  /**
   * Analyze a LinkedIn profile
   * @param url - LinkedIn profile URL to analyze
   * @param language - Language for the analysis
   * @returns Promise with analysis results
   */
  async analyzeLinkedInProfile(url: string, language?: string, forceRefresh?: boolean, userId?: string): Promise<ApiResponse> {
    try {
      const result = await this.firebaseRepo.callMethodWithType('analyzeLinkedInProfile', { url, language, forceRefresh, userId });
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate LinkedIn URL format
   * @param url - URL to validate
   * @returns Boolean indicating if URL is valid
   */
  validateLinkedInUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'www.linkedin.com' || urlObj.hostname === 'linkedin.com';
    } catch {
      return false;
    }
  }

  /**
   * Extract LinkedIn profile ID from URL
   * @param url - LinkedIn profile URL
   * @returns Profile ID or null if invalid
   */
  extractProfileId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      
      if (pathParts.length >= 2 && pathParts[0] === 'in') {
        return pathParts[1];
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Test scraper functionality
   * @returns Promise with test results
   */
  async testScraper(): Promise<ApiResponse> {
    return this.firebaseRepo.callMethod('testScraper');
  }

  /**
   * Get scraper status and health
   * @returns Promise with scraper status
   */
  async getScraperStatus(): Promise<ApiResponse> {
    return this.firebaseRepo.callMethod('getScraperStatus');
  }

  /**
   * Get scraping statistics
   * @returns Promise with scraping stats
   */
  async getScrapingStats(): Promise<ApiResponse> {
    return this.firebaseRepo.callMethod('getScrapingStats');
  }
}

// Export a singleton instance
export const scraperRepository = new ScraperRepository();

// Export the class for testing or custom instances
export default ScraperRepository;







const MOCKED_LINKEDIN_PROFILE_DATA = {
  "success": true,
  "data": {
      "profile": [
          {
              "id": "617472312",
              "profileId": "ACoAACTN4TgBpusMem1FxAfDNtBaeMXzc1DN38c",
              "firstName": "mohammad",
              "lastName": "omari",
              "occupation": "Mid-Senior Frontend developer",
              "publicIdentifier": "mohammad-omari-620959152",
              "trackingId": "vfiPgV1XREOIxrc7WVbOtw==",
              "pictureUrl": "https://media.licdn.com/dms/image/v2/D4E03AQEgx5JEGssa_A/profile-displayphoto-scale_100_100/B4EZfA6yqUHcAc-/0/1751288327700?e=1758758400&v=beta&t=vWE4G0cA1bFA2PcStGT8iWwh9rswe7cI7Cyfdp5dDWE",
              "countryCode": "jo",
              "geoUrn": "urn:li:fs_geo:105255939",
              "positions": [
                  {
                      "title": "Frontend Developer",
                      "timePeriod": {
                          "startDate": {
                              "month": 3,
                              "year": 2025
                          }
                      },
                      "company": {
                          "employeeCountRange": {
                              "start": 201,
                              "end": 500
                          },
                          "industries": [
                              "Banking"
                          ],
                          "objectUrn": "urn:li:company:163243",
                          "entityUrn": "urn:li:fs_miniCompany:163243",
                          "name": "CR2",
                          "showcase": false,
                          "active": true,
                          "logo": "https://media.licdn.com/dms/image/v2/D4E0BAQFYS7sfinqJPA/company-logo_200_200/company-logo_200_200/0/1727941170132/cr2_logo?e=1758758400&v=beta&t=BpYABGOr1QTlKWFe6YjIOoyrgXebgOE5IFQvJRbJtS4",
                          "universalName": "cr2",
                          "dashCompanyUrn": "urn:li:fsd_company:163243",
                          "trackingId": "BUxywW+ARVyj07cx39qJGw=="
                      },
                      "companyName": "CR2"
                  },
                  {
                      "title": "Mid-Senior frontend developer",
                      "locationName": "Amman, Jordan",
                      "timePeriod": {
                          "endDate": {
                              "month": 3,
                              "year": 2025
                          },
                          "startDate": {
                              "month": 7,
                              "year": 2023
                          }
                      },
                      "company": {
                          "employeeCountRange": {
                              "start": 201,
                              "end": 500
                          },
                          "industries": [
                              "E-Learning"
                          ],
                          "objectUrn": "urn:li:company:2872181",
                          "entityUrn": "urn:li:fs_miniCompany:2872181",
                          "name": "Classera",
                          "showcase": false,
                          "active": true,
                          "logo": "https://media.licdn.com/dms/image/v2/C4D0BAQGpI0Jy_S9YeQ/company-logo_200_200/company-logo_200_200/0/1630509658642/classera_inc__logo?e=1758758400&v=beta&t=e1xlDuc0V35RtHHBprsqOkvQJhizhzKfzxpwGJiic1Y",
                          "universalName": "classera-inc-",
                          "dashCompanyUrn": "urn:li:fsd_company:2872181",
                          "trackingId": "etVb9DDeQSuVI2Sa2ELwjg=="
                      },
                      "companyName": "Classera"
                  },
                  {
                      "title": "Frontend Developer",
                      "locationName": "Amman, Jordan",
                      "timePeriod": {
                          "endDate": {
                              "month": 3,
                              "year": 2025
                          },
                          "startDate": {
                              "month": 4,
                              "year": 2021
                          }
                      },
                      "company": {
                          "employeeCountRange": {
                              "start": 201,
                              "end": 500
                          },
                          "industries": [
                              "E-Learning"
                          ],
                          "objectUrn": "urn:li:company:2872181",
                          "entityUrn": "urn:li:fs_miniCompany:2872181",
                          "name": "Classera",
                          "showcase": false,
                          "active": true,
                          "logo": "https://media.licdn.com/dms/image/v2/C4D0BAQGpI0Jy_S9YeQ/company-logo_200_200/company-logo_200_200/0/1630509658642/classera_inc__logo?e=1758758400&v=beta&t=e1xlDuc0V35RtHHBprsqOkvQJhizhzKfzxpwGJiic1Y",
                          "universalName": "classera-inc-",
                          "dashCompanyUrn": "urn:li:fsd_company:2872181",
                          "trackingId": "qJRFGTlbT+qy8YFNVYoeKg=="
                      },
                      "companyName": "Classera"
                  },
                  {
                      "title": "Full-stack Developer",
                      "timePeriod": {
                          "endDate": {
                              "month": 4,
                              "year": 2021
                          },
                          "startDate": {
                              "month": 12,
                              "year": 2020
                          }
                      },
                      "company": {
                          "employeeCountRange": {
                              "start": 201,
                              "end": 500
                          },
                          "industries": [
                              "E-Learning"
                          ],
                          "objectUrn": "urn:li:company:2872181",
                          "entityUrn": "urn:li:fs_miniCompany:2872181",
                          "name": "Classera",
                          "showcase": false,
                          "active": true,
                          "logo": "https://media.licdn.com/dms/image/v2/C4D0BAQGpI0Jy_S9YeQ/company-logo_200_200/company-logo_200_200/0/1630509658642/classera_inc__logo?e=1758758400&v=beta&t=e1xlDuc0V35RtHHBprsqOkvQJhizhzKfzxpwGJiic1Y",
                          "universalName": "classera-inc-",
                          "dashCompanyUrn": "urn:li:fsd_company:2872181",
                          "trackingId": "cmOh0L7KRSmbQRU8AMQj2w=="
                      },
                      "companyName": "Classera"
                  }
              ],
              "educations": [
                  {
                      "schoolName": "Yarmouk University",
                      "timePeriod": {
                          "endDate": {
                              "year": 2019
                          },
                          "startDate": {
                              "year": 2015
                          }
                      }
                  }
              ],
              "certifications": [],
              "courses": [],
              "honors": [],
              "languages": [],
              "skills": [
                  "Ionic Framework",
                  "Angular Material",
                  "Angular CLI",
                  "Bitbucket"
              ],
              "volunteerExperiences": [],
              "headline": "Mid-Senior Frontend developer ",
              "summary": "As a Mid-Senior Frontend Developer at Classera, I've translated complex concepts into user-friendly applications that enhance user experience and engagement. My educational foundation from Yarmouk University couples with hands-on skills in Angular (js and 18+), JavaScript, and HTML5, empowering me to contribute effectively to our dynamic team's goals.\n\nMy proficiency in TypeScript and NodeJs complements my frontend expertise, allowing for seamless full-stack development when needed. Dedicated to continuous learning and improvement, I am passionate about exploring new technologies and methodologies to keep our products at the forefront of the education technology industry.",
              "student": false,
              "industryName": "Software Development",
              "industryUrn": "urn:li:fs_industry:4",
              "geoLocationName": "Amman",
              "geoCountryName": "Jordan",
              "jobTitle": "Frontend Developer",
              "companyName": "CR2",
              "companyPublicId": "cr2",
              "companyLinkedinUrl": "https://www.linkedin.com/company/cr2",
              "following": false,
              "followable": true,
              "followersCount": 816,
              "connectionsCount": 500,
              "connectionType": 3,
              "inputUrl": "https://www.linkedin.com/in/mohammad-omari-620959152/"
          }
      ],
      "analysis": {
          "rawAnalysis": "### LinkedIn Profile Analysis\n\n#### 1. Professional Summary\nThe LinkedIn profile in question lacks essential components such as a name, headline, summary, location, industry, experience, education, and skills. This absence of information significantly hampers the ability to assess the individual's professional background, career aspirations, and areas of expertise. As a result, the profile does not convey any professional identity or personal branding, which are critical for networking and career advancement on the platform.\n\n#### 2. Key Strengths\nGiven the lack of information on the profile, it is impossible to identify any key strengths or competencies. A strong LinkedIn profile typically highlights skills, experiences, and achievements that can be leveraged for professional opportunities. The absence of this information indicates a need for foundational development in creating an impactful online presence.\n\n#### 3. Career Trajectory Analysis\nWithout any documented experience or education, there is no basis for analyzing career trajectory. A robust career analysis typically includes progression through roles, skills acquired, and professional development over time. In this case, the profile does not provide any evidence of career growth, aspirations, or industry engagement.\n\n#### 4. Recommendations for Profile Enhancement\nTo enhance the LinkedIn profile, the following recommendations are suggested:\n- **Add Basic Information**: Include a name, location, and a professional headline that succinctly summarizes your career focus or aspirations.\n- **Craft a Compelling Summary**: Write a brief summary that outlines your professional background, interests, and career goals. This should reflect your personality and professional brand.\n- **Detail Experience**: If applicable, list any work experiences, internships, or volunteer work, including roles, responsibilities, and achievements.\n- **Include Education**: Add educational background, including degrees obtained, institutions attended, and relevant coursework or honors.\n- **Highlight Skills**: Identify and list key skills that are relevant to your career interests. Endorsements for these skills can enhance credibility.\n- **Engage with Content**: Start sharing industry-related articles or personal insights to build visibility and showcase expertise.\n- **Network**: Connect with peers, industry leaders, and participate in relevant groups to increase engagement and visibility.\n\n#### 5. Industry Insights\nWithout a specified industry, it is challenging to provide tailored insights. However, general trends across industries indicate:\n- **Emphasis on Soft Skills**: Communication, teamwork, and adaptability remain critical across sectors.\n- **Importance of Continuous Learning**: Many industries value certifications and ongoing education, particularly in technology and healthcare.\n- **Networking and Personal Branding**: Building a professional network and maintaining an active online presence are increasingly important for career advancement.\n- **Diversity and Inclusion**: Many companies prioritize diversity, equity, and inclusion initiatives, making it vital for professionals to align with these values.\n\nIn conclusion, a significant overhaul and enhancement of the LinkedIn profile are necessary to establish a professional identity and leverage networking opportunities effectively.",
          "summary": "### LinkedIn Profile Analysis\n\n#### 1. Professional Summary\nThe LinkedIn profile in question lacks essential components such as a name, headline, summary, location, industry, experience, education, an...",
          "timestamp": "2025-08-25T21:31:39.731Z"
      },
      "profileScore": {
          "totalScore": 0,
          "maxTotalScore": 118,
          "percentage": 0,
          "sectionScores": [
              {
                  "section": "linkedInUrl",
                  "score": 0,
                  "maxScore": 5,
                  "details": "No LinkedIn URL (0/5)"
              },
              {
                  "section": "country",
                  "score": 0,
                  "maxScore": 5,
                  "details": "No country specified (0/5)"
              },
              {
                  "section": "headline",
                  "score": 0,
                  "maxScore": 10,
                  "details": "Headline: 0 words (min: 10) (0/10)"
              },
              {
                  "section": "headline",
                  "score": 0,
                  "maxScore": 10,
                  "details": "Headline keywords analysis (0/10)"
              },
              {
                  "section": "summary",
                  "score": 0,
                  "maxScore": 20,
                  "details": "Summary: 0 words (min: 200) (0/20)"
              },
              {
                  "section": "summary",
                  "score": 0,
                  "maxScore": 10,
                  "details": "No email in summary (0/10)"
              },
              {
                  "section": "experiences",
                  "score": 0,
                  "maxScore": 10,
                  "details": "No meaningful experience content (0/10)"
              },
              {
                  "section": "experiences",
                  "score": 0,
                  "maxScore": 10,
                  "details": "Experiences: 0 (min: 3) (0/10)"
              },
              {
                  "section": "education",
                  "score": 0,
                  "maxScore": 10,
                  "details": "Education entries: 0 (0/10)"
              },
              {
                  "section": "skills",
                  "score": 0,
                  "maxScore": 15,
                  "details": "Skills: 0 (min: 3) (0/15)"
              },
              {
                  "section": "publications",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Publications: 0 (min: 1) (0/1)"
              },
              {
                  "section": "languages",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Languages: 0 (min: 1) (0/1)"
              },
              {
                  "section": "certificates",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Certifications: 0 (min: 1) (0/1)"
              },
              {
                  "section": "honorsAwards",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Honors/Awards: 0 (min: 1) (0/1)"
              },
              {
                  "section": "volunteer",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Volunteer experiences: 0 (min: 1) (0/1)"
              },
              {
                  "section": "patents",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Patents: 0 (min: 1) (0/1)"
              },
              {
                  "section": "testScores",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Test scores: 0 (min: 1) (0/1)"
              },
              {
                  "section": "organizations",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Organizations: 0 (min: 1) (0/1)"
              },
              {
                  "section": "featured",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Featured content: 0 (min: 1) (0/1)"
              },
              {
                  "section": "projects",
                  "score": 0,
                  "maxScore": 1,
                  "details": "No projects (0/1)"
              },
              {
                  "section": "recommendations",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Recommendations: 0 (min: 1) (0/1)"
              },
              {
                  "section": "causes",
                  "score": 0,
                  "maxScore": 1,
                  "details": "Causes: 0 (min: 1) (0/1)"
              },
              {
                  "section": "contactInfo",
                  "score": 0,
                  "maxScore": 1,
                  "details": "No contact info (0/1)"
              }
          ],
          "grade": "F"
      }
  }
}