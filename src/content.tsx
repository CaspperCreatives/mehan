import ReactDOM from 'react-dom/client';
import React, { Suspense, useState } from 'react';
import './styles.css';
import './consent-styles.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fontsource/tajawal/300.css';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';
import './utils/languageDetector';

// Import the component directly instead of lazy loading to avoid issues in extension context
import { LinkedInProfileViewer } from './components/LinkedInProfileViewer';
import { ConsentPage } from './components/ConsentPage';
import { ConsentManager } from './utils/consentManager';

// Loading component
const LoadingComponent = () => (
  <div className='loader-container'
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
    >Loading...</p>
  </div>
);

// Main component that handles consent flow
const MainComponent: React.FC = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [isRTL] = useState(document?.documentElement?.dir === 'rtl');

  React.useEffect(() => {
    // Check consent status on mount
    const consentValid = ConsentManager.isConsentValid();
    setHasConsent(consentValid);
  }, []);

  const handleConsent = (consent: boolean) => {
    ConsentManager.setConsent(consent);
    setHasConsent(consent);
  };

  // Show loading while checking consent
  if (hasConsent === null) {
    return <LoadingComponent />;
  }

  // Show consent page if no consent
  if (!hasConsent) {
    return <ConsentPage onConsent={handleConsent} />;
  }

  // Show profile viewer if consent given
  return <LinkedInProfileViewer />;
};

// Create and inject the sidebar container
const createSidebar = () => {
  let sidebar = document.getElementById('linkedin-profile-scorer-sidebar');
  if (!sidebar) {
    sidebar = document.createElement('div');
    sidebar.id = 'linkedin-profile-scorer-sidebar';
    sidebar.classList.add('sidebar-hidden');
    document.body.appendChild(sidebar);
  }
  return sidebar;
};

// Create and inject the toggle button
const createToggleButton = () => {
  let toggle = document.getElementById('linkedin-profile-scorer-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = 'linkedin-profile-scorer-toggle';
    toggle.className = 'profile-scorer-toggle';
    toggle.innerHTML = '⮜';
    document.body.appendChild(toggle);
  }
  return toggle;
};

// Toggle sidebar visibility
const setSidebarVisible = (visible: boolean) => {
  const sidebar = document.getElementById('linkedin-profile-scorer-sidebar');
  const toggle = document.getElementById('linkedin-profile-scorer-toggle');
  if (sidebar && toggle) {
    if (visible) {
      sidebar.classList.remove('sidebar-hidden');
      toggle.innerHTML = '⮜';
    } else {
      sidebar.classList.add('sidebar-hidden');
      toggle.innerHTML = '⮞';
    }
  }
};

// Check if current page is user's own profile
const isUserOwnProfile = (): boolean => {
  const hasEditBtn = document.querySelector('[href*="#edit-medium"]');
  return !!hasEditBtn;
};

// Initialize the extension
const initialize = async () => {
  // Check if we're on a profile page
  if (!window.location.pathname.startsWith('/in/')) {
    return;
  }

  // Check if it's the user's own profile
  const isOwnProfile = isUserOwnProfile();

  // Create sidebar container and toggle button
  const sidebarContainer = createSidebar();
  const toggleButton = createToggleButton();

  // Use React 18's createRoot API
  const root = ReactDOM.createRoot(sidebarContainer);
  
  // Render the main component (handles consent flow)
  root.render(
    <Suspense fallback={<LoadingComponent />}>
      <MainComponent />
    </Suspense>
  );

  // Set up toggle logic - only show sidebar if it's user's own profile
  setSidebarVisible(isOwnProfile);
  toggleButton.onclick = () => {
    const sidebar = document.getElementById('linkedin-profile-scorer-sidebar');
    if (sidebar) {
      setSidebarVisible(sidebar.classList.contains('sidebar-hidden'));
    }
  };
};

// Handle LinkedIn's SPA navigation
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    // Re-check if it's user's own profile and update sidebar visibility
    const isOwnProfile = isUserOwnProfile();
    setSidebarVisible(isOwnProfile);
    initialize();
  }
}).observe(document, { subtree: true, childList: true });

// Initial load
initialize(); 