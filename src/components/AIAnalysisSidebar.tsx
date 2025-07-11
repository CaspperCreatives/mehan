import React, { useState, useEffect } from 'react';
import { AIAnalysisResult } from '../utils/aiAnalyzer';
import { Icon, IconNames, getIconNameFromSection } from './Icon';
import { useLanguage, getTranslation, Language } from '../utils/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';
import { ExportButtons } from './ExportButtons';

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

const SectionsSlider: React.FC<{ sections: any[], analysis: AIAnalysisResult, currentLanguage: Language }> = ({ sections, analysis, currentLanguage }) => {
  
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
            onClick={() => setSelectedSection(section)}
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
            onClick={() => setSelectedSection({title: 'others'})}
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
                    marginBottom: '10px'
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
                    marginBottom: '10px'
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
                    marginBottom: '10px'
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
                    marginBottom: '10px'
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
                    marginBottom: '10px'
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfileData();
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="refresh-button" onClick={handleRefresh}>
            <FontAwesomeIcon 
              icon={faRotateRight} 
              className={isRefreshing ? 'fa-spin' : ''}
              style={{ fontSize: '16px', color: '#6b7280' }}
            />
          </div>
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

            <SectionsSlider sections={analysis.scoringBreakdown || []} analysis={analysis} currentLanguage={currentLanguage} />

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