import React, { useState, useEffect } from 'react';
import { AIAnalysisResult } from '../utils/aiAnalyzer';
import { Icon, IconNames, getIconNameFromSection } from './Icon';
import { useLanguage, getTranslation, Language } from '../utils/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faInfoCircle, faWandMagicSparkles, faEdit, faPlay, faStar, faHome } from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';
import { ExportButtons } from './ExportButtons';
import { RefreshLimiter } from '../utils/refreshLimiter';
import { Tooltip } from './Tooltip';
import { marked } from 'marked';
import { AiService } from '../services/aiService';
import { ContentComparison } from './ContentComparison';
import { ContentLoadingSkeleton } from './ContentLoadingSkeleton';
import { WritingAnimation } from './WritingAnimation';
import { OptimizedContentService } from '../services/optimizedContentService';
import { UserManager } from '../utils/userManager';

interface AIAnalysisSidebarProps {
  analysis: AIAnalysisResult | null;
  loading: boolean;
  error: string | null;
  refreshProfileData: () => Promise<void>;
  profile: any;
  scrapedData?: any;
  cached?: boolean;
  timestamp?: string;
}

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

const getScoreColor = (score: number, maxScore?: number) => {
  let percentage = 0;
  
  if (maxScore && maxScore > 0) {
    percentage = (score / maxScore) * 100;
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
  toggleLanguage: () => void;
  refreshLimit: { canRefresh: boolean; remaining: number; resetTime: string };
  isRefreshing: boolean;
  onRefresh: () => void;
  showLimitInfo: boolean;
  setShowLimitInfo: (show: boolean) => void;
  profile: any;
  parsedAnalysis: AIAnalysisResult;
  profileScore?: any;
  cached?: boolean;
  timestamp?: string;
}> = ({ overallScore, currentLanguage, toggleLanguage, refreshLimit, isRefreshing, onRefresh, showLimitInfo, setShowLimitInfo, profile, parsedAnalysis, profileScore, cached, timestamp }) => (
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
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#374151',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
            e.currentTarget.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          <span style={{ fontSize: '14px' }}>
            {currentLanguage === 'en' ? '🇺🇸' : '🇸🇦'}
          </span>
          <span>{currentLanguage.toUpperCase()}</span>
        </button>

        {parsedAnalysis && (
          <ExportButtons profile={profile} aiAnalysis={{ ...parsedAnalysis, profile: [profile], profileScore }} iconOnly />
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
  parsedAnalysis?: AIAnalysisResult,
  onOptimizeContent: (section: any) => void,
  onEditOnLinkedIn: (section: any) => void,
  selectedSection: any,
  setSelectedSection: (section: any) => void,
  sectionLoading: boolean,
  getSectionContent: (section: string) => string,
  sectionsWithOptimizedContent: any[]
}> = ({ sections, analysis, currentLanguage, profile, generatedData, parsedAnalysis, onOptimizeContent, onEditOnLinkedIn, selectedSection, setSelectedSection, sectionLoading = false, getSectionContent, sectionsWithOptimizedContent }) => {
  // Constants
  const titleMap: { [key: string]: string } = {
    'linkedinurl': getTranslation(currentLanguage, 'url'),
    'headline': getTranslation(currentLanguage, 'headline'),
    'projects': getTranslation(currentLanguage, 'projects'),
    'education': getTranslation(currentLanguage, 'education'), 
    'experiences': getTranslation(currentLanguage, 'experiences'),
    'positions': getTranslation(currentLanguage, 'experiences'),
    'educations': getTranslation(currentLanguage, 'education'),
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
    'industry': getTranslation(currentLanguage, 'industry') || 'Industry',
    'company': getTranslation(currentLanguage, 'company') || 'Company',
    'jobtitle': getTranslation(currentLanguage, 'jobTitle') || 'Job Title',
    'occupation': getTranslation(currentLanguage, 'occupation') || 'Occupation',
    'courses': getTranslation(currentLanguage, 'courses') || 'Courses',
    'publications': getTranslation(currentLanguage, 'publications') || 'Publications',
    'languages': getTranslation(currentLanguage, 'languages') || 'Languages',
    'certificates': getTranslation(currentLanguage, 'certificates') || 'Certificates',
    'honorsawards': getTranslation(currentLanguage, 'honorsAwards') || 'Honors & Awards',
    'volunteer': getTranslation(currentLanguage, 'volunteer') || 'Volunteer',
    'patents': getTranslation(currentLanguage, 'patents') || 'Patents',
    'testscores': getTranslation(currentLanguage, 'testScores') || 'Test Scores',
    'organizations': getTranslation(currentLanguage, 'organizations') || 'Organizations',
    'contactinfo': getTranslation(currentLanguage, 'contactInfo') || 'Contact Info',
    'featured': getTranslation(currentLanguage, 'featured') || 'Featured',
    'causes': getTranslation(currentLanguage, 'causes') || 'Causes',
    'connections': getTranslation(currentLanguage, 'connections') || 'Connections',
    'followers': getTranslation(currentLanguage, 'followers') || 'Followers'
  };

  const othersSections = [
    'publications', 'languages', 'certificates', 'honorsAwards', 'volunteer',
    'patents', 'testScores', 'organizations', 'contactInfo', 'featured',
    'projects', 'recommendations', 'causes', 'courses', 'industry', 'company',
    'jobtitle', 'occupation', 'connections', 'followers'
  ];

  // Helper functions
  const filterMainSections = (sections: any[]) => {
    return sections.filter((section) => {
      if (!section || !section.section) return false;
      const sectionTitle = section.section;
      return !othersSections.includes(sectionTitle);
    });
  };

  const filterOthersSections = (sections: any[]) => {
    return sections.filter((section) => {
      if (!section || !section.section) return false;
      const sectionTitle = section.section;
      return othersSections.includes(sectionTitle);
    });
  };

  const findSectionByTitle = (title: string) => {
    return sections.find(section => {
      if (!section || !section.section) return false;
      const sectionTitle = section.section.toLowerCase();
      const searchTitle = title.toLowerCase();
      return sectionTitle === searchTitle;
    });
  };

  const handleSectionClick = (section: any) => {
    // Check if this section already has optimized content from the session
    const sectionWithOptimizedContent = sectionsWithOptimizedContent.find((s: any) => 
      s.section === section.section
    );
    
    const cleanSection = {
      ...section,
      title: section.section,
      section: section.section,
      originalContent: getSectionContent(section.section),
      optimizedContent: sectionWithOptimizedContent?.optimizedContent || section.optimizedContent
    };
    console.log('Section clicked:', section);
    console.log('Clean section with optimized content:', cleanSection);
    setSelectedSection(cleanSection);
  };

  // Computed values
  const mainSections = filterMainSections(sections);
  const othersSectionsData = filterOthersSections(sections);
  const othersTotalScore = othersSectionsData.reduce((sum, section) => sum + (section.score || 0), 0);
  const othersMaxScore = othersSectionsData.reduce((sum, section) => sum + (section.maxScore || 0), 0);


  // Sub-components
  const HomeSection = () => (
    <div className="section-card-details" style={{ height: 'auto' }}>
      <div className="home-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SectionCard title={getTranslation(currentLanguage, 'summary')}>
          <MarkdownRenderer content={analysis?.summary || getTranslation(currentLanguage, 'noSummaryAvailable')} />
        </SectionCard>

        <SectionCard title={getTranslation(currentLanguage, 'strengths')}>
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            {analysis?.strengths?.map((strength: string, index: number) => (
              <p key={index} style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280' }}> - {strength}</p>
            )) || <p style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280' }}>No strengths available</p>}
          </div>
        </SectionCard>

        <SectionCard title={getTranslation(currentLanguage, 'weaknesses')}> 
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            {analysis?.weaknesses?.map((weakness: string, index: number) => (
              <p key={index} style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280' }}> - {weakness}</p>
            )) || <p style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280' }}>No weaknesses available</p>}
          </div>
        </SectionCard>

        <SectionCard title={getTranslation(currentLanguage, 'industryInsights') || 'Industry Insights'}>
          <MarkdownRenderer content={analysis?.industryInsights || getTranslation(currentLanguage, 'noAnalysisAvailable')} />
        </SectionCard>
      </div>
    </div>
  );

  const SectionDetails = () => (
    <div className="section-card-details" style={{ height: 'auto' }}>
      {/* Section Title and Score */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div className="title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600' }}>
            {titleMap[selectedSection.section.toLowerCase()] || selectedSection.section}
          </h3>
          <p className='color' style={{ fontSize: '24px', fontWeight: '600', color: getScoreColor(selectedSection.score || 0, selectedSection.maxScore || 0) }}>
            {selectedSection.score || 0} / {selectedSection.maxScore || 0}
          </p>
        </div>
      </div>

      {/* Criteria */}
      <div className="criteria" style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '500', color: 'rgb(25 25 25)', marginBottom: '10px' }}>
          {getTranslation(currentLanguage, 'criteria')}
        </h4>
        {(selectedSection.details || []).map((detail: string, index: number) => (
          <div key={`detail-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280' }}>{detail}</p>
          </div>
        ))}
      </div>

      {/* Original Content */}
      <div className="original-content-card" style={{
         marginBottom: '20px',
         padding: '20px',
         borderRadius: '8px',
         boxShadow: '0 0 12px #80808017, 0 0 6px #80808024' }}>
        <div className='flex space-between items-center' style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
            }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'rgb(25 25 25 / 86%)', marginBottom: '10px' }}>
            {currentLanguage === 'ar' ? 'المحتوى الأصلي' : 'Original'} {titleMap[selectedSection.section.toLowerCase()] || selectedSection.section} {currentLanguage === 'ar' ? 'المحتوى' : 'Content'}
          </h4>
          {/* Action Buttons */}
          <div className="btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' }}>
            {/* Only show optimize button for specific sections */}
            {['skills', 'education', 'experiences', 'headline', 'summary'].includes(selectedSection.section?.toLowerCase()) && (
              <Tooltip text={sectionLoading ? "AI is optimizing..." : "AI Optimize Content"}>
                <button
                  onClick={() => onOptimizeContent(selectedSection)}
                  disabled={sectionLoading}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: sectionLoading 
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    fontSize: '16px',
                    cursor: sectionLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: sectionLoading 
                      ? '0 2px 8px rgba(156, 163, 175, 0.3)' 
                      : '0 4px 15px rgba(102, 126, 234, 0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: sectionLoading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!sectionLoading) {
                      e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!sectionLoading) {
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    }
                  }}
                >
                  {sectionLoading ? (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: '18px' }} />
                  )}
                </button>
              </Tooltip>
            )}
          
            <Tooltip text="Edit on LinkedIn">
              <button
                onClick={() => onEditOnLinkedIn(selectedSection)}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#22c55e';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.3)';
                }}
              >
                <FontAwesomeIcon icon={faEdit} style={{ fontSize: '18px' }} />
              </button>
            </Tooltip>
          </div>
        </div>
        <div style={{ 
          maxHeight: '200px', 
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          {selectedSection.originalContent ? (
            Array.isArray(selectedSection.originalContent) ? (
              <div>
                {selectedSection.originalContent.map((item: any, index: number) => (
                  <div key={index} style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e9ecef' }}>

                    {selectedSection.section === 'experiences' && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        
                        {/* Experience Details */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 'bold' }}>
                              {item.title || 'Unknown Position'}
                            </span>
                            {item.company?.industries && item.company.industries.length > 0 && (
                              <span style={{ 
                                backgroundColor: '#f3f4f6', 
                                color: '#6b7280', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                fontSize: '10px',
                                fontWeight: '500'
                              }}>
                                {item.company.industries[0]}
                              </span>
                            )}
                          </div>
                          
                          <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>
                            {item.companyName || item.company?.name || 'Unknown Company'}
                            {item.locationName && (
                              <span style={{ marginLeft: '8px' }}>• {item.locationName}</span>
                            )}
                          </div>
                          
                          {item.timePeriod && (
                            <div style={{ color: '#6b7280', fontSize: '12px' }}>
                              {item.timePeriod.startDate && (
                                <span>
                                  {item.timePeriod.startDate.month}/{item.timePeriod.startDate.year}
                                </span>
                              )}
                              {item.timePeriod.endDate ? (
                                <span>
                                  {' - '}{item.timePeriod.endDate.month}/{item.timePeriod.endDate.year}
                                </span>
                              ) : (
                                <span style={{ color: '#059669', fontWeight: '500' }}> - Present</span>
                              )}
                            </div>
                          )}
                          
                          {/* Company Size Info */}
                          {item.company?.employeeCountRange && (
                            <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
                              {item.company.employeeCountRange.start}-{item.company.employeeCountRange.end} employees
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedSection.section === 'education' && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>

                        {/* Education Details */}
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 'bold' }}>
                              {item.schoolName || 'Unknown School'}
                            </span>
                          </div>
                          
                          {item.timePeriod && (
                            <div style={{ color: '#6b7280', fontSize: '12px' }}>
                              {item.timePeriod.startDate?.year && (
                                <span>{item.timePeriod.startDate.year}</span>
                              )}
                              {item.timePeriod.endDate?.year ? (
                                <span>
                                  {' - '}{item.timePeriod.endDate.year}
                                </span>
                              ) : (
                                <span style={{ color: '#059669', fontWeight: '500' }}> - Present</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedSection.section === 'skills' && (
                      <div>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {item}
                        </span>
                      </div>
                    )}
                    {!['experiences', 'education', 'skills'].includes(selectedSection.section) && (
                      <div>{JSON.stringify(item, null, 2)}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280', margin: 0 }}>
                {String(selectedSection.originalContent)}
              </p>
            )
          ) : (
            <p style={{ fontSize: '14px', fontWeight: '300', color: '#6b7280', margin: 0 }}>
              {currentLanguage === 'ar' ? 'لا يوجد محتوى متاح لهذا القسم' : 'No content available for this section'}
            </p>
          )}
        </div>
      </div>

      {/* Optimized Content Display */}
      <div>
        {selectedSection.optimizedContent ? (
          <div className='optimized-content'
           style={{ 
            fontSize: '16px',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 0 12px rgb(11 102 194 / 9%), 0 0 4px rgb(11 102 194 / 19%)',
            border: '2px solid rgb(11 102 194 / 65%)',
            background: 'rgb(206 231 255 / 7%)' }}>

            <h2 className='color mb-2' style={{ fontSize: '16px', fontWeight: '600', color: '#1166c2', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
              <FontAwesomeIcon icon={faStar} style={{ fontSize: '18px', color: '#1166c2', width: '20px', height: '16px' }} />
              {currentLanguage === 'ar' ? 'محتوى محسن' : 'Optimized Content'}
            </h2>
            {sectionLoading ? (
              <div style={{ 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid rgba(17, 102, 194, 0.2)',
                    borderTop: '3px solid #1166c2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1166c2'
                  }}>
                    {currentLanguage === 'ar' ? 'جاري التحسين بواسطة الذكاء الاصطناعي...' : 'AI is optimizing your content...'}
                  </span>
                </div>
                
                <div style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(17, 102, 194, 0.1)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      height: '12px',
                      background: 'rgba(17, 102, 194, 0.1)',
                      borderRadius: '6px',
                      width: '85%'
                    }} />
                    <div style={{
                      height: '12px',
                      background: 'rgba(17, 102, 194, 0.1)',
                      borderRadius: '6px',
                      width: '92%'
                    }} />
                    <div style={{
                      height: '12px',
                      background: 'rgba(17, 102, 194, 0.1)',
                      borderRadius: '6px',
                      width: '78%'
                    }} />
                    <div style={{
                      height: '12px',
                      background: 'rgba(17, 102, 194, 0.1)',
                      borderRadius: '6px',
                      width: '88%'
                    }} />
                  </div>
                </div>
                
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  {currentLanguage === 'ar' ? 'قد يستغرق هذا بضع ثوانٍ...' : 'This may take a few seconds...'}
                </div>
              </div>
            ) : (
            <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#6b7280', textAlign: 'left', fontWeight: '500' }}>
              <MarkdownRenderer content={selectedSection.optimizedContent} />
            </p>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
            {currentLanguage === 'ar' ? 'اضغط على زر التحسين للحصول على محتوى محسن' : 'Click the optimize button to get AI-optimized content'}
          </div>
        )}
      </div>
    </div>
  );

  const OthersSection = () => (
    <div className="section-card-details" style={{ height: 'auto' }}>
      <div className="section-card-details-content" style={{ boxShadow: 'none', display: 'flex', padding: '0 10px', justifyContent: 'flex-start', flexDirection: 'column', gap: '20px' }}>
        <div className="title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600' }}>{getTranslation(currentLanguage, 'others')}</h3>
          <p style={{ fontSize: '24px', fontWeight: '600' }}>{othersTotalScore} {getTranslation(currentLanguage, 'outOf')} {othersMaxScore}</p>
        </div>

        <div className="criteria" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {othersSections.map(sectionType => {
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
                    {section.score || 0} {getTranslation(currentLanguage, 'outOf')} {section.maxScore || 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    if (!selectedSection) return null;
    
    if (selectedSection.title === 'home') {
      return <HomeSection />;
    }
    
    if (selectedSection.title === 'others') {
      return <OthersSection />;
    }
    
    return <SectionDetails />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="sections-slider">
        {/* Home Option */}
        <div
          className={`section-card ${selectedSection && selectedSection.title === 'home' ? 'active' : ''}`}
          onClick={() => setSelectedSection({ title: 'home', section: 'home' })}
        >
           <span className='color' style={{ fontSize: '12px', textAlign: 'center', fontWeight: '500', color: '#6b7280' }}>
            {currentLanguage === 'ar' ? 'نظرة عامة' : 'Overview'}
          </span>
          <span className='icon'>
            <FontAwesomeIcon icon={faHome} style={{ marginLeft: '5px', color: '#6b7280' }} />
          </span>
      
        </div>

        {mainSections.map((section, index) => {
          const isCurrentlyOptimizing = sectionLoading && selectedSection && selectedSection.section === section.section;
          return (
            <div 
              key={`main-${index}`} 
              className={`section-card ${selectedSection && selectedSection.section && selectedSection.section.toLowerCase() === section.section.toLowerCase() ? 'active' : ''}`} 
              onClick={() => !isCurrentlyOptimizing && handleSectionClick(section)}
              style={{
                cursor: isCurrentlyOptimizing ? 'not-allowed' : 'pointer',
                opacity: isCurrentlyOptimizing ? 0.7 : 1,
                position: 'relative'
              }}
            >
              <span className="title" style={{ fontSize: '12px', textAlign: 'center', fontWeight: '500', color: '#6b7280' }}>
                {titleMap[section.section.toLowerCase()] || section.section}
              </span>
              <span className='icon' style={{ position: 'relative' }}>
                {isCurrentlyOptimizing ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(17, 102, 194, 0.2)',
                    borderTop: '2px solid #1166c2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <Icon name={getIconNameFromSection(section.section)} size={20} alt={section.section} />
                )}
              </span>
              <span className='color' style={{ color: getScoreColor(section.score || 0, section.maxScore) }}>
                {isCurrentlyOptimizing ? (
                  <span style={{ fontSize: '10px', color: '#1166c2' }}>
                    {currentLanguage === 'ar' ? 'جاري...' : 'AI...'}
                  </span>
                ) : (
                  `${section.score || 0} / ${section.maxScore || 0}`
                )}
              </span>
            </div>
          );
        })}

        {othersSectionsData.length > 0 && (
          <div
            className={`section-card ${selectedSection && selectedSection.title === 'others' ? 'active' : ''}`}
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

      {renderSectionContent()}
    </div>
  );
};

// Markdown renderer component using marked
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        const html = await marked(content, {
          breaks: true,
          gfm: true
        });
        setHtmlContent(html);
      } catch (error) {
        console.error('Error rendering markdown:', error);
        setHtmlContent(content); // Fallback to plain text
      }
    };

    renderMarkdown();
  }, [content]);

  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        fontSize: '14px',
        color: '#374151',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap'
      }}
    />
  );
};

// Main AIAnalysisSidebar Component
export const AIAnalysisSidebar: React.FC<AIAnalysisSidebarProps> = ({ 
  loading, 
  error, 
  refreshProfileData, 
  scrapedData,
  cached, 
  timestamp 
}) => {
  // Constants and data extraction
  const profileData = scrapedData?.data?.data?.profile?.[0] || scrapedData?.data?.profile?.[0];
  const analysisData = scrapedData?.data?.data?.analysis || scrapedData?.data?.analysis;
  const profileScore = scrapedData?.data?.data?.profileScore || scrapedData?.data?.profileScore;

  // Hooks
  const { language: currentLanguage, toggleLanguage } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshLimit, setRefreshLimit] = useState<{ canRefresh: boolean; remaining: number; resetTime: string }>({
    canRefresh: true,
    remaining: 2,
    resetTime: ''
  });
  const [showLimitInfo, setShowLimitInfo] = useState(false);
  const [aiErrorBeforeRefresh, setAiErrorBeforeRefresh] = useState<string | null>(null);
  const [openSectionOpimizer, setOpenSectionOpimizer] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [originalContent, setOriginalContent] = useState('');
  const [selectedSection, setSelectedSection] = useState<any>(() => {
    return { title: 'home', section: 'home' };
  });
  const [sectionLoading, setSectionLoading] = useState(false);
  const [optimizedContentService] = useState(() => new OptimizedContentService());
  const [sectionsWithOptimizedContent, setSectionsWithOptimizedContent] = useState<any[]>([]);

  // Load optimized content from user session and database on component mount
  useEffect(() => {
    const loadOptimizedContentFromSession = async () => {
      try {
        // First try to load from local session
        const userSession = await UserManager.getCurrentUserSession();
        if (userSession?.optimizedContent && userSession.optimizedContent.length > 0) {
          console.log('🔄 Loading optimized content from local session:', userSession.optimizedContent);
          setSectionsWithOptimizedContent(userSession.optimizedContent);
          console.log('✅ Loaded optimized content from local session');
        } else {
          // If no local session, try to load from database
          try {
            const userId = await UserManager.getUserIdForDatabase();
            const dbContent = await optimizedContentService.getOptimizedContent(userId);
            
            if (dbContent && dbContent.length > 0) {
              console.log('🔄 Loading optimized content from database:', dbContent);
              
              // Convert database format to local format
              const localFormatContent = dbContent.map(item => ({
                section: item.section,
                originalContent: item.originalContent,
                optimizedContent: item.optimizedContent,
                sectionType: item.sectionType,
                metadata: item.metadata,
                optimizedAt: item.createdAt || new Date().toISOString()
              }));
              
              setSectionsWithOptimizedContent(localFormatContent);
              console.log('✅ Loaded optimized content from database');
            }
          } catch (dbError) {
            console.error('❌ Error loading optimized content from database:', dbError);
          }
        }
      } catch (error) {
        console.error('❌ Error loading optimized content from session:', error);
      }
    };

    loadOptimizedContentFromSession();
  }, []);

  // Helper functions
  const parseAIAnalysis = (): any => {
    if (!analysisData) {
      return null;
    }
    return analysisData;
  };

  // Merge sections with optimized content
  const getSectionsWithOptimizedContent = (sections: any[]) => {
    return sections.map(section => {
      const optimizedContentForSection = sectionsWithOptimizedContent.find(
        content => content.section === section.section
      );
      
      if (optimizedContentForSection) {
        return {
          ...section,
          optimizedContent: optimizedContentForSection.optimizedContent
        };
      }
      
      return section;
    });
  };

  // Create sections from profile data if sections prop is empty
  const createSectionsFromProfile = () => {
    if (!profileData) return [];
    
    const sections = [];
    
    // Add experiences/positions section
    if (profileData.positions && profileData.positions.length > 0) {
      sections.push({
        section: 'positions',
        title: 'experiences',
        score: 0,
        optimizedContent: null
      });
    }
    
    // Add education section
    if (profileData.educations && profileData.educations.length > 0) {
      sections.push({
        section: 'educations',
        title: 'education',
        score: 0,
        optimizedContent: null
      });
    }
    
    // Add other sections that exist in profile data
    if (profileData.headline) {
      sections.push({
        section: 'headline',
        title: 'headline',
        score: 0,
        optimizedContent: null
      });
    }
    
    if (profileData.summary) {
      sections.push({
        section: 'summary',
        title: 'summary',
        score: 0,
        optimizedContent: null
      });
    }
    
    if (profileData.skills && profileData.skills.length > 0) {
      sections.push({
        section: 'skills',
        title: 'skills',
        score: 0,
        optimizedContent: null
      });
    }
    
    if (profileData.recommendations && profileData.recommendations.length > 0) {
      sections.push({
        section: 'recommendations',
        title: 'recommendations',
        score: 0,
        optimizedContent: null
      });
    }
    
    if (profileData.projects && profileData.projects.length > 0) {
      sections.push({
        section: 'projects',
        title: 'projects',
        score: 0,
        optimizedContent: null
      });
    }
    
    return sections;
  };

  const getSectionContent = (section: string) => {
    if (!profileData) {
      return null;
    }
    console.log(section);
    
    const normalizedSection = section.toLowerCase();
    
    switch (normalizedSection) {
      case 'linkedinurl':
      case 'linkedin_url':
        return profileData.inputUrl || profileData.linkedinUrl || profileData.linkedin_url;
      case 'headline':
        return profileData.headline;
      case 'summary':
        return profileData.summary;
      case 'experiences':
      case 'experience':
      case 'positions':
        return profileData.positions || profileData.experiences || profileData.experience;
      case 'education':
      case 'educations':
        return profileData.educations || profileData.education;
      case 'skills':
        return profileData.skills;
      case 'recommendations':
        return profileData.recommendations;
      case 'projects':
        return profileData.projects;
      case 'publications':
        return profileData.publications;
      case 'languages':
        return profileData.languages;
      case 'certificates':
        return profileData.certifications || profileData.certificates;
      case 'honorsawards':
      case 'honors_awards':
        return profileData.honors || profileData.honorsawards || profileData.honors_awards;
      case 'volunteer':
        return profileData.volunteerExperiences || profileData.volunteer;
      case 'patents':
        return profileData.patents;
      case 'testscores':
      case 'test_scores':
        return profileData.testScores || profileData.testscores || profileData.test_scores;
      case 'organizations':
        return profileData.organizations;
      case 'contactinfo':
      case 'contact_info':
        return profileData.contactInfo || profileData.contactinfo || profileData.contact_info;
      case 'featured':
        return profileData.featured;
      case 'causes':
        return profileData.causes;
      case 'country':
        return profileData.geoLocationName || profileData.country;
      case 'profilepicture':
      case 'profile_picture':
        return profileData.pictureUrl || profileData.profilepicture || profileData.profile_picture;
      case 'backgroundimage':
      case 'background_image':
        return profileData.backgroundImage || profileData.backgroundimage || profileData.background_image;
      case 'connections':
        return profileData.connectionsCount || profileData.connections;
      case 'followers':
        return profileData.followersCount || profileData.followers;
      case 'opentowork':
      case 'open_to_work':
        return profileData.openToWork || profileData.open_to_work;
      case 'industry':
        return profileData.industryName;
      case 'company':
        return profileData.companyName;
      case 'jobtitle':
        return profileData.jobTitle;
      case 'occupation':
        return profileData.occupation;
      case 'courses':
        return profileData.courses;
      default:
        return null;
    }
  };

  const optimizeContent = async (content: string, sectionType?: string) => {
    try {
      const aiService = new AiService();
      const result = await aiService.optimizeContent(content, sectionType, currentLanguage);
      return result;
    } catch (error) {
      console.error('Failed to optimize content:', error);
      throw error;
    }
  };

  const saveOptimizedContentToDatabase = async (contentData: {
    section: string;
    originalContent: string;
    optimizedContent: string;
    sectionType?: string;
    profileId?: string;
    linkedinUrl?: string;
  }) => {
    try {
      // Calculate metadata
      const metadata = optimizedContentService.calculateContentMetadata(contentData.optimizedContent);
      
      // Create optimized content data object
      const optimizedContentData = {
        section: contentData.section,
        originalContent: contentData.originalContent,
        optimizedContent: contentData.optimizedContent,
        sectionType: contentData.sectionType,
        metadata,
        optimizedAt: new Date().toISOString()
      };
      
      // Add to user session and save complete user object to database
      const success = await optimizedContentService.addOptimizedContentToUserSession(
        optimizedContentData,
        profileData, // Complete profile data
        contentData.profileId || profileData?.profileId,
        contentData.linkedinUrl || profileData?.inputUrl || profileData?.linkedinUrl
      );
      
      if (success) {
        console.log('✅ Complete user object with optimized content saved to database');
      } else {
        console.error('❌ Failed to save complete user object to database');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to save optimized content to database:', error);
      throw error;
    }
  };

  // Event handlers
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

  const handleOptimizeContent = async (section: any) => {
    try {
      if (!section || !section.section) {
        console.error('Invalid section object:', section);
        return;
      }
      
      const sectionContent = getSectionContent(section.section);
      
      if (!sectionContent || sectionContent === `Content for ${section.section} section`) {
        console.error('No content available for section:', section.section);
        return;
      }
      
      setCurrentSection(section);
      setOriginalContent(sectionContent);
      setOptimizing(true);
      setSectionLoading(true);
      setOpenSectionOpimizer(true);
      
      const result = await optimizeContent(sectionContent, section.section);
      section.optimizedContent = result.data.optimizedContent;

      setSelectedSection(section);

      if (result.success && result.data) {
        setOptimizedContent(result.data.optimizedContent);
        setCurrentSection(section);
        
        // Update the sections with optimized content state
        const newOptimizedContent = {
          section: section.section,
          originalContent: sectionContent,
          optimizedContent: result.data.optimizedContent,
          sectionType: section.section,
          metadata: optimizedContentService.calculateContentMetadata(result.data.optimizedContent),
          optimizedAt: new Date().toISOString()
        };
        
        setSectionsWithOptimizedContent(prev => {
          const existingIndex = prev.findIndex(content => content.section === section.section);
          if (existingIndex >= 0) {
            // Update existing content
            const updated = [...prev];
            updated[existingIndex] = newOptimizedContent;
            return updated;
          } else {
            // Add new content
            return [...prev, newOptimizedContent];
          }
        });
        
        // Save optimized content to database
        try {
          await saveOptimizedContentToDatabase({
            section: section.section,
            originalContent: sectionContent,
            optimizedContent: result.data.optimizedContent,
            sectionType: section.section,
            profileId: profileData?.profileId,
            linkedinUrl: profileData?.inputUrl || profileData?.linkedinUrl
          });
        } catch (saveError) {
          console.error('Failed to save optimized content to database:', saveError);
          // Don't throw the error - the optimization was successful, just saving failed
        }
      } else {
        console.error('Failed to optimize content:', result.error);
      }
    } catch (error) {
      console.error('Failed to optimize content:', error);
    } finally {
      setOptimizing(false);
      setSectionLoading(false);
    }
  };

  const handleEditOnLinkedIn = (section: any) => {
    // TODO: Implement LinkedIn editing functionality
    // This could include:
    // - Opening LinkedIn profile edit page
    // - Navigating to specific section on LinkedIn
    // - Opening LinkedIn in new tab/window
  };

  // Effects
  useEffect(() => {
    const checkRefreshLimit = async () => {
      const limit = await RefreshLimiter.canRefresh();
      setRefreshLimit(limit);
    };
    checkRefreshLimit();
  }, []);

  // Computed values
  const parsedAnalysis = parseAIAnalysis();
  const overallScore = useCountUp(profileScore?.totalScore || 0);

  // Early returns for loading, error, and no analysis states
  if (loading) {
    return <LoadingSpinner currentLanguage={currentLanguage} />;
  }

  if (error) {
    return <ErrorDisplay error={error} currentLanguage={currentLanguage} />;
  }

  if (!parsedAnalysis) {
    return <NoAnalysisDisplay currentLanguage={currentLanguage} />;
  }

  // Main render
  return (
    <div style={{
      height: '99vh',
      display: 'flex',
      overflowY: 'auto',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Global Loading Overlay */}
      {sectionLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px 32px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '300px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(17, 102, 194, 0.2)',
              borderTop: '4px solid #1166c2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                {currentLanguage === 'ar' ? 'جاري التحسين...' : 'Optimizing Content...'}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                {currentLanguage === 'ar' 
                  ? 'الذكاء الاصطناعي يحسن محتوى ملفك الشخصي' 
                  : 'AI is enhancing your profile content'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      <TopHeader
        overallScore={overallScore || 0}
        currentLanguage={currentLanguage}
        toggleLanguage={toggleLanguage}
        refreshLimit={refreshLimit}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        showLimitInfo={showLimitInfo}
        setShowLimitInfo={setShowLimitInfo}
        profile={profileData}
        parsedAnalysis={parsedAnalysis}
        profileScore={profileScore}
        cached={cached}
        timestamp={timestamp}
      />

      <div className="white-card">
        <div className="white-card-header">
          <SectionsSlider 
            sections={getSectionsWithOptimizedContent(profileScore?.sectionScores?.length > 0 ? profileScore.sectionScores : createSectionsFromProfile())} 
            analysis={parsedAnalysis} 
            currentLanguage={currentLanguage} 
            profile={profileData}
            generatedData={parsedAnalysis}
            parsedAnalysis={parsedAnalysis}
            onOptimizeContent={handleOptimizeContent}
            onEditOnLinkedIn={handleEditOnLinkedIn}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            sectionLoading={sectionLoading}
            getSectionContent={getSectionContent}
            sectionsWithOptimizedContent={sectionsWithOptimizedContent}
          />
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .markdown-content {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .markdown-content h1,
          .markdown-content h2,
          .markdown-content h3,
          .markdown-content h4,
          .markdown-content h5,
          .markdown-content h6 {
            margin: 16px 0 8px 0;
            font-weight: 600;
            color: #1f2937;
          }
          
          .markdown-content h1 { font-size: 20px; }
          .markdown-content h2 { font-size: 18px; }
          .markdown-content h3 { font-size: 16px; }
          .markdown-content h4 { font-size: 15px; }
          .markdown-content h5 { font-size: 14px; }
          .markdown-content h6 { font-size: 13px; }
          
          .markdown-content p {
            margin: 8px 0;
            line-height: 1.6;
          }
          
          .markdown-content ul,
          .markdown-content ol {
            margin: 8px 0;
            padding-left: 20px;
          }
          
          .markdown-content li {
            margin: 4px 0;
            line-height: 1.5;
          }
          
          .markdown-content strong {
            font-weight: 600;
            color: #1f2937;
          }
          
          .markdown-content em {
            font-style: italic;
            color: #4b5563;
          }
          
          .markdown-content code {
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
            font-size: 13px;
            color: #dc2626;
          }
          
          .markdown-content blockquote {
            border-left: 4px solid #e5e7eb;
            margin: 16px 0;
            padding-left: 16px;
            color: #6b7280;
            font-style: italic;
          }
        `}
      </style>
    </div>
  );
}; 