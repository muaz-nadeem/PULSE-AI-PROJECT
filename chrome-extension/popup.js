// Popup script - handles UI interactions

let settings = null;
let tabData = [];
let apiUrl = 'http://localhost:3000';

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
  updateUI();
});

// Load data from background script
async function loadData() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (response) {
      settings = {
        blockingSettings: response.blockingSettings,
        currentSchedule: response.currentSchedule,
        isScheduledTime: response.isScheduledTime,
        hasAuthToken: response.hasAuthToken
      };
      tabData = response.tabData || [];
      apiUrl = response.apiUrl || 'http://localhost:3000';
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  const refreshBtn = document.getElementById('refreshBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const authLink = document.getElementById('authLink');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Refreshing...';

      try {
        await chrome.runtime.sendMessage({ action: 'refreshSettings' });
        await loadData();
        updateUI();
      } catch (error) {
        console.error('Error refreshing:', error);
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh Settings';
      }
    });
  }

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: apiUrl });
    });
  }

  if (authLink) {
    authLink.addEventListener('click', async (e) => {
      e.preventDefault();

      // First, try to get token from API endpoint
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getAuthToken' });
        if (response && response.success) {
          // Token obtained, refresh settings
          await chrome.runtime.sendMessage({ action: 'refreshSettings' });
          await loadData();
          updateUI();
          return;
        }
      } catch (error) {
        console.log('Could not get token from API:', error);
      }

      // Open the get-token page for easy token retrieval
      chrome.tabs.create({ url: `${apiUrl}/get-token` });
    });
  }
}

// Update UI with current data
function updateUI() {
  // Status indicator
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const blockingModeEl = document.getElementById('blockingMode');
  const scheduledTimeEl = document.getElementById('scheduledTime');
  const blockedCountEl = document.getElementById('blockedCount');
  const trackedTimeEl = document.getElementById('trackedTime');
  const topSiteEl = document.getElementById('topSite');
  const authLink = document.getElementById('authLink');

  // Check if we have auth token but no settings (might be loading or error)
  if (!settings || !settings.hasAuthToken) {
    if (statusText) statusText.textContent = 'Not Connected';
    if (statusIndicator) {
      const dot = statusIndicator.querySelector('.status-dot');
      if (dot) dot.className = 'status-dot inactive';
    }
    if (blockingModeEl) blockingModeEl.textContent = '-';
    if (scheduledTimeEl) scheduledTimeEl.textContent = '-';
    if (blockedCountEl) blockedCountEl.textContent = '0';
    if (trackedTimeEl) trackedTimeEl.textContent = '0h 0m';
    if (topSiteEl) topSiteEl.textContent = '-';
    if (authLink) authLink.textContent = 'Sign In';
    return;
  }

  // Update auth link text
  if (authLink) {
    authLink.textContent = settings.blockingSettings ? 'Refresh Token' : 'Sign In';
  }

  if (!settings.blockingSettings) {
    if (statusText) statusText.textContent = 'Loading...';
    if (statusIndicator) {
      const dot = statusIndicator.querySelector('.status-dot');
      if (dot) dot.className = 'status-dot inactive';
    }
    if (blockingModeEl) blockingModeEl.textContent = '-';
    if (scheduledTimeEl) scheduledTimeEl.textContent = '-';
    if (blockedCountEl) blockedCountEl.textContent = '0';
    return;
  }

  if (settings.isScheduledTime) {
    if (statusText) statusText.textContent = 'Blocking Active';
    if (statusIndicator) {
      const dot = statusIndicator.querySelector('.status-dot');
      if (dot) dot.className = 'status-dot active';
    }
  } else {
    if (statusText) statusText.textContent = 'Monitoring';
    if (statusIndicator) {
      const dot = statusIndicator.querySelector('.status-dot');
      if (dot) dot.className = 'status-dot monitoring';
    }
  }

  // Blocking mode
  const blockingMode = settings.blockingSettings?.blockingMode || 'standard';
  if (blockingModeEl) {
    blockingModeEl.textContent = blockingMode.charAt(0).toUpperCase() + blockingMode.slice(1);
  }

  // Scheduled time
  const schedule = settings.currentSchedule;
  if (scheduledTimeEl) {
    if (schedule && schedule.length > 0) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      // Find current or next scheduled block
      const currentBlock = schedule.find(item => {
        if (!item.time) return false;
        const [h, m] = item.time.split(':').map(Number);
        const start = h * 60 + m;
        const end = start + (item.duration || 0);
        return currentTime >= start && currentTime < end;
      });

      if (currentBlock) {
        const [h, m] = currentBlock.time.split(':').map(Number);
        const end = h * 60 + m + (currentBlock.duration || 0);
        const endH = Math.floor(end / 60);
        const endM = end % 60;
        scheduledTimeEl.textContent =
          `${currentBlock.time} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      } else {
        // Find next scheduled block
        const nextBlock = schedule.find(item => {
          if (!item.time) return false;
          const [h, m] = item.time.split(':').map(Number);
          const start = h * 60 + m;
          return currentTime < start;
        });

        if (nextBlock) {
          scheduledTimeEl.textContent = `Next: ${nextBlock.time}`;
        } else {
          scheduledTimeEl.textContent = 'None today';
        }
      }
    } else {
      scheduledTimeEl.textContent = 'No schedule';
    }
  }

  // Blocked sites count
  const blockedCount = settings.blockingSettings?.blockedApps?.length || 0;
  if (blockedCountEl) blockedCountEl.textContent = blockedCount;

  // Tracked time
  if (trackedTimeEl) {
    const totalTime = tabData.reduce((sum, tab) => sum + (tab.totalTime || 0), 0);
    const hours = Math.floor(totalTime / (1000 * 60 * 60));
    const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
    trackedTimeEl.textContent = `${hours}h ${minutes}m`;
  }

  // Top site
  if (topSiteEl) {
    if (tabData.length > 0) {
      const domainTime = {};
      tabData.forEach(tab => {
        if (!tab.domain) return;
        if (!domainTime[tab.domain]) {
          domainTime[tab.domain] = 0;
        }
        domainTime[tab.domain] += (tab.totalTime || 0);
      });

      const entries = Object.entries(domainTime);
      if (entries.length > 0) {
        const topDomain = entries.sort((a, b) => b[1] - a[1])[0];
        topSiteEl.textContent = topDomain[0];
      } else {
        topSiteEl.textContent = '-';
      }
    } else {
      topSiteEl.textContent = '-';
    }
  }
}
