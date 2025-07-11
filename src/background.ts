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
  if (request.type === 'PROFILE_DATA' && request.profileId && request.data) {
    // Store profile data in extension storage
    chrome.storage.local.set({ [request.profileId]: request.data }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
  
  if (request.type === 'GET_PROFILE_DATA' && request.profileId) {
    // Retrieve stored profile data
    chrome.storage.local.get([request.profileId], (result: { [key: string]: any }) => {
      sendResponse(result[request.profileId as string] || null);
    });
    return true; // Required for async sendResponse
  }
}); 