# Quick Authentication Guide

## Method 1: Using the Token Page (Easiest)

1. **Make sure you're logged into PULSE AI** at `http://localhost:3000`
2. **Visit** `http://localhost:3000/get-token` in your browser
3. **Copy the token** or the command shown on the page
4. **Open extension popup** and press F12 (DevTools)
5. **Paste and run** the command in the console
6. **Click "Refresh Settings"** in the extension popup

## Method 2: Using Browser Console

1. **Make sure you're logged into PULSE AI**
2. **Open browser console** (F12) on the PULSE AI page
3. **Run this command:**
   ```javascript
   // Import supabase (if available) or access localStorage
   const sessionKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
   if (sessionKey) {
     const session = JSON.parse(localStorage.getItem(sessionKey));
     console.log('Token:', session?.access_token);
   } else {
     // Try alternative method
     fetch('/api/extension/auth')
       .then(r => r.json())
       .then(d => console.log('Token:', d.token));
   }
   ```
4. **Copy the token** from the console
5. **Open extension popup**, press F12, and run:
   ```javascript
   chrome.storage.local.set({ authToken: 'PASTE_TOKEN_HERE' });
   ```
6. **Click "Refresh Settings"**

## Method 3: Automatic (If API Works)

1. **Make sure you're logged into PULSE AI**
2. **Click "Sign In"** in the extension popup
3. The extension will try to get the token automatically from `/api/extension/auth`

## Troubleshooting

- **Token is undefined**: Make sure you're logged in to PULSE AI first
- **API returns 401**: Your session might have expired, log out and log back in
- **Extension still shows "Not Connected"**: 
  1. Check that token was saved: `chrome.storage.local.get(['authToken'], console.log)`
  2. Click "Refresh Settings" after setting the token
  3. Check browser console for errors

