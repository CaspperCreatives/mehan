import React, { useState, useEffect } from 'react';
import { AIAnalysisResult } from '../utils/aiAnalyzer';
import { Icon, IconNames, getIconNameFromSection } from './Icon';
import { useLanguage, getTranslation, Language } from '../utils/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';
import { ExportButtons } from './ExportButtons';
import { RefreshLimiter } from '../utils/refreshLimiter';
import { Tooltip } from './Tooltip';

interface AIAnalysisSidebarProps {
  analysis: AIAnalysisResult | null;
  loading: boolean;
  error: string | null;
  refreshProfileData: () => Promise<void>;
  profile: any;
  cached?: boolean;
  timestamp?: string;
}

// Custom hook for count-up animation
const useCountUp = (targetValue: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = typeof targetValue === 'number' && !isNaN(targetValue) ? targetValue : 0;

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
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
  if (typeof score !== 'number' || isNaN(score)) {
    return '#6b7280';
  }
  
  let percentage = score;
  if (maxPossiblePoints && maxPossiblePoints > 0) {
    percentage = (score / maxPossiblePoints) * 100;
  }
  
  if (percentage >= 75) return '#22c55e';
  if (percentage >= 25) return '#eab308';
  return '#ef4444';
};

// GaugeSlider Component
const GaugeSlider: React.FC<{ value: number }> = ({ value }) => {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const percent = Math.max(0, Math.min(100, safeValue));
  const size = 170;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (percent / 100) * circumference;
  const offset = circumference - progress;
  const scoreColor = getScoreColor(safeValue, 100);

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
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke={'#E4EAF2'}
          strokeWidth={stroke}
          style={{ transition: 'all 0.5s cubic-bezier(.4,2,.6,1)' }}
        />
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

// SectionCard Component
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

// KeywordTag Component
const KeywordTag: React.FC<{ keyword: string; type: 'relevant' | 'missing' }> = ({ keyword, type }) => (
  <span className={`keyword-tag ${type}`}>
    {keyword}
  </span>
);

// TopHeader Component
const TopHeader: React.FC<{
  overallScore: number;
  currentLanguage: Language;
  refreshLimit: { canRefresh: boolean; remaining: number; resetTime: string };
  isRefreshing: boolean;
  onRefresh: () => void;
  showLimitInfo: boolean;
  setShowLimitInfo: (show: boolean) => void;
  profile: any;
  parsedAnalysis: AIAnalysisResult;
  cached?: boolean;
  timestamp?: string;
}> = ({ overallScore, currentLanguage, refreshLimit, isRefreshing, onRefresh, showLimitInfo, setShowLimitInfo, profile, parsedAnalysis, cached, timestamp }) => (
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
          onClick={onRefresh}
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
        {parsedAnalysis && (
          <ExportButtons profile={profile} aiAnalysis={parsedAnalysis} iconOnly />
        )}
        
        {cached && timestamp && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#16a34a'
          }}>
            <span style={{ fontSize: '14px' }}>💾</span>
            <span>Cached</span>
            <span style={{ opacity: 0.7 }}>
              {new Date(timestamp).toLocaleDateString()}
            </span>
          </div>
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
);

// Loading Component
const LoadingSpinner: React.FC<{ currentLanguage: Language }> = ({ currentLanguage }) => (
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

// Error Component
const ErrorDisplay: React.FC<{ error: string; currentLanguage: Language }> = ({ error, currentLanguage }) => (
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

// No Analysis Component
const NoAnalysisDisplay: React.FC<{ currentLanguage: Language }> = ({ currentLanguage }) => (
  <div style={{
    padding: '20px',
    textAlign: 'center',
    color: '#6b7280'
  }}>
    <p>{getTranslation(currentLanguage, 'noAnalysisAvailable')}</p>
  </div>
);

// Footer Component
const Footer: React.FC<{ currentLanguage: Language }> = ({ currentLanguage }) => (
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
      <img 
        width="70"
        style={{
          width: '100px',
          height: '70px',
          objectFit: 'cover'
        }}
        src={chrome.runtime.getURL('icons/logo.png')} 
        alt={getTranslation(currentLanguage, 'logo')} 
      />
    </div>
  </div>
);

// SectionsSlider Component
const SectionsSlider: React.FC<{ 
  sections: any[], 
  analysis: AIAnalysisResult, 
  currentLanguage: Language, 
  profile: any,
  generatedData?: any,
  parsedAnalysis?: AIAnalysisResult
}> = ({ sections, analysis, currentLanguage, profile, generatedData, parsedAnalysis }) => {
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
  };

  const othersSections = [
    'publications', 'languages', 'certificates', 'honorsawards', 'volunteer',
    'patents', 'testscores', 'organizations', 'contactinfo', 'featured',
    'projects', 'recommendations', 'causes'
  ];
  
  const mainSections = sections.filter((section) => {
    if (!section || !section.title) return false;
    const sectionTitle = section.title.toLowerCase();
    if (sectionTitle === 'honorsawards') return false;
    return !othersSections.includes(sectionTitle);
  });
  
  const othersSectionsData = sections.filter((section) => {
    if (!section || !section.title) return false;
    const sectionTitle = section.title.toLowerCase();
    if (sectionTitle === 'honorsawards') return true;
    return othersSections.includes(sectionTitle);
  });
  
  const othersTotalScore = othersSectionsData.reduce((sum, section) => sum + (section.score || 0), 0);
  const othersMaxScore = othersSectionsData.reduce((sum, section) => sum + (section.maxPossiblePoints || 0), 0);
  
  const [selectedSection, setSelectedSection] = useState<any>(() => {
    if (mainSections.length > 0) return mainSections[0];
    if (othersSectionsData.length > 0) return { title: 'others' };
    return null;
  });

  const findSectionByTitle = (title: string) => {
    return sections.find(section => {
      if (!section || !section.title) return false;
      const sectionTitle = section.title.toLowerCase();
      const searchTitle = title.toLowerCase();
      if (searchTitle === 'honorsawards') {
        return sectionTitle === 'honorsawards';
      }
      return sectionTitle === searchTitle;
    });
  };

  const handleSectionClick = (section: any) => {
    setSelectedSection(section);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="sections-slider">
        {mainSections.map((section, index) => (
          <div 
            key={`main-${index}`} 
            className={`section-card ${selectedSection && selectedSection.title.toLowerCase() === section.title.toLowerCase() ? 'active' : ''}`} 
            onClick={() => handleSectionClick(section)}
          >
            <span className="title" style={{ fontSize: '12px', textAlign: 'center', fontWeight: '500', color: '#6b7280' }}>
              {titleMap[section.title.toLowerCase()] || section.title}
            </span>
            <span className='icon'>
              <Icon name={getIconNameFromSection(section.title)} size={20} alt={section.title} />
            </span>
            <span className='color' style={{ color: getScoreColor(section.score || 0, section.maxPossiblePoints) }}>
              {section.score || 0} / {section.maxPossiblePoints || 0}
            </span>
          </div>
        ))}

        {othersSectionsData.length > 0 && (
          <div
            className={`section-card ${selectedSection && selectedSection.title.toLowerCase() === 'others' ? 'active' : ''}`}
            onClick={() => setSelectedSection({ title: 'others' })}
          >
            <span className="title" style={{ fontSize: '12px', textAlign: 'center', fontWeight: '500', color: '#6b7280' }}>
              {getTranslation(currentLanguage, 'others')}
            </span>
            <span className='icon'>
              <Icon name={'others'} size={20} alt={getTranslation(currentLanguage, 'others')} />
            </span>
            <span className='color' style={{ color: getScoreColor(othersTotalScore, othersMaxScore) }}>
              {othersTotalScore} / {othersMaxScore}
            </span>
          </div>
        )}
      </div>

      {selectedSection && selectedSection.title.toLowerCase() !== 'others' && (
        <div className="section-card-details" style={{ height: 'auto', overflow: 'auto' }}>
          <div className="section-card-details-content" style={{ boxShadow: 'none', display: 'flex', padding: '0 10px', justifyContent: 'flex-start', flexDirection: 'column', gap: '20px' }}>
            <div className="title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '600' }}>
                {titleMap[selectedSection.title.toLowerCase()] || selectedSection.title}
              </h3>
              <p className='color' style={{ fontSize: '24px', fontWeight: '600', color: getScoreColor(selectedSection.score || 0, selectedSection.maxPossiblePoints) }}>
                {selectedSection.score || 0} / {selectedSection.maxPossiblePoints || 0}
              </p>
            </div>

            <div className="criteria" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="criteria-list">
                <h4 style={{ fontSize: '16px', fontWeight: '500', color: 'rgb(25 25 25)', marginBottom: '10px' }}>
                  {getTranslation(currentLanguage, 'criteria')}
                </h4>
                {(selectedSection.criteria || []).map((criterion: any, index: number) => (
                  <div key={`criterion-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280' }}>{criterion.title}</p>
                    <div className="point" style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280' }}>
                      {criterion.point} {getTranslation(currentLanguage, 'outOf')} {selectedSection.maxPossiblePoints}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="recommendations">
                <h4 style={{ fontSize: '16px', fontWeight: '500', color: 'rgb(25 25 25)', marginBottom: '10px' }}>
                  {getTranslation(currentLanguage, 'analysisRecommendations')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {(parsedAnalysis?.analysis_recommendations?.[selectedSection.title.toLowerCase()] as any)?.map((recommendation: any, index: number) => (
                    <p key={`recommendation-${index}`} className="recommendation" style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280', display: 'flex', alignItems: 'flex-start', gap: '5px' }}> 
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

      {selectedSection && selectedSection.title.toLowerCase() === 'others' && (
        <div className="section-card-details" style={{ height: 'auto', overflow: 'auto' }}>
          <div className="section-card-details-content" style={{ boxShadow: 'none', display: 'flex', padding: '0 10px', justifyContent: 'flex-start', flexDirection: 'column', gap: '20px' }}>
            <div className="title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '600' }}>{getTranslation(currentLanguage, 'others')}</h3>
              <p style={{ fontSize: '24px', fontWeight: '600' }}>{othersTotalScore} {getTranslation(currentLanguage, 'outOf')} {othersMaxScore}</p>
            </div>

            <div className="criteria" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {['languages', 'publications', 'certificates', 'honorsawards', 'volunteer', 'patents', 'testscores', 'organizations', 'featured', 'projects', 'recommendations', 'causes'].map(sectionType => {
                const section = findSectionByTitle(sectionType);
                if (!section) return null;
                
                return (
                  <div key={sectionType} className="criteria-list">
                    <h4 style={{ fontSize: '16px', fontWeight: '500', color: 'rgb(25 25 25)', marginBottom: '10px' }}>
                      {getTranslation(currentLanguage, sectionType as keyof typeof getTranslation) || sectionType}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280' }}>
                        {getTranslation(currentLanguage, sectionType as keyof typeof getTranslation) || sectionType}
                      </p>
                      <div className="point" style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280' }}>
                        {section.score || 0} {getTranslation(currentLanguage, 'outOf')} {section.maxPossiblePoints || 1}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main AIAnalysisSidebar Component
export const AIAnalysisSidebar: React.FC<AIAnalysisSidebarProps> = ({ 
  analysis, 
  loading, 
  error, 
  refreshProfileData, 
  profile, 
  cached, 
  timestamp 
}) => {
  const currentLanguage = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshLimit, setRefreshLimit] = useState<{ canRefresh: boolean; remaining: number; resetTime: string }>({
    canRefresh: true,
    remaining: 2,
    resetTime: ''
  });
  const [showLimitInfo, setShowLimitInfo] = useState(false);
  const [aiErrorBeforeRefresh, setAiErrorBeforeRefresh] = useState<string | null>(null);

  // Parse AI analysis data from the profile if available
  const parseAIAnalysis = (profileData: any): AIAnalysisResult | null => {
    if (!profileData?.analysis?.aiAnalysis) {
      return null;
    }
    
    try {
      const aiAnalysisData = JSON.parse(profileData.analysis.aiAnalysis);
      return aiAnalysisData;
    } catch (error) {
      return null;
    }
  };

  const parsedAnalysis = parseAIAnalysis(profile) || analysis;

  useEffect(() => {
    const checkRefreshLimit = async () => {
      const limit = await RefreshLimiter.canRefresh();
      setRefreshLimit(limit);
    };
    checkRefreshLimit();
  }, []);

  const handleRefresh = async () => {
    const limit = await RefreshLimiter.canRefresh();
    if (!limit.canRefresh) {
      setShowLimitInfo(true);
      setTimeout(() => setShowLimitInfo(false), 3000);
      return;
    }

    setAiErrorBeforeRefresh(error);
    setIsRefreshing(true);
    
    try {
      await refreshProfileData();
      
      if (aiErrorBeforeRefresh && error) {
        return;
      }
      
      await RefreshLimiter.incrementRefreshCount();
      const newLimit = await RefreshLimiter.canRefresh();
      setRefreshLimit(newLimit);
    } catch (refreshError) {
      // Handle refresh error silently
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner currentLanguage={currentLanguage} />;
  }

  if (error) {
    return <ErrorDisplay error={error} currentLanguage={currentLanguage} />;
  }

  if (!parsedAnalysis) {
    return <NoAnalysisDisplay currentLanguage={currentLanguage} />;
  }

  const overallScore = useCountUp(parsedAnalysis.overallScore || 0);

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

    return () => {
      fadeUpTween.kill();
      slideToRightTween.kill();
    };
  }, [parsedAnalysis]);

  return (
    <div style={{
      height: '99vh',
      display: 'flex',
      overflowY: 'auto',
      flexDirection: 'column'
    }}>
      <TopHeader
        overallScore={overallScore}
        currentLanguage={currentLanguage}
        refreshLimit={refreshLimit}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        showLimitInfo={showLimitInfo}
        setShowLimitInfo={setShowLimitInfo}
        profile={profile}
        parsedAnalysis={parsedAnalysis}
        cached={cached}
        timestamp={timestamp}
      />

      <div className="white-card">
        <div className="white-card-header">
          <SectionsSlider 
            sections={parsedAnalysis.scoringBreakdown || []} 
            analysis={parsedAnalysis} 
            currentLanguage={currentLanguage} 
            profile={profile}
            generatedData={parsedAnalysis}
            parsedAnalysis={parsedAnalysis}
          />

          <div className='section-cards-holder'>
            <SectionCard title={getTranslation(currentLanguage, 'summary')}>
              <p>{parsedAnalysis.summary || getTranslation(currentLanguage, 'noSummaryAvailable')}</p>
            </SectionCard>

            <SectionCard title={getTranslation(currentLanguage, 'keywordAnalysis')}>
              <div style={{ marginBottom: '16px' }} >
                <h4>- {getTranslation(currentLanguage, 'relevantKeywords')}</h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    margin: '10px 0'
                  }}
                >
                  {(parsedAnalysis.keywordAnalysis?.relevantKeywords || []).map((keyword, index) => (
                    <KeywordTag key={index} keyword={keyword} type="relevant" />
                  ))}
                </div>
              </div>
              <div>
                <h4>- {getTranslation(currentLanguage, 'missingKeywords')}</h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    margin: '10px 0'
                  }}
                >
                  {(parsedAnalysis.keywordAnalysis?.missingKeywords || []).map((keyword, index) => (
                    <KeywordTag key={index} keyword={keyword} type="missing" />
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard title={getTranslation(currentLanguage, 'strengths')}>
              <ul>
                {(parsedAnalysis.strengths || []).map((strength, index) => (
                  <li key={index}>
                    <span style={{ color: '#22c55e', marginRight: '8px' }}>✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title={getTranslation(currentLanguage, 'areasForImprovement')}>
              <ul>
                {(parsedAnalysis.weaknesses || []).map((weakness, index) => (
                  <li key={index}>
                    <span style={{ color: '#ef4444', marginRight: '8px' }}>⚠</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title={getTranslation(currentLanguage, 'industryInsights')}>
              <p>{parsedAnalysis.industryInsights || getTranslation(currentLanguage, 'noIndustryInsightsAvailable')}</p>
            </SectionCard>

            <SectionCard title={getTranslation(currentLanguage, 'profileOptimization')}>
              <ul>
                {(parsedAnalysis.profileOptimization || []).slice(0, 3).map((optimization, index) => (
                  <li key={index}>
                    <span style={{ color: '#0B66C2', marginRight: '8px' }}>🔧</span>
                    {optimization}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title={getTranslation(currentLanguage, 'competitiveAnalysis')}>
              <p>{parsedAnalysis.competitiveAnalysis || getTranslation(currentLanguage, 'noCompetitiveAnalysisAvailable')}</p>
            </SectionCard>
          </div>
        </div>
      </div>

      <Footer currentLanguage={currentLanguage} />
      
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