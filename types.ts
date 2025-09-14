export interface RedditPostData {
  id: string;
  title: string;
  author: string;
  score: number;
  num_comments: number;
  permalink: string;
  url:string;
  thumbnail: string;
  created_utc: number;
  selftext: string;
  is_video: boolean;
  name: string; // The "fullname" of the post, e.g., t3_...
  // FIX: Add missing subreddit property required by fetchPopularSubreddits.
  subreddit: string;
}

export interface RedditPost {
  kind: string;
  data: RedditPostData;
}

export interface RedditCommentData {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
}

export interface RedditComment {
  kind: 't1';
  data: RedditCommentData;
}

export type RedditSort = 'hot' | 'new' | 'top' | 'rising';