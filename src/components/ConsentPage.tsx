import React, { useState } from 'react';
import { useLanguage, getTranslation } from '../utils/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faEye, faCog, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface ConsentPageProps {
  onConsent: (consent: boolean) => void;
}

export const ConsentPage: React.FC<ConsentPageProps> = ({ onConsent }) => {
  const { language: currentLanguage } = useLanguage();
  const [isRTL] = useState(document?.documentElement?.dir === 'rtl');
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const handleContinue = () => {
    if (isChecked) {
      // Store consent in localStorage
      localStorage.setItem('linkedin-extension-consent', 'true');
      localStorage.setItem('linkedin-extension-consent-date', new Date().toISOString());
      onConsent(true);
    }
  };

  return (
    <div className={`consent-page ${isRTL ? 'rtl' : ''}`}>
      <div className="consent-header">
        <div className="consent-icon">
          <FontAwesomeIcon icon={faShieldAlt} />
        </div>
        <h2>{getTranslation(currentLanguage, 'dataConsentTitle')}</h2>
        <p className="consent-subtitle">
          {getTranslation(currentLanguage, 'dataConsentSubtitle')}
        </p>
      </div>

      <div className="consent-content">
        <div className="consent-section">
          <h3>
            <FontAwesomeIcon icon={faEye} className="section-icon" />
            {getTranslation(currentLanguage, 'whatWeCollect')}
          </h3>
          <ul>
            <li>{getTranslation(currentLanguage, 'publicProfileData')}</li>
            <li>{getTranslation(currentLanguage, 'workExperience')}</li>
            <li>{getTranslation(currentLanguage, 'educationHistory')}</li>
            <li>{getTranslation(currentLanguage, 'skillsAndEndorsements')}</li>
            <li>{getTranslation(currentLanguage, 'publicPostsAndActivity')}</li>
          </ul>
        </div>

        <div className="consent-section">
          <h3>
            <FontAwesomeIcon icon={faCog} className="section-icon" />
            {getTranslation(currentLanguage, 'howWeUseData')}
          </h3>
          <ul>
            <li>{getTranslation(currentLanguage, 'aiAnalysisPurpose')}</li>
            <li>{getTranslation(currentLanguage, 'profileOptimization')}</li>
            <li>{getTranslation(currentLanguage, 'careerRecommendations')}</li>
            <li>{getTranslation(currentLanguage, 'performanceInsights')}</li>
          </ul>
        </div>

        <div className="consent-section">
          <h3>{getTranslation(currentLanguage, 'dataProtection')}</h3>
          <ul>
            <li>{getTranslation(currentLanguage, 'localProcessing')}</li>
            <li>{getTranslation(currentLanguage, 'noThirdPartySharing')}</li>
            <li>{getTranslation(currentLanguage, 'dataRetention')}</li>
            <li>{getTranslation(currentLanguage, 'userControl')}</li>
          </ul>
        </div>

        <div className="consent-note">
          <p>
            <strong>{getTranslation(currentLanguage, 'importantNote')}:</strong> {getTranslation(currentLanguage, 'consentNote')}
          </p>
        </div>
      </div>

      <div className="consent-actions">
        <div className="consent-checkbox-container">
          <input
            type="checkbox"
            id="consent-checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="consent-checkbox"
          />
          <label htmlFor="consent-checkbox" className="consent-checkbox-label">
            {getTranslation(currentLanguage, 'iUnderstandAndAccept')}
          </label>
        </div>
        <button 
          className={`consent-button continue-button ${!isChecked ? 'disabled' : ''}`}
          onClick={handleContinue}
          disabled={!isChecked}
        >
          <FontAwesomeIcon icon={faCheckCircle} />
          {getTranslation(currentLanguage, 'continue')}
        </button>
      </div>
    </div>
  );
};
