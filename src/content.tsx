import ReactDOM from 'react-dom';
import { LinkedInProfileViewer } from './components/LinkedInProfileViewer';
import './styles.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fontsource/tajawal/300.css';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';
import './utils/languageDetector';

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

// Initialize the extension
const initialize = async () => {
  // Check if we're on a profile page
  if (!window.location.pathname.startsWith('/in/')) {
    return;
  }

  // Create sidebar container and toggle button
  const sidebarContainer = createSidebar();
  const toggleButton = createToggleButton();

  // Render the profile viewer component
  ReactDOM.render(
    <LinkedInProfileViewer />,
    sidebarContainer
  );

  // Set up toggle logic
  setSidebarVisible(false);
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
    initialize();
  }
}).observe(document, { subtree: true, childList: true });

// Initial load
initialize(); 