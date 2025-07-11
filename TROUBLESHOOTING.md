# Chrome Extension Troubleshooting Guide

## Error: `GET chrome-extension://invalid/ net::ERR_FAILED`

This error typically occurs when Chrome is trying to access an extension with an invalid ID or when the extension is not properly loaded.

## Quick Fix Steps

### 1. Reload the Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Find "LinkedIn Profile Scorer" extension
4. Click the "Reload" button (circular arrow icon)
5. Check for any error messages

### 2. Remove and Re-add the Extension
1. In `chrome://extensions/`, click "Remove" on the LinkedIn Profile Scorer extension
2. Click "Load unpacked"
3. Select the `dist` folder from your project
4. The extension should now load with a new ID

### 3. Check Extension Files
Verify all required files are present in the `dist` folder:
- ✅ manifest.json
- ✅ background.js
- ✅ content.js
- ✅ popup.html
- ✅ popup.js
- ✅ styles.css
- ✅ icons/ (folder with icon files)

## Debugging Steps

### 1. Use the Debug Script
1. Open any webpage in Chrome
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy and paste the contents of `debug-extension.js`
5. Press Enter to run the debug script
6. Check the output for any issues

### 2. Check Extension Errors
1. Go to `chrome://extensions/`
2. Look for any red error messages
3. Click "Errors" button if available
4. Check the console for specific error details

### 3. Test on LinkedIn Profile Page
1. Navigate to any LinkedIn profile page (e.g., `https://www.linkedin.com/in/username`)
2. Open Developer Tools
3. Check Console for any extension-related errors
4. Look for the extension sidebar and toggle button

## Common Issues and Solutions

### Issue: Extension ID is "invalid"
**Solution**: Remove and re-add the extension to get a new ID

### Issue: Extension not loading
**Solution**: 
1. Check if all files are present in `dist/` folder
2. Verify manifest.json is valid JSON
3. Ensure no syntax errors in JavaScript files

### Issue: Content script not running
**Solution**:
1. Check if you're on a LinkedIn profile page (`/in/` URL)
2. Verify content script matches in manifest.json
3. Check browser console for errors

### Issue: Popup not working
**Solution**:
1. Verify popup.html and popup.js exist
2. Check for JavaScript errors in popup
3. Ensure popup.html references popup.js correctly

## Manual Testing

### 1. Test Extension Loading
```javascript
// Run in browser console
if (typeof chrome !== 'undefined' && chrome.runtime) {
  console.log('Extension ID:', chrome.runtime.id);
  console.log('Extension URL:', chrome.runtime.getURL(''));
}
```

### 2. Test Content Script
1. Go to a LinkedIn profile page
2. Check if sidebar appears
3. Check if toggle button is visible
4. Test sidebar toggle functionality

### 3. Test Popup
1. Click extension icon in toolbar
2. Verify popup opens
3. Check for any errors in popup

## Prevention

### 1. Always Build Before Testing
```bash
npm run build
```

### 2. Check for Build Errors
Ensure webpack build completes without errors

### 3. Validate Manifest
Verify manifest.json is valid JSON and contains all required fields

### 4. Test in Incognito Mode
Sometimes extensions behave differently in incognito mode

## Getting Help

If the issue persists:
1. Check the browser console for specific error messages
2. Look at the extension's error logs in `chrome://extensions/`
3. Verify all files are properly built and present
4. Try loading the extension in a fresh Chrome profile

## Files Created for Debugging

- `test-extension.html` - Test page for extension functionality
- `debug-extension.js` - Debug script to run in browser console
- `TROUBLESHOOTING.md` - This troubleshooting guide 