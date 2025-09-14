import type { RedditPost, RedditComment, RedditSort, RedditCommentSort, RedditUserAboutData, Subreddit } from '../types';

const API_BASE_URL = 'https://www.reddit.com';


async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Resource not found. Please check the name and try again.`);
    }
    if (response.status === 403) {
      throw new Error(`Access is forbidden. It may be a private resource.`);
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


export async function fetchSubredditPosts(subreddit: string, sort: RedditSort, count: number, after: string | null = null): Promise<{ posts: RedditPost[], after: string | null }> {
  let url = `${API_BASE_URL}/r/${subreddit.trim()}/${sort}.json?limit=${count}`;
  if (after) {
      url += `&after=${after}`;
  }

  try {
    const response = await fetch(url, { credentials: 'omit' });
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
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Network request failed. This may be due to an ad-blocker, firewall, or network issue.');
    }
    throw error;
  }
}

export async function searchSubredditPosts(subreddit: string, query: string, sort: RedditSort, count: number, after: string | null = null): Promise<{ posts: RedditPost[], after: string | null }> {
  // 'rising' is not a valid sort option for search, fallback to 'relevance' (default)
  const validSort = sort === 'rising' ? 'relevance' : sort;
  let url = `${API_BASE_URL}/r/${subreddit.trim()}/search.json?q=${encodeURIComponent(query)}&sort=${validSort}&restrict_sr=1&limit=${count}`;
   if (after) {
      url += `&after=${after}`;
  }

  try {
    const response = await fetch(url, { credentials: 'omit' });
    const data = await handleResponse<any>(response);
    
    if (!data?.data?.children) {
      // It's possible to get a valid response with no results, which is not an error.
      return { posts: [], after: null };
    }
    return {
        posts: data.data.children as RedditPost[],
        after: data.data.after,
    };

  } catch (error) {
    console.error('Error searching subreddit posts:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Network request failed during search. This may be due to an ad-blocker, firewall, or network issue.');
    }
    throw error;
  }
}

export async function searchAllReddit(query: string, sort: RedditSort, count: number, after: string | null = null): Promise<{ posts: RedditPost[], after: string | null }> {
  const validSort = sort === 'rising' ? 'relevance' : sort;
  let url = `${API_BASE_URL}/search.json?q=${encodeURIComponent(query)}&sort=${validSort}&limit=${count}`;
  if (after) {
    url += `&after=${after}`;
  }
  
  try {
    const response = await fetch(url, { credentials: 'omit' });
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
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Network request failed during global search.');
    }
    throw error;
  }
}


export async function fetchPostComments(permalink: string, sort: RedditCommentSort = 'top'): Promise<RedditComment[]> {
  const url = `${API_BASE_URL}${permalink.replace(/\/$/, "")}.json?sort=${sort}`;

  try {
    const response = await fetch(url, { credentials: 'omit' });
    const data = await handleResponse<any[]>(response);
    
    if (!data || data.length < 2 || !data[1]?.data?.children) {
      return []; 
    }

    return (data[1].data.children as RedditComment[])
      .filter(comment => comment.kind === 't1')
      .slice(0, 10);

  } catch (error) {
    console.error('Error fetching post comments:', error);
     if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Network request failed while fetching comments.');
    }
    throw error;
  }
}

export async function fetchPostJson(permalink: string): Promise<any> {
  const url = `${API_BASE_URL}${permalink.replace(/\/$/, "")}.json`;

  try {
    const response = await fetch(url, { credentials: 'omit' });
    return handleResponse<any>(response);
    // FIX: Add curly braces to the catch block to correctly scope the error handling.
  } catch (error) {
    console.error('Error fetching post JSON:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Network request failed while fetching post JSON.');
    }
    throw error;
  }
}

export async function fetchPopularSubreddits(): Promise<string[]> {
  const url = `${API_BASE_URL}/r/popular.json?limit=50`;
  try {
    const response = await fetch(url, { credentials: 'omit' });
    const data = await handleResponse<{ data: { children: RedditPost[] } }>(response);
    
    if (!data?.data?.children) {
      return [];
    }

    const subredditNames = data.data.children.map(post => post.data.subreddit);
    // Use a Set to get unique subreddit names, then convert back to an array
    const uniqueSubreddits = [...new Set(subredditNames)];
    
    return uniqueSubreddits.slice(0, 12);

  } catch (error) {
     console.error('Error fetching popular subreddits:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Network request failed while fetching popular subreddits.');
    }
    throw error;
  }
}

const userCache = new Map<string, RedditUserAboutData | null>();
// A promise chain to serialize user requests and avoid rate-limiting.
let userRequestQueue: Promise<any> = Promise.resolve();
const USER_REQUEST_DELAY_MS = 300; // Delay between each user profile fetch.

/**
 * The internal fetch implementation for a single user.
 * It's called sequentially by the queue in `fetchUserAbout`.
 */
async function fetchUserAboutInternal(username: string): Promise<RedditUserAboutData | null> {
  const url = `${API_BASE_URL}/user/${username}/about.json`;

  try {
    const response = await fetch(url, { credentials: 'omit' });
    
    // If the user doesn't exist, is suspended, etc., response won't be OK.
    // We cache this 'null' result to avoid re-fetching.
    if (!response.ok) {
      userCache.set(username, null);
      return null;
    }

    const data = await handleResponse<{ data: RedditUserAboutData }>(response);
    
    if (!data?.data) {
      userCache.set(username, null);
      return null;
    }

    // Cache the successful result.
    userCache.set(username, data.data);
    return data.data;

  } catch (error) {
    // This can happen due to network issues, CORS errors, or ad-blockers.
    // We intentionally do not log this error to the console to avoid spam,
    // as fetching user avatars is a non-critical feature. The UI will
    // gracefully degrade by showing a placeholder.
    return null;
  }
}

/**
 * Fetches a user's "about" data, including their profile image.
 * This function uses a queue to process requests sequentially with a delay,
 * preventing a flood of simultaneous requests that could trigger API rate limits.
 */
export async function fetchUserAbout(username: string): Promise<RedditUserAboutData | null> {
  if (!username || username === '[deleted]') {
    return null;
  }
  
  // Return from cache immediately if available.
  if (userCache.has(username)) {
    return userCache.get(username)!;
  }

  // Chain the new request onto the queue. It will execute after the previous one completes.
  const resultPromise = userRequestQueue.then(() => fetchUserAboutInternal(username));
  
  // The *next* request will have to wait for this one to finish, plus an additional delay.
  userRequestQueue = resultPromise.then(() => new Promise(resolve => setTimeout(resolve, USER_REQUEST_DELAY_MS)));

  return resultPromise;
}

export async function searchSubreddits(query: string): Promise<Subreddit[]> {
  const url = `${API_BASE_URL}/search.json?q=${encodeURIComponent(query)}&type=sr`;
  try {
    const response = await fetch(url, { credentials: 'omit' });
    const data = await handleResponse<{ data: { children: Subreddit[] } }>(response);

    if (!data?.data?.children) {
      return [];
    }
    return data.data.children;
  } catch (error) {
    console.error('Error searching subreddits:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Network request failed while searching for subreddits.');
    }
    throw error;
  }
}

// FIX: Add missing postComment function which is imported in AddCommentForm.tsx.
interface PostCommentArgs {
  accessToken: string;
  parentId: string;
  text: string;
}

export async function postComment({ accessToken, parentId, text }: PostCommentArgs): Promise<any> {
  const OAUTH_API_BASE_URL = 'https://oauth.reddit.com';
  const url = `${OAUTH_API_BASE_URL}/api/comment`;

  const formData = new URLSearchParams();
  formData.append('api_type', 'json');
  formData.append('text', text);
  formData.append('thing_id', parentId);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.json();
        } catch (e) {
          errorBody = await response.text();
        }
        console.error("API Error Response on postComment:", errorBody);
        throw new Error(`Failed to post comment. Status: ${response.status}`);
    }
    
    return response.json();

  } catch (error) {
    console.error('Error posting comment:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Network request failed while posting comment.');
    }
    throw error;
  }
}