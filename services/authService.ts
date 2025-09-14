import { CLIENT_ID, REDIRECT_URI, OAUTH_SCOPE, OAUTH_STATE } from '../config';
import type { RedditUserMeData } from '../types';

const TOKEN_KEY = 'reddit_access_token';
const EXPIRY_KEY = 'reddit_token_expiry';
const STATE_KEY = 'reddit_oauth_state';

// Helper to generate a random state string for CSRF protection
const generateState = () => {
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  localStorage.setItem(STATE_KEY, randomString);
  return randomString;
};

export const login = () => {
  const state = generateState();
  const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=token&state=${state}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(OAUTH_SCOPE)}`;
  window.location.href = authUrl;
};

export const logout = (reload = true) => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  localStorage.removeItem(STATE_KEY);
  if (reload) {
    window.location.reload();
  }
};

export const getAccessToken = (): string | null => {
  const expiryTime = localStorage.getItem(EXPIRY_KEY);
  if (!expiryTime || Date.now() > parseInt(expiryTime, 10)) {
    logout(false);
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

export const handleOAuthRedirect = () => {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');
  const state = params.get('state');
  const error = params.get('error');

  const storedState = localStorage.getItem(STATE_KEY);

  // Clear URL hash
  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

  if (error) {
    console.error(`OAuth Error: ${error}`);
    alert(`There was an error during authentication: ${error}`);
    return;
  }
  
  if (state !== storedState) {
    console.error('OAuth state mismatch. Possible CSRF attack.');
    alert('Authentication failed: state mismatch.');
    return;
  }
  
  if (accessToken && expiresIn) {
    const expiryTime = Date.now() + (parseInt(expiresIn, 10) * 1000);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
    localStorage.removeItem(STATE_KEY);
  }
};

export async function fetchMe(): Promise<RedditUserMeData> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Cannot fetch user profile.');
  }

  try {
    const response = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'web:com.example.reddit-json-viewer:v1.0.0',
      }
    });

    if (!response.ok) {
       // If token is invalid (e.g., revoked), log the user out
      if (response.status === 401 || response.status === 403) {
        logout(false);
      }
      throw new Error(`Failed to fetch user data. Status: ${response.status}`);
    }

    return await response.json() as RedditUserMeData;

  } catch(error) {
    console.error('Error in fetchMe:', error);
    throw error;
  }
}
