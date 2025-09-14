import type { RedditPost, RedditComment, RedditSort } from '../types';

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
    const response = await fetch(url, { cache: 'no-cache' });
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
    const response = await fetch(url, { cache: 'no-cache' });
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

export async function fetchPostComments(permalink: string): Promise<RedditComment[]> {
  const url = `${API_BASE_URL}${permalink.replace(/\/$/, "")}.json`;

  try {
    const response = await fetch(url, { cache: 'no-cache' });
    const data = await handleResponse<any[]>(response);
    
    if (!data || data.length < 2 || !data[1]?.data?.children) {
      return []; 
    }

    return (data[1].data.children as RedditComment[])
      .filter(comment => comment.kind === 't1')
      .sort((a, b) => b.data.score - a.data.score)
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
    const response = await fetch(url, { cache: 'no-cache' });
    return handleResponse<any>(response);
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
    const response = await fetch(url, { cache: 'no-cache' });
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