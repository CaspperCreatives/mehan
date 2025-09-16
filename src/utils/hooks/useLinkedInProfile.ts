import { useState, useEffect } from 'react';
import { aiAnalyzer } from '../aiAnalyzer';
import { AIAnalysisResult } from '../aiAnalyzer';
import { scraperService } from '../../services/scraper-service';
import { firebaseRepository } from '../../repositories/firebase-repository';
import { UserManager } from '../userManager';
import { OptimizedContentService } from '../../services/optimizedContentService';
import { generateUserId, extractProfileId, normalizeLinkedInUrl } from '../userIdGenerator';

interface BasicInfo {
  name: string;
  headline: string;
  location: string;
  profileImage: string;
  backgroundImage: string;
  profileImageTitle: string;
}

interface LinkedInProfile {
  basicInfo: BasicInfo;
  about: any;
  skills: any;
  experience: any;
  education: any;
  certifications: any;
  projects: any;
  languages: any;
  volunteering: any;
  featured: any;
  activity: any;
  recommendations: any;
  publications: any;
  courses: any;
  honorsAwards: any;
  causes: any;
  accomplishments: any;
  headline: any;
  patents: any; // NEW
  testScores: any; // NEW
  organizations: any; // NEW
  contactInfo: any; // NEW
}

export const useLinkedInProfile = (profileUrl?: string) => {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<any | null>(null);
  const [optimizedContentService] = useState(() => new OptimizedContentService());


  
  // Use provided URL or fall back to current page URL
  const url = profileUrl || window.location.href;

  const scrapeProfile = async (forceRefresh: boolean = false) => {
    try {
      setAiLoading(true);
      
      // Initialize UserManager with Firebase repository
      UserManager.setFirebaseRepository(firebaseRepository);
      
      // Check if we have existing user data in localStorage
      const existingUserId = localStorage.getItem(`linkedin-user-id-${url}`);
      
      // If we have a stored userId and not forcing refresh, fetch existing data from database
      if (existingUserId && !forceRefresh) {
        
        try {
          const existingUserData = await UserManager.fetchUserDataFromDatabase(url, forceRefresh);
          
          if (existingUserData) {
            
            // Set the profile data from existing user data
            if (existingUserData.profileData) {
              setProfile(existingUserData.profileData);
            }
            
            // Set AI analysis if available
            if (existingUserData.analysis) {
              setAiAnalysis(existingUserData.analysis);
            }
            
            // Load the complete user data into UserManager session for optimized content access
            try {
              await UserManager.updateUserSessionWithCompleteProfile(
                existingUserData.profileData,
                existingUserData.profileId,
                existingUserData.linkedinUrl
              );
              
              // If there's optimized content, add it to the session
              if (existingUserData.optimizedContent && existingUserData.optimizedContent.length > 0) {
                
                // Load each optimized content item into the session
                for (const content of existingUserData.optimizedContent) {
                  await UserManager.addOptimizedContentToSession(content);
                }
                
              }

              // Load limits from database into UserManager session
              const currentSession = await UserManager.getCurrentUserSession();
              if (currentSession) {
                // Always load both limits from database, with fallbacks to defaults
                const optimizationLimit = existingUserData.optimizationLimit ? {
                  remainingOptimizations: existingUserData.optimizationLimit.remainingOptimizations ,
                  hasOptimized: existingUserData.optimizationLimit.hasOptimized ?? false,
                  optimizedSection: existingUserData.optimizationLimit.optimizedSection,
                  optimizedAt: existingUserData.optimizationLimit.optimizedAt
                } : {
                  remainingOptimizations: 0,
                  hasOptimized: false,
                  optimizedSection: undefined,
                  optimizedAt: undefined
                };
                
                const refreshLimit = existingUserData.refreshLimit ? {
                  remainingRefreshes: existingUserData.refreshLimit.remainingRefreshes ?? 2,
                  lastRefreshDate: existingUserData.refreshLimit.lastRefreshDate ?? new Date().toDateString(),
                  totalRefreshes: existingUserData.refreshLimit.totalRefreshes ?? 0
                } : {
                  remainingRefreshes: 2,
                  lastRefreshDate: new Date().toDateString(),
                  totalRefreshes: 0
                };
                
                // Update the user session with both limits from database
                const updatedSession = {
                  ...currentSession,
                  optimizationLimit: optimizationLimit,
                  refreshLimit: refreshLimit
                };
                UserManager['currentUserSession'] = updatedSession;
              }
            } catch (sessionError) {
            }
            
            // Create a mock response structure for consistency
            const mockScrapedData = {
              success: true,
              data: {
                profile: existingUserData.profileData ? [existingUserData.profileData] : [],
                analysis: existingUserData.analysis,
                profileScore: existingUserData.profileScore
              },
              userId: existingUserId,
              cached: true,
              timestamp: existingUserData.updatedAt || new Date().toISOString()
            };
            
            setScrapedData(mockScrapedData);
            setAiLoading(false);
            setLoading(false);
            
            // Trigger a re-check of optimization limits after database data is loaded
            setTimeout(() => {
              // This will trigger the useEffect in AIAnalysisSidebar that depends on scrapedData
              setScrapedData((prev: any) => ({ ...prev, _forceLimitCheck: Date.now() }));
            }, 100);
            
            return; // Exit early with existing data - no API call needed
          } else {
            // Continue to API call below
          }
        } catch (dbError) {
          // Continue to API call below
        }
      }
      
      // Get current language from document or default to 'en'
      const currentLanguage = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const scrapedData = await scraperService.analyzeLinkedInProfile(url, currentLanguage, forceRefresh, existingUserId || undefined);
      
      // Store the raw scrapedData for debugging
      setScrapedData(scrapedData);
      
      // Debug: Log the entire response structure
      
      if (scrapedData?.success && scrapedData?.data) {
        setAiAnalysis(scrapedData.data);
        
        // Set profile data if available
        if (scrapedData.data.profile && scrapedData.data.profile.length > 0) {
          setProfile(scrapedData.data.profile[0]);
        }
        
        // Get user ID from backend response (backend already saves data to database)
        const finalUserId = scrapedData.userId;
        
        // Save user ID to localStorage for future use
        if (finalUserId) {
          localStorage.setItem(`linkedin-user-id-${url}`, finalUserId);
        } else {
        }
      } else {
      }
      
      setAiLoading(false);
      
      // Trigger a re-check of optimization limits after fresh data is loaded
      setTimeout(() => {
        setScrapedData((prev: any) => ({ ...prev, _forceLimitCheck: Date.now() }));
      }, 100);
    
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scraping the profile');
    } finally {
      setLoading(false);
    }
  };

  // Refresh function that can be called externally
  const refreshProfileData = async () => {
    setLoading(true);
    setError(null);
    await scrapeProfile(true); // Force refresh
  };

  // Clear cache function
  const clearCache = async () => {
    try {
      setLoading(true);
      const response = await firebaseRepository.clearCachedLinkedInProfile(url);
      
      if (response.success) {
        // Force a fresh scrape
        await scrapeProfile(true);
      } else {
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrapeProfile();
  }, []);

  return { 
    profile, 
    loading, 
    error, 
    aiAnalysis, 
    aiLoading, 
    aiError,
    scrapedData,
    refreshProfileData,
    clearCache
  };
};



const mockedData =  {
  "success": true,
  "data": {
      "success": true,
      "data": {
          "profile": {
              "success": true,
              "data": [
                  {
                      "id": "617472312",
                      "profileId": "ACoAACTN4TgBpusMem1FxAfDNtBaeMXzc1DN38c",
                      "firstName": "mohammad",
                      "lastName": "omari",
                      "occupation": "Mid-Senior Frontend developer",
                      "publicIdentifier": "mohammad-omari-620959152",
                      "trackingId": "nWKQVkunRvS+OCn4Qu07fw==",
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
                                  "trackingId": "BZ7veiCxTlGYdLibz+EbfA=="
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
                                  "trackingId": "mox0x1YRQlq3ObFzZmMl4g=="
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
                                  "trackingId": "8UiYmRmwQrOTbWXbR/OZpg=="
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
                                  "trackingId": "X9cufNP7R5OtJAPblIbJDA=="
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
                      "industryName": "Computer Software",
                      "industryUrn": "urn:li:fs_industry:4",
                      "geoLocationName": "Amman",
                      "geoCountryName": "Jordan",
                      "jobTitle": "Frontend Developer",
                      "companyName": "CR2",
                      "companyPublicId": "cr2",
                      "companyLinkedinUrl": "https://www.linkedin.com/company/cr2",
                      "following": false,
                      "followable": true,
                      "followersCount": 815,
                      "connectionsCount": 500,
                      "connectionType": 3,
                      "inputUrl": "https://www.linkedin.com/in/mohammad-omari-620959152/"
                  }
              ]
          },
          "analysis": {
              "success": true,
              "data": {
                  "scraper": [
                      {
                          "id": "617472312",
                          "profileId": "ACoAACTN4TgBpusMem1FxAfDNtBaeMXzc1DN38c",
                          "firstName": "mohammad",
                          "lastName": "omari",
                          "occupation": "Mid-Senior Frontend developer",
                          "publicIdentifier": "mohammad-omari-620959152",
                          "trackingId": "nWKQVkunRvS+OCn4Qu07fw==",
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
                                      "trackingId": "BZ7veiCxTlGYdLibz+EbfA=="
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
                                      "trackingId": "mox0x1YRQlq3ObFzZmMl4g=="
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
                                      "trackingId": "8UiYmRmwQrOTbWXbR/OZpg=="
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
                                      "trackingId": "X9cufNP7R5OtJAPblIbJDA=="
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
                          "industryName": "Computer Software",
                          "industryUrn": "urn:li:fs_industry:4",
                          "geoLocationName": "Amman",
                          "geoCountryName": "Jordan",
                          "jobTitle": "Frontend Developer",
                          "companyName": "CR2",
                          "companyPublicId": "cr2",
                          "companyLinkedinUrl": "https://www.linkedin.com/company/cr2",
                          "following": false,
                          "followable": true,
                          "followersCount": 815,
                          "connectionsCount": 500,
                          "connectionType": 3,
                          "inputUrl": "https://www.linkedin.com/in/mohammad-omari-620959152/"
                      }
                  ],
                  "aiAnalysis": "```json\n{\n    \"summary\": \"Mohammad's profile showcases a solid foundation as a Mid-Senior Frontend Developer, demonstrating experience in the E-Learning sector with a focus on user-friendly applications. With a degree from Yarmouk University and practical skills in Angular, JavaScript, and HTML5, Mohammad is positioned well in the tech industry. His current role at Classera reflects a commitment to enhancing user engagement in educational technology. Overall, the profile effectively highlights his technical expertise and career trajectory.\",\n    \"strengths\": [\n        \"Strong technical skills in Angular, JavaScript, and HTML5.\",\n        \"Experience in reputable companies within the E-Learning sector.\",\n        \"Good educational background from a recognized institution.\"\n    ],\n    \"weaknesses\": [\n        \"Limited visibility into projects and concrete achievements.\",\n        \"No certifications or additional courses listed to demonstrate continuous learning.\",\n        \"Lack of recommendations from colleagues or supervisors.\"\n    ],\n    \"analysis_recommendations\": {\n        \"summary\": [\n            \"Expand the summary section to include specific achievements and projects.\",\n            \"Consider adding a personal touch to make the profile more engaging.\"\n        ],\n        \"skills\": [\n            \"Add more skills relevant to the field, such as responsive design or UI/UX principles.\",\n            \"Highlight proficiency in additional frameworks or tools.\"\n        ],\n        \"experience\": [\n            \"Include specific projects worked on at Classera and CR2 with measurable outcomes.\",\n            \"Highlight collaborations with teams to emphasize teamwork skills.\"\n        ],\n        \"education\": [\n            \"Consider adding any relevant coursework or extracurricular activities that relate to the current role.\"\n        ],\n        \"projects\": [\n            \"Showcase specific projects with links or descriptions to provide insight into work quality and impact.\"\n        ],\n        \"recommendations\": [\n            \"Request recommendations from colleagues or supervisors to add credibility.\"\n        ],\n        \"publications\": [],\n        \"courses\": [\n            \"Consider enrolling in relevant online courses to enhance skills and listing them on the profile.\"\n        ],\n        \"honorsawards\": [],\n        \"languages\": [],\n        \"certificates\": [\n            \"Pursue industry-recognized certifications to boost credibility and skill recognition.\"\n        ],\n        \"volunteer\": [],\n        \"linkedinurl\": [\n            \"Ensure the LinkedIn URL is easily shareable and reflects professionalism.\"\n        ]\n    },\n    \"industryInsights\": \"The tech industry, particularly in E-Learning, is rapidly evolving. Developers with expertise in frontend technologies and user engagement are in high demand. Staying updated with the latest frameworks and trends will enhance career opportunities.\",\n    \"profileOptimization\": [\n        \"Complete the profile with additional skills and endorsements.\",\n        \"Regularly update the profile with new projects and achievements.\"\n    ],\n    \"keywordAnalysis\": {\n        \"relevantKeywords\": [\n            \"Frontend Development\",\n            \"E-Learning\",\n            \"Angular\",\n            \"JavaScript\",\n            \"User Experience\"\n        ],\n        \"missingKeywords\": [\n            \"React\",\n            \"Vue.js\",\n            \"UI/UX Design\",\n            \"Full Stack Development\",\n            \"Agile Methodologies\"\n        ]\n    }\n}\n```"
              }
          }
      }
  }
}