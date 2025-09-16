// Run this in the browser console on any page

console.log('=== Extension Debug Information ===');

// Check if Chrome extension API is available
if (typeof chrome !== 'undefined') {
  console.log('✅ Chrome extension API is available');
  
  if (chrome.runtime) {
    console.log('✅ Chrome runtime API is available');
    
    // Get extension ID
    const extensionId = chrome.runtime.id;
    console.log('📋 Extension ID:', extensionId);
    
    // Check if extension ID is valid
    if (extensionId && extensionId !== 'invalid') {
      console.log('✅ Extension ID is valid');
    } else {
      console.log('❌ Extension ID is invalid:', extensionId);
    }
    
    // Get extension URL
    try {
      const extensionUrl = chrome.runtime.getURL('');
      console.log('🔗 Extension URL:', extensionUrl);
    } catch (error) {
      console.log('❌ Error getting extension URL:', error);
    }
    
    // Check manifest
    try {
      const manifest = chrome.runtime.getManifest();
      console.log('📄 Manifest:', manifest);
    } catch (error) {
      console.log('❌ Error getting manifest:', error);
    }
    
  } else {
    console.log('❌ Chrome runtime API is not available');
  }
  
  if (chrome.tabs) {
    console.log('✅ Chrome tabs API is available');
  }
  
  if (chrome.storage) {
    console.log('✅ Chrome storage API is available');
  }
  
} else {
  console.log('❌ Chrome extension API is not available');
}

// Check for any existing extension elements
console.log('\n=== DOM Elements Check ===');
const sidebar = document.getElementById('linkedin-profile-scorer-sidebar');
const toggle = document.getElementById('linkedin-profile-scorer-toggle');

if (sidebar) {
  console.log('✅ Extension sidebar found');
} else {
  console.log('❌ Extension sidebar not found');
}

if (toggle) {
  console.log('✅ Extension toggle button found');
} else {
  console.log('❌ Extension toggle button not found');
}

// Check if we're on a LinkedIn profile page
console.log('\n=== Page Context Check ===');
console.log('Current URL:', window.location.href);
console.log('Is LinkedIn profile page:', window.location.pathname.startsWith('/in/'));

// Check for any console errors
console.log('\n=== Error Check ===');
console.log('Check the browser console for any red error messages related to the extension.');

console.log('\n=== Manual Debugging Steps ===');
console.log('1. Go to chrome://extensions/');
console.log('2. Enable Developer mode');
console.log('3. Look for "LinkedIn Profile Scorer" extension');
console.log('4. Check for any error messages');
console.log('5. Try clicking "Reload" on the extension');
console.log('6. Check "Errors" button if available'); 