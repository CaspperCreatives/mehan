// Background script for LinkedIn Profile Scorer extension

interface ProfileData {
  profileId: string;
  data: any;
}

interface MessageRequest {
  type: string;
  profileId?: string;
  data?: any;
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Profile Scorer extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((
  request: MessageRequest,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  // Removed localStorage dependency - all data should come from database only
  // This prevents data mixing between users
  
  if (request.type === 'PROFILE_DATA' && request.profileId && request.data) {
    // Data is now handled directly by the database - no local storage
    sendResponse({ success: true });
    return true;
  }
  
  if (request.type === 'GET_PROFILE_DATA' && request.profileId) {
    // Data should be retrieved from database only
    sendResponse(null);
    return true;
  }
}); 