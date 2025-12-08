// PULSE AI Chrome Extension - Background Service Worker
// Handles tab tracking, website blocking, and distraction logging

// Get API URL from storage or use default
let API_BASE_URL = 'http://localhost:3000';

// Tab tracking state (will be restored from storage)
let tabData = new Map(); // tabId -> { url, domain, title, startTime, totalTime, lastActive }
let activeTabId = null;

// Blocking state
let blockingSettings = null;
let currentSchedule = null;
let isScheduledTime = false;
let blockedDomains = [];
let authToken = null;

// Temporary override list for relaxed mode
let overriddenDomains = new Set();

// ============================================
// INITIALIZATION
// ============================================

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('PULSE AI Extension installed');
  initialize();
});

// Initialize on startup (browser restart)
chrome.runtime.onStartup.addListener(() => {
  console.log('PULSE AI Extension started');
  initialize();
});

// Main initialization function
async function initialize() {
  await loadApiUrl();
  await restoreTabData();
  await loadSettings();
  startTabTracking();
  setupAlarms();
}

// Load API URL from storage
async function loadApiUrl() {
  try {
    const stored = await chrome.storage.local.get(['apiUrl']);
    if (stored.apiUrl) {
      API_BASE_URL = stored.apiUrl;
    }
  } catch (error) {
    console.error('Error loading API URL:', error);
  }
}

// Restore tab data from storage
async function restoreTabData() {
  try {
    const stored = await chrome.storage.local.get(['tabDataCache']);
    if (stored.tabDataCache && Array.isArray(stored.tabDataCache)) {
      stored.tabDataCache.forEach(([key, value]) => {
        tabData.set(key, value);
      });
      console.log('Restored tab data:', tabData.size, 'entries');
    }
  } catch (error) {
    console.error('Error restoring tab data:', error);
  }
}

// Save tab data to storage
async function saveTabData() {
  try {
    const tabDataArray = Array.from(tabData.entries());
    await chrome.storage.local.set({ tabDataCache: tabDataArray });
  } catch (error) {
    console.error('Error saving tab data:', error);
  }
}

// Setup alarms for periodic tasks
function setupAlarms() {
  // Clear existing alarms
  chrome.alarms.clearAll();

  // Refresh settings every minute
  chrome.alarms.create('refreshSettings', { periodInMinutes: 1 });

  // Sync tab data every 5 minutes
  chrome.alarms.create('syncTabData', { periodInMinutes: 5 });

  // Save tab data to storage every minute
  chrome.alarms.create('saveTabData', { periodInMinutes: 1 });
}

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshSettings') {
    if (authToken) {
      fetchSettings();
    }
  } else if (alarm.name === 'syncTabData') {
    syncAllTabData();
  } else if (alarm.name === 'saveTabData') {
    saveTabData();
  }
});

// ============================================
// SETTINGS & AUTH
// ============================================

// Load settings from storage and API
async function loadSettings() {
  try {
    // Load auth token from storage
    const stored = await chrome.storage.local.get(['authToken', 'blockingSettings', 'currentSchedule', 'isScheduledTime']);
    authToken = stored.authToken;

    // Restore cached settings
    if (stored.blockingSettings) {
      blockingSettings = stored.blockingSettings;
      blockedDomains = extractDomainsFromApps(blockingSettings?.blockedApps || []);
    }
    if (stored.currentSchedule) {
      currentSchedule = stored.currentSchedule;
    }
    if (typeof stored.isScheduledTime === 'boolean') {
      isScheduledTime = stored.isScheduledTime;
    }

    if (authToken) {
      await fetchSettings();
      await setupBlockingRules();
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Fetch settings from API
async function fetchSettings() {
  if (!authToken) {
    // Try to get token from storage
    const stored = await chrome.storage.local.get(['authToken']);
    authToken = stored.authToken;
    if (!authToken) {
      console.log('No auth token available');
      return;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/extension/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      blockingSettings = data.blockingSettings;
      currentSchedule = data.currentSchedule;
      isScheduledTime = data.isScheduledTime;

      // Extract blocked domains from blocked apps
      blockedDomains = extractDomainsFromApps(blockingSettings?.blockedApps || []);

      // Store in local storage
      await chrome.storage.local.set({
        blockingSettings,
        currentSchedule,
        isScheduledTime
      });

      await setupBlockingRules();
    } else if (response.status === 401) {
      // Token expired, clear auth
      await chrome.storage.local.remove('authToken');
      authToken = null;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
  }
}

// Extract domain names from app names
function extractDomainsFromApps(apps) {
  const domainMap = {
    'Instagram': ['instagram.com', 'www.instagram.com'],
    'Facebook': ['facebook.com', 'www.facebook.com', 'm.facebook.com'],
    'Twitter': ['twitter.com', 'www.twitter.com', 'mobile.twitter.com'],
    'X': ['x.com', 'www.x.com'],
    'TikTok': ['tiktok.com', 'www.tiktok.com'],
    'YouTube': ['youtube.com', 'www.youtube.com', 'm.youtube.com'],
    'Reddit': ['reddit.com', 'www.reddit.com', 'old.reddit.com'],
    'Snapchat': ['snapchat.com', 'www.snapchat.com'],
    'Pinterest': ['pinterest.com', 'www.pinterest.com'],
    'LinkedIn': ['linkedin.com', 'www.linkedin.com']
  };

  const domains = new Set();
  apps.forEach(app => {
    if (domainMap[app]) {
      domainMap[app].forEach(d => domains.add(d));
    } else {
      // Try to use app name as domain (lowercase, add .com)
      const baseDomain = app.toLowerCase().replace(/\s+/g, '') + '.com';
      domains.add(baseDomain);
      domains.add('www.' + baseDomain);
    }
  });

  return Array.from(domains);
}

// Check if a domain should be blocked
function isDomainBlocked(domain) {
  const normalizedDomain = domain.replace(/^www\./, '');
  return blockedDomains.some(blocked => {
    const normalizedBlocked = blocked.replace(/^www\./, '');
    return normalizedDomain === normalizedBlocked ||
      normalizedDomain.endsWith('.' + normalizedBlocked);
  });
}

// ============================================
// BLOCKING RULES
// ============================================

// Setup blocking rules using declarativeNetRequest
async function setupBlockingRules() {
  try {
    // Get existing rules
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = oldRules.map(r => r.id);

    if (!blockedDomains.length) {
      // Remove all rules if no blocked domains
      if (removeRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds
        });
      }
      return;
    }

    // Check if we should block (during scheduled time or based on mode)
    const shouldBlock = isScheduledTime || blockingSettings?.blockingMode === 'strict';

    if (!shouldBlock) {
      // Remove blocking rules if not in scheduled time and not strict mode
      if (removeRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds
        });
      }
      return;
    }

    // Get unique base domains (without www)
    const baseDomains = [...new Set(blockedDomains.map(d => d.replace(/^www\./, '')))];

    // Create blocking rules for each domain
    const rules = [];
    baseDomains.forEach((domain, index) => {
      // Skip if domain is temporarily overridden
      if (overriddenDomains.has(domain)) {
        return;
      }

      // Rule for the domain with and without www
      rules.push({
        id: (index * 2) + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: `/blocked.html?domain=${encodeURIComponent(domain)}&mode=${blockingSettings?.blockingMode || 'standard'}`
          }
        },
        condition: {
          urlFilter: `||${domain}`,
          resourceTypes: ['main_frame']
        }
      });
    });

    // Update rules
    if (rules.length > 0 || removeRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
        addRules: rules
      });
    }
  } catch (error) {
    console.error('Error setting up blocking rules:', error);
  }
}

// ============================================
// TAB TRACKING
// ============================================

// Start tab tracking
function startTabTracking() {
  // Track tab updates
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      updateTabData(tabId, tab);
    }
  });

  // Track active tab changes
  chrome.tabs.onActivated.addListener((activeInfo) => {
    if (activeTabId) {
      // Update time for previously active tab
      updateTabTime(activeTabId, false);
    }
    activeTabId = activeInfo.tabId;
    updateTabTime(activeTabId, true);
  });

  // Track tab removal
  chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === activeTabId) {
      activeTabId = null;
    }
    syncTabData(tabId);
    tabData.delete(tabId);
    saveTabData();
  });

  // Track window focus changes
  chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      // Browser lost focus, pause tracking
      if (activeTabId) {
        updateTabTime(activeTabId, false);
      }
    } else {
      // Browser regained focus
      chrome.tabs.query({ active: true, windowId }, (tabs) => {
        if (tabs[0]) {
          activeTabId = tabs[0].id;
          updateTabTime(activeTabId, true);
        }
      });
    }
  });
}

// Update tab data
function updateTabData(tabId, tab) {
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    return;
  }

  try {
    const url = new URL(tab.url);
    const domain = url.hostname.replace(/^www\./, '');

    const existing = tabData.get(tabId);
    const now = Date.now();

    if (existing && existing.domain === domain) {
      // Same domain, just update title
      existing.title = tab.title || domain;
      existing.url = tab.url;
    } else {
      // New domain or new tab
      if (existing) {
        // Sync old tab data before switching
        syncTabData(tabId);
      }

      tabData.set(tabId, {
        url: tab.url,
        domain: domain,
        title: tab.title || domain,
        startTime: now,
        totalTime: 0,
        lastActive: now
      });
    }

    // Save to storage periodically
    saveTabData();
  } catch (error) {
    console.error('Error updating tab data:', error);
  }
}

// Update time for active/inactive tabs
function updateTabTime(tabId, isActive) {
  const tab = tabData.get(tabId);
  if (!tab) return;

  const now = Date.now();

  if (isActive) {
    tab.lastActive = now;
  } else {
    // Tab became inactive, add time spent
    const timeSpent = now - tab.lastActive;
    tab.totalTime += timeSpent;
    tab.lastActive = now;
  }
}

// Sync single tab data to API
async function syncTabData(tabId) {
  const tab = tabData.get(tabId);
  if (!tab) return;

  // Get auth token
  if (!authToken) {
    const stored = await chrome.storage.local.get(['authToken']);
    authToken = stored.authToken;
    if (!authToken) return;
  }

  // Calculate final time
  const now = Date.now();
  const finalTime = tab.totalTime + (now - tab.lastActive);

  if (finalTime < 1000) return; // Skip if less than 1 second

  try {
    const response = await fetch(`${API_BASE_URL}/api/extension/tabs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain: tab.domain,
        url: tab.url,
        title: tab.title,
        timeSpent: Math.floor(finalTime / 1000) // Convert to seconds
      })
    });

    if (response.ok) {
      // Reset the time after successful sync
      tab.totalTime = 0;
      tab.lastActive = now;
    } else if (response.status === 401) {
      // Token expired
      await chrome.storage.local.remove('authToken');
      authToken = null;
    }
  } catch (error) {
    console.error('Error syncing tab data:', error);
  }
}

// Sync all tab data
async function syncAllTabData() {
  const tabs = Array.from(tabData.keys());
  for (const tabId of tabs) {
    await syncTabData(tabId);
  }
  await saveTabData();
}

// ============================================
// NAVIGATION & DISTRACTION LOGGING
// ============================================

// Handle navigation to blocked sites
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only main frame

  try {
    const url = new URL(details.url);
    const domain = url.hostname.replace(/^www\./, '');

    // Check if domain is blocked
    if (isDomainBlocked(domain) && isScheduledTime && authToken) {
      // Auto-log distraction
      await logDistraction(domain, details.url);
    }
  } catch (error) {
    console.error('Error handling navigation:', error);
  }
});

// Log distraction automatically
async function logDistraction(domain, url) {
  if (!authToken) {
    const stored = await chrome.storage.local.get(['authToken']);
    authToken = stored.authToken;
    if (!authToken) return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/extension/distraction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'website',
        source: domain,
        duration: 0, // Will be calculated when user leaves
        notes: 'Auto-logged during scheduled study time'
      })
    });

    if (response.status === 401) {
      // Token expired
      await chrome.storage.local.remove('authToken');
      authToken = null;
    }
  } catch (error) {
    console.error('Error logging distraction:', error);
  }
}

// ============================================
// MESSAGE HANDLERS
// ============================================

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender, sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(request, sender, sendResponse) {
  try {
    switch (request.action) {
      case 'getSettings':
        sendResponse({
          blockingSettings: blockingSettings || null,
          currentSchedule: currentSchedule || [],
          isScheduledTime: isScheduledTime || false,
          tabData: Array.from(tabData.values()),
          hasAuthToken: !!authToken,
          apiUrl: API_BASE_URL
        });
        break;

      case 'refreshSettings':
        await fetchSettings();
        sendResponse({
          success: true,
          blockingSettings,
          currentSchedule,
          isScheduledTime
        });
        break;

      case 'setAuthToken':
        authToken = request.token;
        await chrome.storage.local.set({ authToken });
        await fetchSettings();
        sendResponse({ success: true });
        break;

      case 'getAuthToken':
        try {
          const res = await fetch(`${API_BASE_URL}/api/extension/auth`, {
            credentials: 'include'
          });
          if (res.ok) {
            const data = await res.json();
            if (data.token) {
              authToken = data.token;
              await chrome.storage.local.set({ authToken });
              await fetchSettings();
              sendResponse({ success: true, token: data.token });
            } else {
              sendResponse({ success: false, error: 'No token available' });
            }
          } else {
            sendResponse({ success: false, error: 'Not authenticated' });
          }
        } catch (err) {
          console.error('Error getting auth token:', err);
          sendResponse({ success: false, error: err.message });
        }
        break;

      case 'overrideBlock':
        // Handle override for relaxed mode
        const domain = request.domain?.replace(/^www\./, '');
        if (domain && blockingSettings?.blockingMode === 'relaxed') {
          // Add to override list
          overriddenDomains.add(domain);

          // Rebuild rules without this domain
          await setupBlockingRules();

          // Remove override after 30 minutes
          setTimeout(async () => {
            overriddenDomains.delete(domain);
            await setupBlockingRules();
          }, 30 * 60 * 1000);

          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'Override not allowed' });
        }
        break;

      case 'setApiUrl':
        if (request.url) {
          API_BASE_URL = request.url;
          await chrome.storage.local.set({ apiUrl: request.url });
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'URL is required' });
        }
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Initialize immediately in case service worker wakes up mid-session
initialize();
