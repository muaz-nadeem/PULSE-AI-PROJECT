// Content script - runs on all pages
// Handles blocking page injection and time tracking

(function () {
  'use strict';

  // Check if this is a blocked page redirect
  if (window.location.href.includes('blocked.html')) {
    // Already on blocking page, do nothing
    return;
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkBlocked') {
      // Background script will handle blocking via declarativeNetRequest
      sendResponse({ blocked: false });
    }
    return true;
  });
})();
