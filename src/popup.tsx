import React from 'react';
import ReactDOM from 'react-dom/client';
import './utils/languageDetector';
import { useLanguage, getTranslation } from './utils/translations';

const Popup: React.FC = () => {
  const { language: currentLanguage } = useLanguage();
  
  return (
    <div className="popup">
      <h1>{getTranslation(currentLanguage, 'linkedinProfileScorer')}</h1>
      <p>{getTranslation(currentLanguage, 'visitProfileMessage')}</p>
      <div className="popup-footer">
        <a 
          href="https://github.com/yourusername/linkedin-profile-scorer" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {getTranslation(currentLanguage, 'github')}
        </a>
        <span>•</span>
        <a 
          href="https://github.com/yourusername/linkedin-profile-scorer/issues" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {getTranslation(currentLanguage, 'reportIssues')}
        </a>
      </div>
    </div>
  );
};

// Use React 18's createRoot API
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
} 