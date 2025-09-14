import type { RedditPost, RedditComment, RedditSort, RedditCommentSort, RedditUserAboutData, Subreddit } from '../types';
import { getAccessToken } from './authService';

const FAILED_TO_FETCH_MESSAGE = 'Network request failed. This is often caused by ad-blockers, browser privacy settings, or a network firewall. Please check your extensions and network connection, then try again.';


async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Resource not found. Please check the name and try again.`);
    }
    if (response.status === 403) {
      throw new Error(`Access Forbidden (403). The subreddit may be private, quarantined, or access may be restricted due to API rules. Please try again later.`);
    }
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(`Failed to fetch data. Status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function redditFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const baseUrl = token ? 'https://oauth.reddit.com' : 'https://www.reddit.com';
  const url = `${baseUrl}${endpoint}`;
  
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
        ...options.headers,
        'User-Agent': 'web:com.example.reddit-json-viewer:v1.0.0',
        ...authHeaders,
    },
    credentials: 'omit',
  };

  try {
    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error) {
    // This catches network-level errors (e.g., CORS, DNS, ad-blockers)
    console.error('Fetch API network error:', error);
    throw new Error(FAILED_TO_FETCH_MESSAGE);
  }
}


export async function fetchSubredditPosts(subreddit: string, sort: RedditSort, count: number, after: string | null): Promise<{ posts: RedditPost[], after: string | null }> {
  let endpoint = `/r/${subreddit.trim()}/${sort}.json?limit=${count}`;
  if (after) {
      endpoint += `&after=${after}`;
  }

  try {
    const response = await redditFetch(endpoint);
    const data = await handleResponse<any>(response);
    
    if (!data?.data?.children) {
      throw new Error('Invalid API response format.');
    }
    return {
        posts: data.data.children as RedditPost[],
        after: data.data.after,
    };

  } catch (error) {
    console.error('Error fetching subreddit posts:', error);
    throw error;
  }
}

export async function searchSubredditPosts(subreddit: string, query: string, sort: RedditSort, count: number, after: string | null): Promise<{ posts: RedditPost[], after: string | null }> {
  const validSort = sort === 'rising' ? 'relevance' : sort;
  let endpoint = `/r/${subreddit.trim()}/search.json?q=${encodeURIComponent(query)}&sort=${validSort}&restrict_sr=1&limit=${count}`;
   if (after) {
      endpoint += `&after=${after}`;
  }

  try {
    const response = await redditFetch(endpoint);
    const data = await handleResponse<any>(response);
    
    if (!data?.data?.children) {
      return { posts: [], after: null };
    }
    return {
        posts: data.data.children as RedditPost[],
        after: data.data.after,
    };

  } catch (error) {
    console.error('Error searching subreddit posts:', error);
    throw error;
  }
}

export async function searchAllReddit(query: string, sort: RedditSort, count: number, after: string | null): Promise<{ posts: RedditPost[], after: string | null }> {
  const validSort = sort === 'rising' ? 'relevance' : sort;
  let endpoint = `/search.json?q=${encodeURIComponent(query)}&sort=${validSort}&limit=${count}`;
  if (after) {
    endpoint += `&after=${after}`;
  }
  
  try {
    const response = await redditFetch(endpoint);
    const data = await handleResponse<any>(response);
    
    if (!data?.data?.children) {
      return { posts: [], after: null };
    }
    return {
        posts: data.data.children as RedditPost[],
        after: data.data.after,
    };
  } catch (error) {
    console.error('Error searching all of Reddit:', error);
    throw error;
  }
}


export async function fetchPostComments(permalink: string, sort: RedditCommentSort = 'top'): Promise<RedditComment[]> {
  const endpoint = `${permalink.replace(/\/$/, "")}.json?sort=${sort}`;

  try {
    const response = await redditFetch(endpoint);
    const data = await handleResponse<any[]>(response);
    
    if (!data || data.length < 2 || !data[1]?.data?.children) {
      return []; 
    }

    return (data[1].data.children as RedditComment[])
      .filter(comment => comment.kind === 't1')
      .slice(0, 10);

  } catch (error) {
    console.error('Error fetching post comments:', error);
    throw error;
  }
}

export async function fetchPostJson(permalink: string): Promise<any> {
  const endpoint = `${permalink.replace(/\/$/, "")}.json`;

  try {
    const response = await redditFetch(endpoint);
    return handleResponse<any>(response);
  } catch (error) {
    console.error('Error fetching post JSON:', error);
    throw error;
  }
}

export async function fetchPopularSubreddits(): Promise<string[]> {
  const endpoint = `/r/popular.json?limit=50`;
  try {
    const response = await redditFetch(endpoint);
    const data = await handleResponse<{ data: { children: RedditPost[] } }>(response);
    
    if (!data?.data?.children) {
      return [];
    }

    const subredditNames = data.data.children.map(post => post.data.subreddit);
    const uniqueSubreddits = [...new Set(subredditNames)];
    
    return uniqueSubreddits.slice(0, 12);

  } catch (error) {
     console.error('Error fetching popular subreddits:', error);
    throw error;
  }
}

const userCache = new Map<string, RedditUserAboutData | null>();
let userRequestQueue: Promise<any> = Promise.resolve();
const USER_REQUEST_DELAY_MS = 300; 

async function fetchUserAboutInternal(username: string): Promise<RedditUserAboutData | null> {
  const endpoint = `/user/${username}/about.json`;

  try {
    const response = await redditFetch(endpoint);
    
    if (!response.ok) {
      userCache.set(username, null);
      return null;
    }

    const data = await handleResponse<{ data: RedditUserAboutData }>(response);
    
    if (!data?.data) {
      userCache.set(username, null);
      return null;
    }

    userCache.set(username, data.data);
    return data.data;

  } catch (error) {
    return null;
  }
}

export function fetchUserAbout(username: string): Promise<RedditUserAboutData | null> {
  if (!username || username === '[deleted]') {
    return Promise.resolve(null);
  }
  
  if (userCache.has(username)) {
    return Promise.resolve(userCache.get(username)!);
  }

  const resultPromise = userRequestQueue.then(() => fetchUserAboutInternal(username));
  
  userRequestQueue = resultPromise.then(() => new Promise(resolve => setTimeout(resolve, USER_REQUEST_DELAY_MS)));

  return resultPromise;
}

export async function searchSubreddits(query: string): Promise<Subreddit[]> {
  const endpoint = `/search.json?q=${encodeURIComponent(query)}&type=sr`;
  try {
    const response = await redditFetch(endpoint);
    const data = await handleResponse<{ data: { children: Subreddit[] } }>(response);

    if (!data?.data?.children) {
      return [];
    }
    return data.data.children;
  } catch (error) {
    console.error('Error searching subreddits:', error);
    throw error;
  }
}