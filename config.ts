// IMPORTANT: You must register a new "installed app" or "script" on Reddit to get a Client ID.
// Go to: https://www.reddit.com/prefs/apps
// 1. Click "are you a developer? create an app..."
// 2. Name your app (e.g., "My Reddit Viewer")
// 3. Select "installed app" or "script".
// 4. Set the "redirect uri" to the URL where you are running this app (e.g., http://localhost:3000/ or your deployed app's URL).
// 5. Click "create app". Your client ID will be displayed under the app name.

export const CLIENT_ID = 'YOUR_REDDIT_CLIENT_ID'; // <-- REPLACE THIS

// This should match the "redirect uri" you set in your Reddit app settings.
export const REDIRECT_URI = window.location.origin + window.location.pathname;

// Scopes define what your app can do on behalf of the user.
export const OAUTH_SCOPE = 'identity read mysubreddits history';

// A unique string to identify the state of the OAuth flow.
export const OAUTH_STATE = 'reddit-json-viewer-auth-state';
