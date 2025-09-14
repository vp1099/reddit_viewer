export interface RedditPostData {
  id: string;
  title: string;
  author: string;
  score: number;
  num_comments: number;
  permalink: string;
  url:string;
  thumbnail: string;
  preview?: {
    images: {
      source: {
        url: string;
        width: number;
        height: number;
      };
    }[];
  };
  created_utc: number;
  selftext: string;
  is_video: boolean;
  name: string; // The "fullname" of the post, e.g., t3_...
  subreddit: string;
  media: {
    reddit_video?: {
      fallback_url: string;
      height: number;
      width: number;
      dash_url: string;
      hls_url: string;
      is_gif: boolean;
    };
  } | null;
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
  replies: RedditCommentListing | '';
}

export interface RedditComment {
  kind: 't1';
  data: RedditCommentData;
}

export interface RedditCommentListing {
    kind: 'Listing';
    data: {
        children: RedditComment[];
    }
}

export type RedditSort = 'hot' | 'new' | 'top' | 'rising' | 'relevance';

export type RedditCommentSort = 'top' | 'new' | 'old';

export interface RedditUserAboutData {
  name: string;
  snoovatar_img?: string;
  icon_img?: string;
}

export interface RedditUserMeData {
  name: string;
  snoovatar_img?: string;
  icon_img?: string;
  total_karma: number;
  created_utc: number;
}


export interface SubredditData {
  id: string;
  display_name: string;
  subscribers: number;
  public_description: string;
  icon_img: string;
}

export interface Subreddit {
  kind: 't5';
  data: SubredditData;
}