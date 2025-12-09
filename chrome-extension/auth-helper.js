// Auth helper script - injected into the PULSE AI app page
// This helps the extension get the authentication token automatically

(function () {
  'use strict';

  // Only run on PULSE AI pages
  const hostname = window.location.hostname;
  if (!hostname.includes('localhost') && !hostname.includes('pulse')) {
    return;
  }

  console.log('[PULSE Extension] Auth helper loaded on', window.location.pathname);

  // Check if we're on the get-token page
  const isGetTokenPage = window.location.pathname.includes('get-token');

  // Function to send token to background script
  function sendTokenToBackground(token) {
    try {
      chrome.runtime.sendMessage({ action: 'setAuthToken', token: token }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('[PULSE Extension] Error sending token:', chrome.runtime.lastError);
          notifyPage(false, chrome.runtime.lastError.message);
        } else if (response && response.success) {
          console.log('[PULSE Extension] Token successfully sent to extension!');
          notifyPage(true);
        } else {
          console.log('[PULSE Extension] Token send response:', response);
          notifyPage(false, 'Unknown error');
        }
      });
    } catch (e) {
      console.error('[PULSE Extension] Error:', e);
      notifyPage(false, e.message);
    }
  }

  // Notify the page about the result
  function notifyPage(success, error = null) {
    window.postMessage({
      source: 'pulse-extension-response',
      action: 'tokenSent',
      success: success,
      error: error
    }, window.location.origin);
  }

  // Listen for messages from the page
  window.addEventListener('message', (event) => {
    // Only accept messages from same origin
    if (event.origin !== window.location.origin) {
      return;
    }

    const data = event.data;
    if (!data || data.source !== 'pulse-app-auth') {
      return;
    }

    console.log('[PULSE Extension] Received message:', data.action);

    if (data.action === 'sendToken' && data.token) {
      sendTokenToBackground(data.token);
    } else if (data.action === 'getToken') {
      handleGetToken();
    }
  });

  // Handle get token request
  async function handleGetToken() {
    const token = findToken();
    if (token) {
      sendTokenToBackground(token);
    } else {
      notifyPage(false, 'No token found');
    }
  }

  // Find token from various sources
  function findToken() {
    // Method 1: Check localStorage for Supabase session
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes('supabase') || key.includes('auth')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          if (data?.access_token) {
            return data.access_token;
          }
          // Check nested structure
          if (data?.currentSession?.access_token) {
            return data.currentSession.access_token;
          }
        } catch (e) {
          // Not valid JSON, continue
        }
      }
    }
    return null;
  }

  // Auto-detect and send token if on get-token page or if user is logged in
  function autoDetectAndSendToken() {
    const token = findToken();
    if (token) {
      console.log('[PULSE Extension] Found token, sending to extension...');
      sendTokenToBackground(token);
    }
  }

  // Check for auth immediately if on get-token page
  if (isGetTokenPage) {
    // Wait a bit for the page to load and token to be available
    setTimeout(autoDetectAndSendToken, 1000);
  }

  // Watch for storage changes (login/logout)
  window.addEventListener('storage', (event) => {
    if (event.key && (event.key.includes('supabase') || event.key.includes('auth'))) {
      console.log('[PULSE Extension] Storage changed, checking for auth...');
      setTimeout(autoDetectAndSendToken, 500);
    }
  });

  // Also listen for custom auth events from the app
  window.addEventListener('pulse-auth-change', () => {
    console.log('[PULSE Extension] Auth change event received');
    setTimeout(autoDetectAndSendToken, 500);
  });

  // Notify page that extension is ready
  window.postMessage({
    source: 'pulse-extension-response',
    action: 'ready',
    extensionAvailable: true
  }, window.location.origin);

  console.log('[PULSE Extension] Auth helper ready');

})();
