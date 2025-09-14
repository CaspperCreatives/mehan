import React, { useState, useEffect } from 'react';
import { useLinkedInProfile } from '../utils/hooks/useLinkedInProfile';
import { AIAnalysisSidebar } from './AIAnalysisSidebar';
import { ExportButtons } from './ExportButtons';
import { hasCustomLinkedInUrl } from '../utils/aiAnalyzer';
import { useLanguage, getTranslation } from '../utils/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faInfoCircle, faWandMagicSparkles, faEdit, faPlay, faStar, faHome } from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';
import { RefreshLimiter } from '../utils/refreshLimiter';
import { Tooltip } from './Tooltip';
import { marked } from 'marked';
import { AiService } from '../services/aiService';
import { ContentComparison } from './ContentComparison';
import { ContentLoadingSkeleton } from './ContentLoadingSkeleton';
import { WritingAnimation } from './WritingAnimation';


export const LinkedInProfileViewer: React.FC = () => {
  const { profile, loading, error, aiAnalysis, aiLoading, aiError, scrapedData, refreshProfileData } = useLinkedInProfile();
  
  // Log scrapedData for debugging
  console.log('🔍 [LinkedInProfileViewer] scrapedData from hook:', scrapedData);
  console.log('🔍 [LinkedInProfileViewer] scrapedData type:', typeof scrapedData);
  
  const { language: currentLanguage } = useLanguage();
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

  // Extract cache information from the profile data
  const getCacheInfo = () => {
    if (profile?.cached !== undefined) {
      return {
        cached: profile.cached,
        timestamp: profile.timestamp
      };
    }
    return { cached: false, timestamp: undefined };
  };

  const { cached, timestamp } = getCacheInfo();


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
      <div 
      style={{
        fontSize: '21px',
        fontWeight: '200',
        marginTop: '20px',
        color: '#6b7280',
        textAlign: 'center'
      }}
      >
        <WritingAnimation 
          text={getTranslation(currentLanguage, 'aiAnalyzingProfile')}
          speed={80}
        />
      </div>
    </div>
  }

  if (error) {
    return <div>{getTranslation(currentLanguage, 'error')}: {error}</div>;
  }




  // Detect RTL
  const isRTL = document?.documentElement?.dir === 'rtl';

  // Debug custom URL status
  const customUrlStatus = {
    hasCustomUrl: hasCustomLinkedInUrl(),
    extractedUrl: getTranslation(currentLanguage, 'notAvailable'),
    profileCustomUrl: profile?.customUrl || getTranslation(currentLanguage, 'notSet')
  };


  // Calculate the new score breakdown

  return (
    <div className={`linkedin-profile-viewer-sidebar${isRTL ? ' rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
              scrapedData={scrapedData}
              cached={cached}
              timestamp={timestamp}
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