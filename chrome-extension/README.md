# PULSE AI Chrome Extension

This Chrome extension integrates with the PULSE AI productivity app to track your browsing, block distracting websites, and automatically log distractions during scheduled study times.

## Features

- **Tab Tracking**: Automatically tracks all browser tabs and calculates time spent per domain
- **Smart Blocking**: Blocks distracting websites based on your blocking settings and daily schedule
- **Auto-Logging**: Automatically logs distractions when you access blocked sites during study times
- **Schedule Awareness**: Knows when you're in a scheduled study block and enforces blocking accordingly
- **Multiple Blocking Modes**: Supports strict, standard, and relaxed blocking modes

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder from this project
5. The extension will be installed and ready to use

## Setup

1. **Get Authentication Token**:
   - Open the PULSE AI app in your browser
   - Log in to your account
   - Open the extension popup
   - Click "Sign In" to authenticate

2. **Configure API URL** (if not using localhost:3000):
   - The extension defaults to `http://localhost:3000`
   - To change this, modify the `API_BASE_URL` in `background.js` or add it to storage

3. **Set Up Blocking**:
   - Go to Blocking Settings in the PULSE AI app
   - Add websites/apps you want to block
   - Choose your blocking mode (strict/standard/relaxed)
   - Create a daily schedule in the Day Planner

## How It Works

### Tab Tracking
- Tracks all open tabs automatically
- Calculates time spent on each domain
- Syncs data to the backend every 5 minutes or when tabs close
- Stores data locally for offline tracking

### Website Blocking
- Fetches blocking settings and schedule from the API
- Determines if current time is within a scheduled study block
- Blocks websites using Chrome's `declarativeNetRequest` API
- Shows a custom blocking page when you try to access blocked sites

### Distraction Logging
- Automatically detects when you navigate to a blocked site during study time
- Creates a distraction entry in your log
- Only logs during scheduled focus/study blocks

### Blocking Modes
- **Strict**: Complete block with no overrides
- **Standard**: Shows warning and blocks (default)
- **Relaxed**: 10-second delay wall before allowing access

## API Endpoints

The extension communicates with these Next.js API endpoints:

- `GET /api/extension/settings` - Get blocking settings and schedule
- `POST /api/extension/distraction` - Log a distraction
- `POST /api/extension/tabs` - Sync tab tracking data
- `GET /api/extension/auth` - Get authentication token

## Development

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (tab tracking, blocking)
├── content.js             # Content script
├── popup.html/js          # Extension popup UI
├── blocked.html/js        # Blocking page
└── styles/                # CSS files
```

### Testing
1. Load the extension in developer mode
2. Open the extension popup to see status
3. Try accessing a blocked website during scheduled time
4. Check the distraction log in the PULSE AI app
5. Verify tab tracking data is being synced

## Troubleshooting

**Extension not blocking sites:**
- Check that you're logged in (extension popup should show "Blocking Active")
- Verify you have a schedule set in Day Planner
- Ensure blocked apps are added in Blocking Settings
- Check browser console for errors

**Tab tracking not working:**
- Verify authentication token is set
- Check API URL is correct
- Look for errors in background script console (chrome://extensions -> service worker)

**Authentication issues:**
- Make sure you're logged into the PULSE AI app
- Try clicking "Sign In" in the extension popup
- Check that the API endpoint is accessible

## Permissions

The extension requires these permissions:
- `tabs` - To track open tabs
- `storage` - To store settings and tracking data
- `webNavigation` - To detect navigation events
- `declarativeNetRequest` - To block websites
- Host permissions - To communicate with the API

## Notes

- The extension works best when the PULSE AI app is running (for API access)
- Blocking only works during scheduled study times (unless mode is "strict")
- Tab tracking data is synced periodically and on tab close
- All data is stored locally first, then synced to the backend

