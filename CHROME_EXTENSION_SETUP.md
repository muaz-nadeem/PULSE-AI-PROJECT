# Chrome Extension Setup Guide

This guide will help you set up and use the PULSE AI Chrome extension.

## Prerequisites

1. Chrome browser (version 88+)
2. PULSE AI app running (locally at `http://localhost:3000` or deployed)
3. Supabase database with migrations applied

## Installation Steps

### 1. Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right corner)
3. Click "Load unpacked"
4. Navigate to your project directory and select the `chrome-extension` folder
5. The extension should now appear in your extensions list

### 2. Database Migration

Run the extension tracking migration in Supabase:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/002_extension_tracking.sql`
4. Run the migration
5. Verify the tables were created:
   - `tab_analytics`
   - `accepted_schedules`

### 3. Configure API URL (if needed)

If your PULSE AI app is not running on `http://localhost:3000`:

1. Open the extension popup
2. The extension will use the default URL, or you can modify `background.js` to set a custom URL
3. Alternatively, store the API URL in extension storage:
   ```javascript
   chrome.storage.local.set({ apiUrl: 'https://your-app-url.com' });
   ```

### 4. Authenticate the Extension

1. Open the PULSE AI app in your browser
2. Log in to your account
3. Open the extension popup (click the extension icon)
4. Click "Sign In" - this will open the PULSE AI app
5. The extension will automatically get your authentication token

**Note**: For automatic authentication, you may need to implement a token sharing mechanism between the app and extension (e.g., using localStorage or a shared storage solution).

### 5. Set Up Blocking

1. In the PULSE AI app, go to **Blocking Settings**
2. Add websites/apps you want to block (e.g., "Instagram", "Facebook", "YouTube")
3. Choose your blocking mode:
   - **Strict**: Always blocks, no overrides
   - **Standard**: Blocks during scheduled times (default)
   - **Relaxed**: 10-second delay before allowing access
4. Go to **Day Planner** and create/accept a schedule for today
5. The extension will automatically fetch these settings

## Usage

### Checking Status

Click the extension icon to see:
- Current blocking status
- Active blocking mode
- Scheduled study time
- Today's tracked time
- Top visited site

### During Study Time

When you're in a scheduled study block:
- Blocked websites will be automatically blocked
- You'll see a custom blocking page
- Distractions will be auto-logged
- Tab tracking continues normally

### Outside Study Time

- Blocking depends on your mode:
  - **Strict**: Still blocks
  - **Standard/Relaxed**: No blocking (unless you manually enable it)

## Troubleshooting

### Extension Not Working

1. **Check Authentication**:
   - Open extension popup
   - If it says "Not Connected", you need to authenticate
   - Make sure you're logged into the PULSE AI app

2. **Check API Connection**:
   - Open browser console (F12)
   - Go to Extensions -> Service Worker (for background script)
   - Look for errors related to API calls
   - Verify the API URL is correct

3. **Check Permissions**:
   - Go to `chrome://extensions/`
   - Find PULSE AI extension
   - Click "Details"
   - Verify all permissions are granted

### Blocking Not Working

1. **Verify Schedule**:
   - Make sure you have an accepted schedule for today
   - Check that current time is within a scheduled block
   - Extension popup should show "Blocking Active" during study time

2. **Check Blocked Apps**:
   - Go to Blocking Settings in PULSE AI app
   - Verify apps are added to the blocked list
   - Check that domain mapping is correct (e.g., "Instagram" -> "instagram.com")

3. **Check Blocking Rules**:
   - Open extension service worker console
   - Look for errors in `setupBlockingRules()`
   - Verify `declarativeNetRequest` API is available

### Tab Tracking Not Working

1. **Check Storage**:
   - Extension stores data in `chrome.storage.local`
   - Open DevTools -> Application -> Storage -> Extension Storage
   - Verify data is being stored

2. **Check API Sync**:
   - Look for network requests to `/api/extension/tabs`
   - Verify authentication token is valid
   - Check for errors in API responses

### Authentication Issues

If the extension can't authenticate:

1. **Manual Token Setup**:
   - Get your Supabase session token from the app
   - Store it in extension storage:
     ```javascript
     chrome.storage.local.set({ authToken: 'your-token-here' });
     ```

2. **Token Refresh**:
   - Tokens expire after a certain time
   - Extension should refresh automatically
   - If not, re-authenticate manually

## Development

### Testing Locally

1. Start your Next.js app: `npm run dev`
2. Load the extension in Chrome
3. Set API URL to `http://localhost:3000`
4. Test blocking, tracking, and logging

### Debugging

- **Background Script**: Go to `chrome://extensions/` -> Service Worker
- **Popup**: Right-click extension icon -> Inspect popup
- **Content Script**: Use regular DevTools on the page
- **Blocking Page**: Inspect the blocked.html page

### Common Issues

1. **CORS Errors**: Make sure API allows requests from extension origin
2. **Token Expiry**: Implement token refresh mechanism
3. **Rule Limits**: Chrome has limits on declarativeNetRequest rules (30,000)
4. **Storage Limits**: `chrome.storage.local` has a 10MB limit

## Security Notes

- Authentication tokens are stored in `chrome.storage.local` (encrypted by Chrome)
- API endpoints should validate tokens properly
- Blocking rules are applied at the browser level
- Tab tracking data is synced securely to your backend

## Next Steps

- Add more blocking features (time-based, category-based)
- Implement analytics dashboard for tab data
- Add notification system for blocking events
- Create mobile companion app

