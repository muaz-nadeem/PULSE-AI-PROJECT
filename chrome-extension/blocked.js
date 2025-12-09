// Blocked page script

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const domain = urlParams.get('domain') || 'this site';
const mode = urlParams.get('mode') || 'standard';

// Get API URL from background script
let apiUrl = 'http://localhost:3000';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Get API URL
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (response && response.apiUrl) {
      apiUrl = response.apiUrl;
      updateAppLink();
    }
  } catch (error) {
    console.log('Could not get API URL:', error);
  }

  initializePage();
});

function updateAppLink() {
  const appLink = document.getElementById('openAppBtn');
  if (appLink) {
    appLink.href = apiUrl;
  }
}

function initializePage() {
  // Update UI
  const blockedDomainEl = document.getElementById('blockedDomain');
  const blockingModeEl = document.getElementById('blockingMode');
  const blockingMessageEl = document.getElementById('blockingMessage');
  const overrideBtn = document.getElementById('overrideBtn');
  const goBackBtn = document.getElementById('goBackBtn');

  if (blockedDomainEl) blockedDomainEl.textContent = domain;
  if (blockingModeEl) blockingModeEl.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);

  // Get blocking message based on mode
  let blockingMessage = '';
  if (mode === 'strict') {
    blockingMessage = 'This site is completely blocked during your scheduled study time.';
  } else if (mode === 'standard') {
    blockingMessage = 'This site is blocked during your scheduled study time.';
  } else if (mode === 'relaxed') {
    blockingMessage = 'This site is blocked, but you can override after a 10-second delay.';
    if (overrideBtn) overrideBtn.style.display = 'block';
  }

  if (blockingMessageEl) blockingMessageEl.textContent = blockingMessage;

  // Get time remaining from background script
  chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
    if (chrome.runtime.lastError) {
      console.log('Error getting settings:', chrome.runtime.lastError);
      return;
    }

    if (response && response.currentSchedule && Array.isArray(response.currentSchedule)) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const currentBlock = response.currentSchedule.find(item => {
        if (!item.time) return false;
        const [h, m] = item.time.split(':').map(Number);
        const start = h * 60 + m;
        const end = start + (item.duration || 0);
        return currentTime >= start && currentTime < end;
      });

      if (currentBlock) {
        const [h, m] = currentBlock.time.split(':').map(Number);
        const end = h * 60 + m + (currentBlock.duration || 0);
        const remaining = end - currentTime;
        const remainingH = Math.floor(remaining / 60);
        const remainingM = remaining % 60;

        const timeRemainingEl = document.getElementById('timeRemaining');
        const timeRemainingSectionEl = document.getElementById('timeRemainingSection');

        if (timeRemainingEl) timeRemainingEl.textContent = `${remainingH}h ${remainingM}m`;
        if (timeRemainingSectionEl) timeRemainingSectionEl.style.display = 'flex';
      }
    }
  });

  // Button handlers
  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    });
  }

  if (overrideBtn) {
    overrideBtn.addEventListener('click', handleOverride);
  }
}

function handleOverride() {
  if (mode !== 'relaxed') return;

  const btn = document.getElementById('overrideBtn');
  if (!btn) return;

  // Show countdown
  let countdown = 10;
  btn.disabled = true;
  btn.textContent = `Wait ${countdown}s...`;

  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      btn.textContent = `Wait ${countdown}s...`;
    } else {
      clearInterval(interval);
      btn.textContent = 'Access Site';
      btn.disabled = false;

      // Replace click handler
      btn.onclick = async () => {
        btn.disabled = true;
        btn.textContent = 'Redirecting...';

        try {
          // Allow access by removing blocking rule temporarily
          await chrome.runtime.sendMessage({ action: 'overrideBlock', domain });

          // Redirect to the original site
          window.location.href = `https://${domain}`;
        } catch (error) {
          console.error('Error overriding block:', error);
          btn.textContent = 'Error - Try Again';
          btn.disabled = false;
        }
      };
    }
  }, 1000);
}
