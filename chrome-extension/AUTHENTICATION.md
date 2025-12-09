# Extension Authentication Guide

The extension needs to be authenticated with your PULSE AI account to work properly.

## Quick Setup

1. **Make sure your PULSE AI app is running** at `http://localhost:3000`
2. **Log in to PULSE AI** in your browser
3. **Open the extension popup** (click the extension icon)
4. **Click "Sign In"** at the bottom
5. The extension will try to get your authentication token automatically

## Manual Authentication

If automatic authentication doesn't work:

1. **Log in to PULSE AI** in your browser
2. **Open browser DevTools** (F12)
3. **Go to Application/Storage tab**
4. **Find your Supabase session** in localStorage or cookies
5. **Copy the access token** from the session
6. **Open extension popup** and use browser console:
   ```javascript
   chrome.storage.local.set({ authToken: 'YOUR_TOKEN_HERE' });
   ```
7. **Click "Refresh Settings"** in the popup

## Troubleshooting

### "Not Connected" Status

This means the extension doesn't have a valid authentication token. To fix:

1. Make sure you're logged into PULSE AI
2. Click "Sign In" in the extension popup
3. If that doesn't work, try "Refresh Settings"
4. Check browser console for errors (F12 -> Extensions -> Service Worker)

### Token Expired

If your token expires:
1. Click "Sign In" again
2. Or log out and log back into PULSE AI, then click "Sign In" in extension

### API Connection Issues

If you see connection errors:
1. Make sure PULSE AI app is running on `http://localhost:3000`
2. Check that the API endpoints are accessible
3. Verify CORS settings allow extension requests

## How It Works

The extension uses your Supabase session token to authenticate API requests. The token is stored securely in Chrome's extension storage and is used to:
- Fetch blocking settings
- Get your daily schedule
- Log distractions
- Sync tab tracking data

The token is automatically refreshed when you log in to the PULSE AI app.

