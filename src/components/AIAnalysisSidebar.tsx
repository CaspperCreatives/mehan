import React, { useState, useEffect, useRef } from 'react';
import { AIAnalysisResult } from '../utils/aiAnalyzer';
import { Icon, IconNames, getIconNameFromSection } from './Icon';
import { useLanguage, getTranslation, Language } from '../utils/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faInfoCircle, faRobot } from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';
import { ExportButtons } from './ExportButtons';
import { RefreshLimiter } from '../utils/refreshLimiter';
import { GeneratedContentBox } from './GeneratedContentBox';
import { Tooltip } from './Tooltip';
import { getProfileKeyForSection } from '../utils/sectionDataMap';
import { getOpenAIAPIKey } from '../utils/apiKeys';

interface AIAnalysisSidebarProps {
  analysis: AIAnalysisResult | null;
  loading: boolean;
  error: string | null;
  refreshProfileData: () => Promise<void>;
  profile: any;
}

// Custom hook for count-up animation
const useCountUp = (targetValue: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Reset count when targetValue changes
    setCount(0);
    
    // Add 1s delay before starting animation
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = typeof targetValue === 'number' && !isNaN(targetValue) ? targetValue : 0;

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
        
        setCount(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }, 1000);

    return () => clearTimeout(timer);
  }, [targetValue, duration]);

  return count;
};

const getScoreColor = (score: number, maxPossiblePoints?: number) => {
  // Handle edge cases
  if (typeof score !== 'number' || isNaN(score)) {
    return '#6b7280'; // Gray for invalid scores
  }
  
  // Calculate percentage if maxPossiblePoints is provided
  let percentage = score;
  if (maxPossiblePoints && maxPossiblePoints > 0) {
    percentage = (score / maxPossiblePoints) * 100;
  }
  
  // Apply color logic based on percentage
  if (percentage >= 75) return '#22c55e'; // Success green
  if (percentage >= 25) return '#eab308'; // Average yellow
  return '#ef4444'; // Bad red
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="section-card">
      <div 
        className="section-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isCollapsed ? '0px' : '10px'
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>{title}</h3>
        <span 
          style={{
            transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s ease',
            fontSize: '16px',
            color: '#6b7280'
          }}
        >
          ▼
        </span>
      </div>
      <div 
        style={{
          height: isCollapsed ? '0px' : 'auto',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const KeywordTag: React.FC<{ keyword: string; type: 'relevant' | 'missing' }> = ({ keyword, type }) => (
  <span className={`keyword-tag ${type}`}>
    {keyword}
  </span>
);

// GaugeSlider: Modern full circular gauge for score
const GaugeSlider: React.FC<{ value: number }> = ({ value }) => {
  // Handle edge cases
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  // Clamp value between 0 and 100
  const percent = Math.max(0, Math.min(100, safeValue));
  // Arc settings
  const size = 170;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Full circle: 360 degrees - calculate the stroke-dashoffset to show progress
  const progress = (percent / 100) * circumference;
  const offset = circumference - progress;

  const scoreColor = getScoreColor(safeValue, 100); // 100 is max for percentage

  return (
    <div style={{
      background: '#fff',
      borderRadius: '50%',
      boxShadow: '0 8px 32px 0 rgba(60,60,100,0.10)',
      padding: 0,
      width: size,
      height: size,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track - full circle background */}
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke={'#E4EAF2'}
          strokeWidth={stroke}
          style={{ transition: 'all 0.5s cubic-bezier(.4,2,.6,1)' }}
        />
        {/* Progress - fills the circle based on percentage */}
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'all 0.5s cubic-bezier(.4,2,.6,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: 34, fontWeight: 700, color: '#205C99', lineHeight: 1 }}>{Math.round(safeValue)}%</span>
      </div>
    </div>
  );
};

const SectionsSlider: React.FC<{ 
  sections: any[], 
  analysis: AIAnalysisResult, 
  currentLanguage: Language, 
  profile: any,
  generatedData?: any // Add new prop for generated data from buildAnalysisPrompt
}> = ({ sections, analysis, currentLanguage, profile, generatedData }) => {
  
  const titleMap: { [key: string]: string } = {
    'linkedinurl': getTranslation(currentLanguage, 'url'),
    'headline': getTranslation(currentLanguage, 'headline'),
    'projects': getTranslation(currentLanguage, 'projects'),
    'education': getTranslation(currentLanguage, 'education'), 
    'experiences': getTranslation(currentLanguage, 'experiences'),
    'skills': getTranslation(currentLanguage, 'skills'),
    'summary': getTranslation(currentLanguage, 'summary'),
    'recommendations': getTranslation(currentLanguage, 'recommendations'),
    'country': getTranslation(currentLanguage, 'location'),
    'profilepicture': getTranslation(currentLanguage, 'profilePicture'),
    'backgroundimage': getTranslation(currentLanguage, 'backgroundImage'),
    'keywordanalysis': getTranslation(currentLanguage, 'keywordAnalysis'),
    'strengths': getTranslation(currentLanguage, 'strengths'),
    'areasforimprovement': getTranslation(currentLanguage, 'areasForImprovement'),
    'industryinsights': getTranslation(currentLanguage, 'industryInsights'),
    'profileoptimization': getTranslation(currentLanguage, 'profileOptimization'),
    'competitiveanalysis': getTranslation(currentLanguage, 'competitiveAnalysis'),
  }

  // Define which sections belong to "others"
  const othersSections = [
    'publications',
    'languages',
    'certificates',
    'honorsawards',
    'volunteer',
    'patents',
    'testscores',
    'organizations',
    'contactinfo',
    'featured',
    'projects',
    'recommendations',
    'causes'
  ];
  
  // Filter sections properly
  const mainSections = sections.filter((section) => {
    if (!section || !section.title) return false;
    
    const sectionTitle = section.title.toLowerCase();
    
    // Handle special case for honorsAwards/honorsawards
    if (sectionTitle === 'honorsawards' || sectionTitle === 'honorsawards') {
      return false; // This belongs to others
    }
    
    return !othersSections.includes(sectionTitle);
  });
  
  const othersSectionsData = sections.filter((section) => {
    if (!section || !section.title) return false;
    
    const sectionTitle = section.title.toLowerCase();
    
    // Handle special case for honorsAwards/honorsawards
    if (sectionTitle === 'honorsawards' || sectionTitle === 'honorsawards') {
      return true; // This belongs to others
    }
    
    return othersSections.includes(sectionTitle);
  });
  
  // Calculate total score for others sections
  const othersTotalScore = othersSectionsData.reduce((sum, section) => sum + (section.score || 0), 0);
  const othersMaxScore = othersSectionsData.reduce((sum, section) => sum + (section.maxPossiblePoints || 0), 0);
  
  // Initialize selected section with first main section or others if no main sections
  const [selectedSection, setSelectedSection] = useState<any>(() => {
    if (mainSections.length > 0) {
      return mainSections[0];
    } else if (othersSectionsData.length > 0) {
      return { title: 'others' };
    }
    return null;
  });

  // Add state for showing generated content
  const [showGeneratedContent, setShowGeneratedContent] = useState(false);
  const [generatedContentLoading, setGeneratedContentLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Clear generated content when selected section changes
  useEffect(() => {
    setShowGeneratedContent(false);
    setGeneratedContent(null);
    setGeneratedContentLoading(false);
  }, [selectedSection]);

  // Helper function to find section by title
  const findSectionByTitle = (title: string) => {
    return sections.find(section => {
      if (!section || !section.title) return false;
      
      const sectionTitle = section.title.toLowerCase();
      const searchTitle = title.toLowerCase();
      
      // Handle special case for honorsAwards/honorsawards
      if (searchTitle === 'honorsawards') {
        return sectionTitle === 'honorsawards' || sectionTitle === 'honorsawards';
      }
      
      return sectionTitle === searchTitle;
    });
  };

  /**
   * Generate content for a specific section using AI
   * @param sectionTitle - The title of the section to generate content for
   * @param originalData - The original data from the profile
   */
  const generateContentForSection = async (sectionTitle: string, originalData: any) => {
    setGeneratedContentLoading(true);
    setGeneratedContent(null);
    
    try {
      // Use generated data if available, otherwise fall back to original profile data
      const dataSource = generatedData || profile;
      
      // Get skills and experience data for context from the appropriate source
      // Handle both array and object formats
      const skillsData = dataSource?.skills?.content || 
                        (Array.isArray(dataSource?.skills) ? dataSource?.skills : '') || '';
      const experienceData = dataSource?.experience?.content || 
                           (Array.isArray(dataSource?.experience) ? dataSource?.experience : '') || '';
      
      // Get scoring criteria for this section to help AI generate content that maximizes score
      const sectionCriteria = getScoringCriteriaForSection(sectionTitle);
      
      // Create a prompt for generating content for the specific section
      const prompt = `Generate improved content for the LinkedIn profile section "${sectionTitle}". 

Original content:
${originalData?.content || 'No content available'}

Context from profile:
Skills: ${skillsData || 'No skills data available'}
Work Experience: ${experienceData || 'No experience data available'}

Scoring Criteria for this section (aim to meet these requirements for maximum score):
${sectionCriteria}

Please provide an improved version of this section content. Consider the person's skills and work experience when generating the content to make it more relevant and contextual. Focus on making the content more professional, engaging, and optimized for LinkedIn while meeting the scoring criteria above. Return only the improved content text without any additional formatting or titles.`;

      // Get API key from centralized management
      const apiKey = getOpenAIAPIKey();
      if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
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
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Set the generated content directly as the improved content
      setGeneratedContent({
        improvedContent: aiResponse.trim()
      });
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content. Please try again.';
      setGeneratedContent({
        improvedContent: `Error: ${errorMessage}`
      });
    } finally {
      setGeneratedContentLoading(false);
    }
  };

  /**
   * Get scoring criteria for a specific section to help AI generate content that maximizes score
   * @param sectionTitle - The section title to get criteria for
   * @returns {string} Formatted criteria string for the prompt
   */
  const getScoringCriteriaForSection = (sectionTitle: string): string => {
    const criteriaMap: { [key: string]: string } = {
      'summary': `- Minimum 200 words for maximum score (20 points)
- Include email contact information (10 points)
- Make it professional and engaging
- Include relevant keywords from your industry`,
      
      'headline': `- Minimum 10 words for maximum score (10 points)
- Include relevant keywords (10 points)
- Make it professional and descriptive
- Highlight your key expertise`,
      
      'experiences': `- Include detailed descriptions for each experience (10 points)
- Minimum 3 experiences for maximum score (10 points)
- Make descriptions comprehensive and achievement-focused
- Include specific metrics and results when possible`,
      
      'education': `- Include at least one education entry (10 points)
- Provide complete information (school, degree, field, duration)
- Make it relevant to your professional background`,
      
      'skills': `- Include at least 3 skills for maximum score (15 points)
- Focus on relevant professional skills
- Include both technical and soft skills
- Prioritize skills that match your experience`,
      
      'projects': `- Include at least one project (1 point)
- Provide detailed descriptions
- Include project URLs if available
- Highlight your role and contributions`,
      
      'recommendations': `- Include at least one recommendation (1 point)
- Request recommendations from colleagues and managers
- Focus on professional relationships`,
      
      'publications': `- Include at least one publication (1 point)
- Academic or industry publications count
- Include complete publication details`,
      
      'languages': `- Include at least one language (1 point)
- Specify proficiency levels
- Include both native and learned languages`,
      
      'certificates': `- Include at least one certificate (1 point)
- Professional certifications count
- Include certification details and dates`,
      
      'honorsawards': `- Include at least one honor or award (1 point)
- Academic, professional, or industry awards
- Include award details and dates`,
      
      'volunteer': `- Include at least one volunteer experience (1 point)
- Community service or charitable work
- Include organization and role details`,
      
      'patents': `- Include at least one patent (1 point)
- Technical or innovation patents
- Include patent details and dates`,
      
      'testscores': `- Include at least one test score (1 point)
- Professional or academic test scores
- Include test details and scores`,
      
      'organizations': `- Include at least one organization membership (1 point)
- Professional associations or groups
- Include membership details`,
      
      'featured': `- Include at least one featured item (1 point)
- Articles, posts, or media
- Include featured content details`,
      
      'causes': `- Include at least one cause (1 point)
- Social or environmental causes
- Include cause details and involvement`
    };

    return criteriaMap[sectionTitle.toLowerCase()] || 'Focus on making the content professional, comprehensive, and engaging for LinkedIn.';
  };

  /**
  function to get the class name of the section
  @returns { [key: string]: string }
   */
  const getSectionClassMap = (): { [key: string]: string } => ({
    'summary': 'about-section',
    'experiences': 'experience-section',
    'education': 'education-section',
    'skills': 'skills-section',
    'projects': 'projects-section',
    'recommendations': 'recommendations-section',
    'causes': 'causes-section',
    'honorsawards': 'honors-awards-section',
    'volunteer': 'volunteering-section',
    'languages': 'languages-section',
    'publications': 'publications-section',
    'certificates': 'certifications-section',
    'patents': 'patents-section',
    'testscores': 'test-scores-section',
    'organizations': 'organizations-section',
    'featured': 'featured-section',
    'contactinfo': 'contact-info-section',
    'headline': 'headline-section',
    'profilepicture': 'profile-picture-section',
    'backgroundimage': 'background-image-section',
    'country': 'location-section',
    'linkedinurl': 'url-section'
  });

  const handleSectionClick = (section: any) => {
    console.log('section', section);
    
    setSelectedSection(section);
    scrollToSection(section);
  }

  const handleGenerateContent = () => {
    if (!selectedSection || !profile) return;
    
    // Hide the section-cards-holder div with smooth transition
    const sectionCardsHolder = document.querySelector('.section-cards-holder');
    if (sectionCardsHolder) {
      (sectionCardsHolder as HTMLElement).style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      (sectionCardsHolder as HTMLElement).style.opacity = '0';
      (sectionCardsHolder as HTMLElement).style.transform = 'translateY(-10px)';
      setTimeout(() => {
        (sectionCardsHolder as HTMLElement).style.display = 'none';
      }, 300);
    }
    
    const sectionTitle = selectedSection.title.toLowerCase();
    const profileKey = getProfileKeyForSection(sectionTitle);
    
    // Use generated data if available, otherwise fall back to original profile data
    const dataSource = generatedData || profile;
    let originalData = null;
    
    if (profileKey) {
      // Handle different data structures
      if (dataSource[profileKey]) {
        if (typeof dataSource[profileKey] === 'object' && dataSource[profileKey].content) {
          // Original structure: { content: string }
          originalData = dataSource[profileKey];
        } else if (Array.isArray(dataSource[profileKey])) {
          // New structure: array of objects
          originalData = { content: JSON.stringify(dataSource[profileKey], null, 2) };
        } else {
          // Fallback
          originalData = { content: String(dataSource[profileKey]) };
        }
      }
    }
    
    generateContentForSection(sectionTitle, originalData);
    
    // Start animation
    setIsAnimating(true);
    setTimeout(() => {
      setShowGeneratedContent(true);
      setIsAnimating(false);
    }, 350); // Wait for section cards to fade out
  };

  /**
   * Function to show section cards when closing generated content
   */
  const handleCloseGeneratedContent = () => {
    // Start fade out animation for generated content
    setIsAnimating(true);
    setShowGeneratedContent(false);
    
    // Show the section-cards-holder div with smooth transition
    setTimeout(() => {
      const sectionCardsHolder = document.querySelector('.section-cards-holder');
      if (sectionCardsHolder) {
        (sectionCardsHolder as HTMLElement).style.display = '';
        (sectionCardsHolder as HTMLElement).style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        (sectionCardsHolder as HTMLElement).style.opacity = '0';
        (sectionCardsHolder as HTMLElement).style.transform = 'translateY(10px)';
        
        // Trigger reflow to ensure transition works
        (sectionCardsHolder as HTMLElement).offsetHeight;
        
        // Animate in
        (sectionCardsHolder as HTMLElement).style.opacity = '1';
        (sectionCardsHolder as HTMLElement).style.transform = 'translateY(0)';
      }
      
      setIsAnimating(false);
    }, 200); // Wait for generated content to start fading out
  };

  /**
   * Determines if the generate content button should be shown for the current section
   * @returns {boolean} True if the button should be shown
   */
  const shouldShowGenerateButton = (): boolean => {
    if (!selectedSection) return false;
    
    const sectionTitle = selectedSection.title.toLowerCase();
    const sectionsWithoutGenerate = ['linkedinurl', 'profilepicture', 'backgroundimage'];
    
    return !sectionsWithoutGenerate.includes(sectionTitle);
  };

  /**
  function to scroll to the section in the page
  @param section: the section to scroll to
  @returns void
   */
  const scrollToSection = (section: any) => {
    if (!section || !section.title) return;
    
    const sectionTitle = section.title.toLowerCase();
    const sectionClassMap = getSectionClassMap();
    const targetClassName = sectionClassMap[sectionTitle] || '';
    
    if (targetClassName) {
      let targetSection: HTMLElement | null = null;
      
      // Special case for headline section
      if (sectionTitle === 'headline') {
        const mainElement = document.querySelector('main');
        if (mainElement) {
          targetSection = mainElement.querySelector('section:first-child') as HTMLElement;
        }
      } else if (sectionTitle === 'linkedinurl') {
        // Special case for url section
        targetSection = document.querySelector('.pv-profile-info-section') as HTMLElement;
      } else {
        targetSection = document.querySelector(`.${targetClassName}`) as HTMLElement;
      }
      
      if (targetSection) {
        document.querySelectorAll('.hover-section').forEach(el => {
          el.classList.remove('hover-section');
        });
        
        targetSection.classList.add('hover-section');
        
        window.scrollTo({
          top: targetSection.offsetTop - 100,
          behavior: 'smooth'
        });
        
        setTimeout(() => {
          targetSection.classList.remove('hover-section');
        }, 5000);
      } else {
        const alternativeSelectors = [
          `section:has(h2:contains("${sectionTitle}"))`,
          `section:has(h3:contains("${sectionTitle}"))`,
          `[data-section="${sectionTitle}"]`,
          `#${sectionTitle}-section`,
          `.${sectionTitle}-section`
        ];
        
        for (const selector of alternativeSelectors) {
          try {
            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
              element.classList.add('hover-section');
              window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth'
              });
              setTimeout(() => {
                element.classList.remove('hover-section');
              }, 5000);
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
  };

  /**
   * function to click the edit button in the section
   * @param sectionTitle: the title of the section to click the edit button
   * @returns void
   */
  const clickEditButton = (sectionTitle: string) => {
    const sectionClassMap = getSectionClassMap();
    const targetClassName = sectionClassMap[sectionTitle.toLowerCase()] || '';
    
    if (targetClassName) {
      let targetSection: HTMLElement | null = null;
      
      // Special case for headline section
      if (sectionTitle.toLowerCase() === 'headline') {
        const mainElement = document.querySelector('main');
        if (mainElement) {
          targetSection = mainElement.querySelector('section:first-child') as HTMLElement;
        }
      } else if (sectionTitle.toLowerCase() === 'linkedinurl') {
        // Special case for url section
        targetSection = document.querySelector('.pv-profile-info-section') as HTMLElement;
      } else {
        targetSection = document.querySelector(`.${targetClassName}`) as HTMLElement;
      }
      
      if (targetSection) {
        let editButton: HTMLElement | null = null;
        
        // Special case for url section edit button
        if (sectionTitle.toLowerCase() === 'linkedinurl') {
            const allEditButtons = targetSection.querySelectorAll('a');
            editButton = Array.from(allEditButtons).find(button => {
              const svgElement = button.querySelector('svg');
              return svgElement?.classList.contains('pv-profile-info-section__edit-button') && 
                     button.getAttribute('href')?.includes('public-profile');
            }) as HTMLElement;
          } else {
            editButton = targetSection.querySelector('a:has(use[href="#edit-medium"])') as HTMLElement;
          }
        
        if (editButton) {
          editButton.click();
        } else {
          const anyEditButton = targetSection.querySelector('a[href*="edit"], button[aria-label*="edit"], button[title*="edit"]') as HTMLElement;
          if (anyEditButton) {
            anyEditButton.click();
          }
        }
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="sections-slider">
        {/* Main sections */}
        {mainSections.map((section, index) => (
          <div 
            key={`main-${index}`} 
            className={`section-card ${selectedSection && selectedSection.title.toLowerCase() === section.title.toLowerCase() ? 'active' : ''}`} 
            onClick={() => handleSectionClick(section)}
          >
            <span className="title"
            style={{
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: '500',
              color: '#6b7280'
            }}
            >
              {titleMap[section.title.toLowerCase()] || section.title}
            </span>
            <span className='icon'>
              <Icon 
                name={getIconNameFromSection(section.title)} 
                size={20}
                alt={section.title}
              />
            </span>
            <span
              className='color'
              style={{
                color: getScoreColor(section.score || 0, section.maxPossiblePoints)
              }}
            >{section.score || 0} / {section.maxPossiblePoints || 0}</span>
          </div>
        ))}

        {/* Others section - only show if there are others sections */}
        {othersSectionsData.length > 0 && (
          <div
            className={`section-card ${selectedSection && selectedSection.title.toLowerCase() === 'others' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSection({ title: 'others' });
              // For "others" section, we'll highlight the first available "others" section
              const firstOthersSection = othersSectionsData[0];
              if (firstOthersSection) {
                scrollToSection(firstOthersSection);
              }
            }}
          >
            <span className="title"
              style={{
                fontSize: '12px',
                textAlign: 'center',
                fontWeight: '500',
                color: '#6b7280'
              }}
            >
              {getTranslation(currentLanguage, 'others')}
            </span>
            <span className='icon'>
              <Icon
                name={'others'}
                size={20}
                alt={getTranslation(currentLanguage, 'others')}
              />
            </span>
            <span
              className='color'
              style={{
                color: getScoreColor(othersTotalScore, othersMaxScore)
              }}
            >{othersTotalScore} / {othersMaxScore} </span>

          </div>
        )}
      </div>

      {/* Main section details */}
      {selectedSection && selectedSection.title.toLowerCase() !== 'others' && (
        <div className="section-card-details"
          style={{
            height: 'auto',
            overflow: 'auto'
          }}
        >
          <div className='section-card-details-actions'
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              borderBottom: '1px solid #e5e7eb',
              marginBottom: '15px'
            }}
          >
            <Tooltip text={getTranslation(currentLanguage, 'editSection')} position="right">

              <button
                onClick={() => {
                  const sectionTitle = selectedSection.title.toLowerCase();
                  clickEditButton(sectionTitle);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg role="img" aria-hidden="false" aria-label="Edit" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" data-supported-dps="24x24" data-test-icon="edit-medium" style={{ color: '#6b7280' }}>
                  <use href="#edit-medium" width="24" height="24"></use>
                </svg>
              </button>
            </Tooltip>


            {shouldShowGenerateButton() && (
              <Tooltip text={getTranslation(currentLanguage, 'generateContent')} position="left">

                <button
                  onClick={handleGenerateContent}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '30px', height: '30px' }}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.0614 9.67972L16.4756 11.0939L17.8787 9.69083L16.4645 8.27662L15.0614 9.67972ZM16.4645 6.1553L20 9.69083L8.6863 21.0045L5.15076 17.469L16.4645 6.1553Z"
                      fill="#6b7280"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.364 5.06066L9.59619 6.82843L8.53553 5.76777L10.3033 4L11.364 5.06066ZM6.76778 6.82842L5 5.06067L6.06066 4L7.82843 5.76776L6.76778 6.82842ZM10.3033 10.364L8.53553 8.5962L9.59619 7.53554L11.364 9.3033L10.3033 10.364ZM7.82843 8.5962L6.06066 10.364L5 9.3033L6.76777 7.53554L7.82843 8.5962Z"
                      fill="#6b7280"
                    />
                  </svg>
                </button>
              </Tooltip>
            )}
          </div>
          <div className="section-card-details-content"
          style={{
            boxShadow: 'none',
            display: 'flex',
            padding: '0 10px',
            justifyContent: 'flex-start',
            flexDirection: 'column',
            gap: '20px'
          }}
          >
            <div className="title"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            >
              <h3
              style={{
                fontSize: '24px',
                fontWeight: '600',
              }}
              >{titleMap[selectedSection.title.toLowerCase()] || selectedSection.title}</h3>
              <p 
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: getScoreColor(selectedSection.score || 0, selectedSection.maxPossiblePoints)
              }}
              className='color'
              >{selectedSection.score || 0} / {selectedSection.maxPossiblePoints || 0}</p>
            </div>

            {/* Generated Content Box */}
            {showGeneratedContent && (
              <GeneratedContentBox
                showGeneratedContent={showGeneratedContent}
                isAnimating={isAnimating}
                generatedContentLoading={generatedContentLoading}
                generatedContent={generatedContent}
                selectedSection={selectedSection}
                profile={generatedData || profile} // Use generated data if available
                onClose={handleCloseGeneratedContent}
              />
            )}

            <div className="criteria"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px'
            }}
            >
              <div className="criteria-list">
                <h4
                style={{
                  fontSize: '16px',
                 fontWeight: '500',
                 color: 'rgb(25 25 25)',
                 marginBottom: '10px'
                }}
                >{getTranslation(currentLanguage, 'criteria')}</h4>

                {(selectedSection.criteria || []).map((criterion: any, index: number) =>(
                  <div
                    key={`criterion-${index}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{criterion.title}</p>
                    <div className="point"
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{criterion.point} {getTranslation(currentLanguage, 'outOf')} {selectedSection.maxPossiblePoints}</div>
                  </div>
                ))}
              </div>
              <div className="recommendations">
                <h4 style={{
                 fontSize: '16px',
                 fontWeight: '500',
                 color: 'rgb(25 25 25)',
                 marginBottom: '10px'
                }}>{getTranslation(currentLanguage, 'analysisRecommendations')}</h4>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  {(analysis?.analysis_recommendations?.[selectedSection.title.toLowerCase()] as any)?.map((recommendation: any, index: number) =>(
                    <p 
                      key={`recommendation-${index}`}
                      className="recommendation"
                      style={{
                        fontSize: '14px',
                        fontWeight: '300',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '5px'
                      }}
                    > 
                      <span style={{ fontSize: '16px', fontWeight: '500' }}> - </span> 
                      <span>{recommendation}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Others section details */}
      {selectedSection && selectedSection.title.toLowerCase() === 'others' && (
        <div className="section-card-details"
        style={{
         height: 'auto',
         overflow: 'auto'
        }}
        >
          <div className="section-card-details-content"
          style={{
            boxShadow: 'none',
            display: 'flex',
            padding: '0 10px',
            justifyContent: 'flex-start',
            flexDirection: 'column',
            gap: '20px'
          }}
          >
            <div className="title"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            >
              <h3
              style={{
                fontSize: '24px',
                fontWeight: '600',
              }}
              >{getTranslation(currentLanguage, 'others')}</h3>
              <p 
              style={{
                fontSize: '24px',
                fontWeight: '600',
              }}
              >{othersTotalScore} {getTranslation(currentLanguage, 'outOf')} {othersMaxScore}</p>
            </div>

            <div className="criteria"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            >
              {/* Languages */}
              {findSectionByTitle('languages') && (
                <div className="criteria-list">
                  <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'rgb(25 25 25)',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    const languagesSection = findSectionByTitle('languages');
                    if (languagesSection) {
                      scrollToSection(languagesSection);
                    }
                  }}
                  >{getTranslation(currentLanguage, 'languages')}</h4>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{getTranslation(currentLanguage, 'languages')}</p>
                    <div className="point"
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{findSectionByTitle('languages')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('languages')?.maxPossiblePoints || 1}</div>
                  </div>
                </div>
              )}

              {/* Publications */}
              {findSectionByTitle('publications') && (
                <div className="criteria-list">
                  <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'rgb(25 25 25)',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    const publicationsSection = findSectionByTitle('publications');
                    if (publicationsSection) {
                      scrollToSection(publicationsSection);
                    }
                  }}
                  >{getTranslation(currentLanguage, 'publications')}</h4>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{getTranslation(currentLanguage, 'publications')}</p>
                    <div className="point"
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{findSectionByTitle('publications')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('publications')?.maxPossiblePoints || 1}</div>
                  </div>
                </div>
              )}

              {/* Certificates */}
              {findSectionByTitle('certificates') && (
                <div className="criteria-list">
                  <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'rgb(25 25 25)',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    const certificatesSection = findSectionByTitle('certificates');
                    if (certificatesSection) {
                      scrollToSection(certificatesSection);
                    }
                  }}
                  >{getTranslation(currentLanguage, 'certificates')}</h4>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{getTranslation(currentLanguage, 'certificates')}</p>
                    <div className="point"
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{findSectionByTitle('certificates')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('certificates')?.maxPossiblePoints || 1}</div>
                  </div>
                </div>
              )}

              {/* Honors & Awards */}
              {findSectionByTitle('honorsawards') && (
                <div className="criteria-list">
                  <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'rgb(25 25 25)',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    const honorsAwardsSection = findSectionByTitle('honorsawards');
                    if (honorsAwardsSection) {
                      scrollToSection(honorsAwardsSection);
                    }
                  }}
                  >{getTranslation(currentLanguage, 'honorsAwards')}</h4>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{getTranslation(currentLanguage, 'honorsAwards')}</p>
                    <div className="point"
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{findSectionByTitle('honorsawards')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('honorsawards')?.maxPossiblePoints || 1}</div>
                  </div>
                </div>
              )}

              {/* Volunteer */}
              {findSectionByTitle('volunteer') && (
                <div className="criteria-list">
                  <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'rgb(25 25 25)',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    const volunteerSection = findSectionByTitle('volunteer');
                    if (volunteerSection) {
                      scrollToSection(volunteerSection);
                    }
                  }}
                  >{getTranslation(currentLanguage, 'volunteer')}</h4>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{getTranslation(currentLanguage, 'volunteer')}</p>
                    <div className="point"
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{findSectionByTitle('volunteer')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('volunteer')?.maxPossiblePoints || 1}</div>
                  </div>
                </div>
              )}
              {/* Patents */}
              {findSectionByTitle('patents') && (
                <div className="criteria-list">
                  <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'rgb(25 25 25)',
                    marginBottom: '10px'
                  }}
                  >{getTranslation(currentLanguage, 'patents') || 'Patents'}</h4>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{getTranslation(currentLanguage, 'patents') || 'Patents'}</p>
                    <div className="point"
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{findSectionByTitle('patents')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('patents')?.maxPossiblePoints || 1}</div>
                  </div>
                </div>
              )}
              {/* Test Scores */}
              {findSectionByTitle('testscores') && (
                <div className="criteria-list">
                  <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'rgb(25 25 25)',
                    marginBottom: '10px'
                  }}
                  >{getTranslation(currentLanguage, 'testScores') || 'Test Scores'}</h4>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{getTranslation(currentLanguage, 'testScores') || 'Test Scores'}</p>
                    <div className="point"
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{findSectionByTitle('testscores')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('testscores')?.maxPossiblePoints || 1}</div>
                  </div>
                </div>
              )}
              {/* Organizations */}
              {findSectionByTitle('organizations') && (
                <div className="criteria-list">
                  <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'rgb(25 25 25)',
                    marginBottom: '10px'
                  }}
                  >{getTranslation(currentLanguage, 'organizations') || 'Organizations'}</h4>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{getTranslation(currentLanguage, 'organizations') || 'Organizations'}</p>
                    <div className="point"
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{findSectionByTitle('organizations')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('organizations')?.maxPossiblePoints || 1}</div>
                  </div>
                </div>
              )}

              {/* Featured */}{/* Featured */}
                {findSectionByTitle('featured') && (
                  <div className="criteria-list">
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: 'rgb(25 25 25)',
                        marginBottom: '10px'
                      }}
                    >{getTranslation(currentLanguage, 'featured')}</h4>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          color: '#6b7280'
                        }}
                      >{getTranslation(currentLanguage, 'featured')}</p>
                      <div className="point"
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          color: '#6b7280'
                        }}
                      >{findSectionByTitle('featured')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('featured')?.maxPossiblePoints || 1}</div>
                    </div>
                  </div>
                )}

                {/* Projects */}
                {findSectionByTitle('projects') && (
                  <div className="criteria-list">
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: 'rgb(25 25 25)',
                        marginBottom: '10px'
                      }}
                    >{getTranslation(currentLanguage, 'projects')}</h4>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          color: '#6b7280'
                        }}
                      >{getTranslation(currentLanguage, 'projects')}</p>
                      <div className="point"
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          color: '#6b7280'
                        }}
                      >{findSectionByTitle('projects')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('projects')?.maxPossiblePoints || 1}</div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {findSectionByTitle('recommendations') && (
                  <div className="criteria-list">
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: 'rgb(25 25 25)',
                        marginBottom: '10px'
                      }}
                    >{getTranslation(currentLanguage, 'recommendations')}</h4>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          color: '#6b7280'
                        }}
                      >{getTranslation(currentLanguage, 'recommendations')}</p>
                      <div className="point"
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          color: '#6b7280'
                        }}
                      >{findSectionByTitle('recommendations')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('recommendations')?.maxPossiblePoints || 1}</div>
                    </div>
                  </div>
                )}

                {/* Causes */}
                {findSectionByTitle('causes') && (
                  <div className="criteria-list">
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: 'rgb(25 25 25)',
                        marginBottom: '10px'
                      }}
                    >{getTranslation(currentLanguage, 'causes') || 'Causes'}</h4>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          color: '#6b7280'
                        }}
                      >{getTranslation(currentLanguage, 'causes') || 'Causes'}</p>
                      <div className="point"
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          color: '#6b7280'
                        }}
                      >{findSectionByTitle('causes')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('causes')?.maxPossiblePoints || 1}</div>
                    </div>
                  </div>
                )}
             
              {/* Contact Info */}
              {/* {findSectionByTitle('contactinfo') && (
                <div className="criteria-list">
                  <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'rgb(25 25 25)',
                    marginBottom: '10px'
                  }}
                  >{getTranslation(currentLanguage, 'contactInfo') || 'Contact Info'}</h4>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{getTranslation(currentLanguage, 'contactInfo') || 'Contact Info'}</p>
                    <div className="point"
                    style={{
                      fontSize: '14px',
                      fontWeight: '300',
                      color: '#6b7280'
                    }}
                    >{findSectionByTitle('contactinfo')?.score || 0} {getTranslation(currentLanguage, 'outOf')} {findSectionByTitle('contactinfo')?.maxPossiblePoints || 1}</div>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const AIAnalysisSidebar: React.FC<AIAnalysisSidebarProps> = ({ analysis, loading, error, refreshProfileData, profile }) => {
  const currentLanguage = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshLimit, setRefreshLimit] = useState<{ canRefresh: boolean; remaining: number; resetTime: string }>({
    canRefresh: true,
    remaining: 2,
    resetTime: ''
  });
  const [showLimitInfo, setShowLimitInfo] = useState(false);
  const [aiErrorBeforeRefresh, setAiErrorBeforeRefresh] = useState<string | null>(null);

  // Check refresh limit on component mount
  useEffect(() => {
    const checkRefreshLimit = async () => {
      const limit = await RefreshLimiter.canRefresh();
      setRefreshLimit(limit);
    };
    checkRefreshLimit();
  }, []);

  const handleRefresh = async () => {
    // Check if user can refresh
    const limit = await RefreshLimiter.canRefresh();
    if (!limit.canRefresh) {
      setShowLimitInfo(true);
      setTimeout(() => setShowLimitInfo(false), 3000);
      return;
    }

    // Store the current AI error state before refresh
    setAiErrorBeforeRefresh(error);

    setIsRefreshing(true);
    try {
      await refreshProfileData();
      
      // Check if there's still an AI error after refresh
      // If there was an error before and there's still an error, don't count it
      if (aiErrorBeforeRefresh && error) {
        console.log('AI analysis still failed, not counting against daily limit');
        return;
      }
      
      // Only increment refresh count if the refresh was successful (no AI error)
      await RefreshLimiter.incrementRefreshCount();
      // Update the limit state
      const newLimit = await RefreshLimiter.canRefresh();
      setRefreshLimit(newLimit);
    } catch (refreshError) {
      // If refresh fails completely, don't increment the count
      console.log('Refresh failed, not counting against daily limit:', refreshError);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #0B66C2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p>{getTranslation(currentLanguage, 'aiAnalyzing')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626'
      }}>
        <p><strong>{getTranslation(currentLanguage, 'error')}:</strong> {error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <p>{getTranslation(currentLanguage, 'noAnalysisAvailable')}</p>
      </div>
    );
  }

  const overallScore = useCountUp(analysis.overallScore || 0);

  // GSAP animations with proper cleanup
  useEffect(() => {
    const fadeUpTween = gsap.fromTo('.fade-up', {
      opacity: 0,
      y: 100
    }, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      stagger: 0.5
    });

    const slideToRightTween = gsap.fromTo('.slide-to-right', {
      opacity: 0,
      x: 100
    }, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      stagger: 0.5
    });

    // Cleanup function
    return () => {
      fadeUpTween.kill();
      slideToRightTween.kill();
    };
  }, [analysis]); // Re-run when analysis changes

  return (
    <div style={{
      height: '99vh',
      display: 'flex',
      overflowY: 'auto',
      flexDirection: 'column'
    }}>
      {/* Overall Score */}
     
    <div className="top-header">
      <div className="top-header-content"
      style={{
        position: 'absolute',
        left: '10px',
        top: '10px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: 'calc(100% - 20px)',
        justifyContent: 'space-between'
      }}
      >  
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <div 
            className="refresh-button" 
            onClick={handleRefresh}
            style={{
              cursor: refreshLimit.canRefresh ? 'pointer' : 'not-allowed',
              opacity: refreshLimit.canRefresh ? 1 : 0.5,
              position: 'relative'
            }}
          >
            <FontAwesomeIcon 
              icon={faRotateRight} 
              className={isRefreshing ? 'fa-spin' : ''}
              style={{ 
                fontSize: '16px', 
                color: refreshLimit.canRefresh ? '#6b7280' : '#9ca3af' 
              }}
            />
            {/* Refresh count indicator */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: refreshLimit.remaining > 0 ? '#22c55e' : '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {refreshLimit.remaining}
            </div>
          </div>
          
          {/* Info tooltip */}
          <div 
            style={{
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '14px'
            }}
            onMouseEnter={() => setShowLimitInfo(true)}
            onMouseLeave={() => setShowLimitInfo(false)}
          >
            <Tooltip text={getTranslation(currentLanguage, 'refreshLimitInfo')}>
              <FontAwesomeIcon icon={faInfoCircle} />
            </Tooltip>
          </div>
          
          {/* Limit info popup */}
          {showLimitInfo && (
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '0',
              backgroundColor: '#1f2937',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #374151'
            }}>
              {refreshLimit.canRefresh ? (
                <div>
                  <div>{getTranslation(currentLanguage, 'remainingRefreshes')}: {refreshLimit.remaining}</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>
                    {getTranslation(currentLanguage, 'resetsAt')}: {refreshLimit.resetTime}
                  </div>
                </div>
              ) : (
                <div>
                  <div>{getTranslation(currentLanguage, 'dailyLimitReached')}</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>
                    {getTranslation(currentLanguage, 'resetsAt')}: {refreshLimit.resetTime}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {analysis && !loading && !error && (
            <ExportButtons profile={profile} aiAnalysis={analysis} iconOnly />
          )}
        </div>
      </div>
      <div className='bg-1'></div>
      <div className='bg-2'></div>

        <div className="right">
            <h1 className="top-title">
            {getTranslation(currentLanguage, 'accountEvaluation')}
            </h1>
        </div>

        <div className="left">
            <GaugeSlider value={overallScore} />
        </div>
        
        <div className="keys">
              <div className="key">
                <span className="color green"></span>
                <span className="value">{getTranslation(currentLanguage, 'good')}</span>
              </div>
              <div className="key">
                <span className="color yellow"></span>
                <span className="value">{getTranslation(currentLanguage, 'medium')}</span>
              </div>
              <div className="key">
                <span className="color red"></span>
                <span className="value">{getTranslation(currentLanguage, 'poor')}</span>
              </div>
        </div>
    </div>


      {/* Summary */}
      <div className="white-card">
        <div className="white-card-header">

          <SectionsSlider 
            sections={analysis.scoringBreakdown || []} 
            analysis={analysis} 
            currentLanguage={currentLanguage} 
            profile={profile}
            generatedData={analysis} // Pass the analysis result as generated data
          />

          <div className='section-cards-holder'>
            <SectionCard title={getTranslation(currentLanguage, 'summary')}>
              <p >{analysis.summary || getTranslation(currentLanguage, 'noSummaryAvailable')}</p>
            </SectionCard>

            {/* Keywords */}
            <SectionCard title={getTranslation(currentLanguage, 'keywordAnalysis')}>
              <div style={{ marginBottom: '16px' }} >
                <h4 >- {getTranslation(currentLanguage, 'relevantKeywords')}</h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    margin: '10px 0'
                  }}
                >
                  {(analysis.keywordAnalysis?.relevantKeywords || []).map((keyword, index) => (
                    <KeywordTag key={index} keyword={keyword} type="relevant" />
                  ))}
                </div>
              </div>
              <div>
                <h4 >- {getTranslation(currentLanguage, 'missingKeywords')}</h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    margin: '10px 0'
                  }}
                >
                  {(analysis.keywordAnalysis?.missingKeywords || []).map((keyword, index) => (
                    <KeywordTag key={index} keyword={keyword} type="missing" />
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* Strengths */}
            <SectionCard title={getTranslation(currentLanguage, 'strengths')}>
              <ul >
                {(analysis.strengths || []).map((strength, index) => (
                  <li key={index}>
                    <span style={{ color: '#22c55e', marginRight: '8px' }}>✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* Weaknesses */}
            <SectionCard title={getTranslation(currentLanguage, 'areasForImprovement')}>
              <ul >
                {(analysis.weaknesses || []).map((weakness, index) => (
                  <li key={index}>
                    <span style={{ color: '#ef4444', marginRight: '8px' }}>⚠</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </SectionCard>


            {/* Industry Insights */}
            <SectionCard title={getTranslation(currentLanguage, 'industryInsights')}>
              <p>{analysis.industryInsights || getTranslation(currentLanguage, 'noIndustryInsightsAvailable')}</p>
            </SectionCard>

            {/* Profile Optimization */}
            {/* <SectionCard title="Profile Optimization">
            <ul>
            {(analysis.profileOptimization || []).slice(0, 3).map((optimization, index) => (
                <li key={index}>
                <span style={{ color: '#0B66C2', marginRight: '8px' }}>🔧</span>
                {optimization}
                </li>
            ))}
            </ul>
        </SectionCard>

        {/* Competitive Analysis */}
            <SectionCard title={getTranslation(currentLanguage, 'competitiveAnalysis')}>
              <p>{analysis.competitiveAnalysis || getTranslation(currentLanguage, 'noCompetitiveAnalysisAvailable')}</p>
            </SectionCard>
          </div>

        </div>
      </div>


      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: "0px -4px 10px #80808021, 0 -4px 5px #80808000",
        padding: '0 15px'
      }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <img width="70"
            style={{
              width: '100px',
              height: '70px',
              objectFit: 'cover'
            }}
             src={chrome.runtime.getURL('icons/logo.png')} alt={getTranslation(currentLanguage, 'logo')} />
          </div>

          {/* <button className="primary"
          style={{
            width: '50%',
            height: '48px',
            fontSize: '18px',
            margin: '12px 15px',
          }}
          >{getTranslation(currentLanguage, 'upgradeToPremium')}</button> */}

          
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}; 