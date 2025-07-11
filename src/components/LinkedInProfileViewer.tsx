import React, { useState } from 'react';
import { useLinkedInProfile } from '../utils/hooks/useLinkedInProfile';
import { AIAnalysisSidebar } from './AIAnalysisSidebar';
import { ExportButtons } from './ExportButtons';
import { ProfileData } from '../utils/profileExtractor';
import { aiAnalyzer, hasCustomLinkedInUrl } from '../utils/aiAnalyzer';
import { useLanguage, getTranslation } from '../utils/translations';

const CircularProgress: React.FC<{ value: number; size?: number; stroke?: number; color?: string; fontSize?: string }> = ({ value, size = 96, stroke = 8, color = '#0B66C2', fontSize = '1.5rem' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle
        stroke="#E0E0E0"
        fill="none"
        strokeWidth={stroke}
        cx={size / 2}
        cy={size / 2}
        r={radius}
      />
      <circle
        stroke={color}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,2,.6,1)' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize={fontSize}
        fontWeight="700"
        fill={color}
      >
        {`${value}%`}
      </text>
    </svg>
  );
};

export const LinkedInProfileViewer: React.FC = () => {
  const { profile, loading, error, aiAnalysis, aiLoading, aiError, refreshProfileData } = useLinkedInProfile();
  const currentLanguage = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true, // Basic info is expanded by default
    about: false,
    experience: false,
    education: false,
    skills: false,
    projects: false,
    languages: false,
    certifications: false,
    volunteering: false,
    featured: false,
    activity: false,
    recommendations: false,
    publications: false,
    courses: false,
    honorsAwards: false,
    causes: false,
    aiAnalysis: true, // AI Analysis section is expanded by default
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Convert profile data to the format expected by AI analyzer
  const getProfileDataForAI = (): ProfileData => {
    if (!profile) return {} as ProfileData;
    
    return {
      name: profile.basicInfo.name,
      headline: profile.basicInfo.headline,
      currentPosition: profile.basicInfo.headline,
      hasProfilePhoto: !!profile.basicInfo.profileImage,
      summary: profile.about?.content || '',
      customUrl: profile.customUrl || '',
      recentActivityCount: 0,
      experience: profile.experience?.map((exp: any) => ({
        title: exp.title,
        company: exp.company,
        duration: exp.duration
      })) || [],
      education: profile.education?.map((edu: any) => ({
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        duration: edu.duration
      })) || [],
      skills: profile.skills?.map((skill: any) => ({
        name: skill.name,
        endorsements: skill.endorsements
      })) || [],
      connections: 0,
      recommendations: 0,
      country: profile.basicInfo.location || '',
      backgroundImage: ''
    };
  };

  if (loading) {
    return <div className='loader-container'
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      flexDirection: 'column',
    }}
    >
      <span className="loader" dir="ltr"></span>
      <p 
      style={{
        fontSize: '21px',
        fontWeight: '200',
        marginTop: '20px',
        color: '#6b7280'
      }}
      >{getTranslation(currentLanguage, 'readingProfile')}...</p>
    </div>
  }

  if (error) {
    return <div>{getTranslation(currentLanguage, 'error')}: {error}</div>;
  }

  if (!profile) {
    return <div>{getTranslation(currentLanguage, 'noProfileDataFound')}</div>;
  }

  const handleMouseOver = (className: string) => {
    const section = document.querySelector(`.${className}`) as HTMLElement;
    section?.classList.add('hover-section');
    window.scrollTo({
      top: section?.offsetTop - 100,
      behavior: 'smooth'
    });
  };

  const handleMouseLeave = (className: string) => {
    const section = document.querySelector(`.${className}`) as HTMLElement;
    section?.classList.remove('hover-section');
  };

  // Detect RTL
  const isRTL = document?.documentElement?.dir === 'rtl';

  // Debug custom URL status
  const customUrlStatus = {
    hasCustomUrl: hasCustomLinkedInUrl(),
    extractedUrl: getTranslation(currentLanguage, 'notAvailable'),
    profileCustomUrl: profile?.customUrl || getTranslation(currentLanguage, 'notSet')
  };

  const renderSection = (
    sectionKey: string,
    title: string,
    content: React.ReactNode,
    defaultExpanded: boolean = false
  ) => {
    const isExpanded = expandedSections[sectionKey] ?? defaultExpanded;
    
    return (
      <section className={`${sectionKey.toLowerCase()} section`}>
        <div 
          className="section-header" 
          onClick={() => toggleSection(sectionKey)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <h2>{title}</h2>
          <span>{isExpanded ? '▼' : '▶'}</span>
        </div>
        {isExpanded && (
          <div className="section-content">
            {content}
          </div>
        )}
      </section>
    );
  };

  // Calculate the new score breakdown

  return (
    <div className={`linkedin-profile-viewer-sidebar${isRTL ? ' rtl' : ''}`}>
      <div className="toggle-button">
        <button onClick={() => {
          const sidebar = document.querySelector('#linkedin-profile-scorer-sidebar');
          sidebar?.classList.toggle('sidebar-hidden');
        }}>
          <img width="50" src={chrome.runtime.getURL('icons/logo-short.png')} alt={getTranslation(currentLanguage, 'logo')} />
        </button>
      </div>

      {/* AI Analysis Section */}
      <div className="sidebar-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {expandedSections.aiAnalysis && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <AIAnalysisSidebar 
              analysis={aiAnalysis}
              loading={aiLoading}
              error={aiError}
              refreshProfileData={refreshProfileData}
              profile={profile}
            />
          </div>
        )}
      </div>

      {/* Export Section */}
      {aiAnalysis && !aiLoading && !aiError && (
        <ExportButtons 
          profile={profile}
          aiAnalysis={aiAnalysis}
        />
      )}

      {/* Debug Section - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="sidebar-card" style={{ marginTop: '10px', padding: '10px', fontSize: '12px', backgroundColor: '#f5f5f5' }}>
          <h4>{getTranslation(currentLanguage, 'debugInfo')}:</h4>
          <p><strong>{getTranslation(currentLanguage, 'hasCustomUrl')}:</strong> {customUrlStatus.hasCustomUrl ? getTranslation(currentLanguage, 'yes') : getTranslation(currentLanguage, 'no')}</p>
          <p><strong>{getTranslation(currentLanguage, 'extractedUrl')}:</strong> {customUrlStatus.extractedUrl || getTranslation(currentLanguage, 'none')}</p>
          <p><strong>{getTranslation(currentLanguage, 'profileCustomUrl')}:</strong> {customUrlStatus.profileCustomUrl}</p>
        </div>
      )}
    </div>
  );
}; 