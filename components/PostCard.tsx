import React, { useState, useEffect } from 'react';
import type { RedditPost, RedditComment, RedditCommentSort } from '../types';
import { UpvoteIcon, CommentIcon, LinkIcon, PlaceholderIcon, ClockIcon, DownloadIcon, TrophyIcon, SparklesIcon, UserIcon, CloseIcon } from './IconComponents';
import { fetchPostComments, fetchPostJson, fetchUserAbout } from '../services/redditService';
import { CommentCard } from './Comment';
import { formatTimestamp } from '../utils/time';

interface PostCardProps {
  post: RedditPost;
  isExpanded: boolean;
  onToggleExpand: (postId: string) => void;
}

interface CommentSortOption {
    id: RedditCommentSort;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const commentSortOptions: CommentSortOption[] = [
    { id: 'top', label: 'Top', icon: TrophyIcon },
    { id: 'new', label: 'New', icon: SparklesIcon },
    { id: 'old', label: 'Old', icon: ClockIcon },
];

export const PostCard: React.FC<PostCardProps> = ({ post, isExpanded, onToggleExpand }) => {
  const { title, author, score, num_comments, permalink, thumbnail, created_utc, selftext, url, is_video, media, subreddit, preview } = post.data;

  const [comments, setComments] = useState<RedditComment[] | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [commentSort, setCommentSort] = useState<RedditCommentSort>('top');
  const [authorProfileImg, setAuthorProfileImg] = useState<string | null>(null);
  const [isAuthorImgLoading, setIsAuthorImgLoading] = useState(true);

  useEffect(() => {
    const loadProfileImg = async () => {
      if (!author || author === '[deleted]') {
        setIsAuthorImgLoading(false);
        return;
      }
      setIsAuthorImgLoading(true);
      const userData = await fetchUserAbout(author);
      if (userData) {
        const imgUrl = userData.snoovatar_img || userData.icon_img;
        setAuthorProfileImg(imgUrl ? imgUrl.split('?')[0] : null);
      }
      setIsAuthorImgLoading(false);
    };
    loadProfileImg();
  }, [author]);

  const getThumbnailUrl = () => {
    if (preview?.images?.[0]?.source?.url) {
      return preview.images[0].source.url.replace(/&amp;/g, '&');
    }
    const isValidThumbnail = thumbnail && !['self', 'default', 'nsfw', ''].includes(thumbnail);
    if (isValidThumbnail) {
      return thumbnail;
    }
    return null;
  };

  const thumbnailUrl = getThumbnailUrl();

  const fetchComments = async (sortType: RedditCommentSort) => {
    if (isLoadingComments) return;
    setIsLoadingComments(true);
    setCommentsError(null);
    try {
      const fetchedComments = await fetchPostComments(permalink, sortType);
      setComments(fetchedComments);
    } catch (err) {
      if (err instanceof Error) {
        setCommentsError(err.message);
      } else {
        setCommentsError('An unknown error occurred while fetching comments.');
      }
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  const handleToggleExpand = () => {
    if (!isExpanded && !comments && num_comments > 0) {
      fetchComments(commentSort);
    }
    onToggleExpand(post.data.id);
  };
  
  const handleCommentSortChange = (newSort: RedditCommentSort) => {
      if (isLoadingComments || newSort === commentSort) return;
      setCommentSort(newSort);
      fetchComments(newSort);
  }

  const handleDownloadJson = async () => {
    setIsDownloading(true);
    try {
        const postJson = await fetchPostJson(permalink);
        const jsonString = JSON.stringify(postJson, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const downloadUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${post.data.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error("Failed to download post JSON", error);
        alert("Could not download post JSON. See console for details.");
    } finally {
        setIsDownloading(false);
    }
  };

  const renderMedia = () => {
    const isImageUrl = url && /\.(jpg|jpeg|png|gif)$/i.test(url);
    const videoUrl = media?.reddit_video?.fallback_url;

    if (isImageUrl) {
      return (
        <div className="mt-4 flex justify-center bg-black/20 rounded-lg">
          <img src={url} alt={title} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
        </div>
      );
    }
    
    if (is_video && videoUrl) {
      return (
         <div className="mt-4 flex justify-center bg-black/20 rounded-lg">
            <video
                src={videoUrl}
                controls
                muted
                playsInline
                loop
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
            >
                Sorry, your browser doesn't support embedded videos.
            </video>
         </div>
      );
    }
    
    return null;
  };
  
  const hasMediaContent = selftext || (is_video && media?.reddit_video?.fallback_url) || (url && /\.(jpg|jpeg|png|gif)$/i.test(url));


  return (
    <div id={`post-${post.data.id}`} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-orange-500/20">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="thumbnail" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
               <PlaceholderIcon className="w-8 h-8 text-gray-500"/>
            </div>
          )}
          <div className="flex-grow">
            <button
              onClick={handleToggleExpand}
              aria-expanded={isExpanded}
              className="font-bold text-lg text-gray-100 hover:text-orange-400 transition-colors duration-200 line-clamp-3 text-left w-full focus:outline-none"
            >
              {title}
            </button>
            <div className="text-xs text-gray-400 mt-2 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                    {author === '[deleted]' ? (
                        <span className="text-gray-500 flex items-center gap-1.5">
                            <UserIcon className="w-5 h-5"/>
                            by [deleted]
                        </span>
                    ) : (
                        <a
                            href={`https://reddit.com/user/${author}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-cyan-300 transition-colors group"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isAuthorImgLoading ? (
                                <div className="w-5 h-5 bg-gray-600 rounded-full animate-pulse"></div>
                            ) : authorProfileImg ? (
                                <img src={authorProfileImg} alt={`${author}'s profile`} className="w-5 h-5 rounded-full object-cover bg-gray-700" />
                            ) : (
                                <UserIcon className="w-5 h-5 text-gray-500" />
                            )}
                            <span className="group-hover:underline">by {author}</span>
                        </a>
                    )}
                    <span className="text-gray-600">•</span>
                    <a 
                        href={`https://reddit.com/r/${subreddit}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        r/{subreddit}
                    </a>
                </div>
                <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <time dateTime={new Date(created_utc * 1000).toISOString()}>
                        {formatTimestamp(created_utc)}
                    </time>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-5 pb-4 space-y-4">
            {hasMediaContent && (
                <div className="border-t border-gray-700 pt-4">
                    {selftext && (
                        <div className="max-w-none text-gray-300 whitespace-pre-wrap mb-4">
                            <p>{selftext}</p>
                        </div>
                    )}
                    {renderMedia()}
                </div>
            )}
           
            <div id={`comments-${post.data.id}`} className="pt-4 border-t border-gray-700">
                {num_comments > 0 && (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                            <h4 className="text-base font-semibold text-gray-200">Comments</h4>
                            <div className="flex items-center bg-gray-900/50 rounded-lg p-1 gap-1">
                                {commentSortOptions.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => handleCommentSortChange(id)}
                                        disabled={isLoadingComments}
                                        className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500 disabled:opacity-50 ${
                                            commentSort === id ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isLoadingComments && <p className="text-sm text-gray-400 text-center animate-pulse py-4">Loading comments...</p>}
                        {commentsError && <p className="text-sm text-red-400 text-center py-4">{commentsError}</p>}
                        
                        {comments && comments.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {comments.map((comment) => (
                            <CommentCard key={comment.data.id} comment={comment} />
                            ))}
                        </div>
                        )}
                        
                        {comments && comments.length === 0 && !isLoadingComments && (
                        <p className="text-sm text-gray-400 text-center py-4">No comments found.</p>
                        )}
                    </>
                )}
            </div>
        </div>
      )}
      
      <div className="bg-gray-700/50 px-5 py-3 flex justify-between items-center text-sm">
        <div className="flex items-center gap-4 text-gray-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <UpvoteIcon className="w-4 h-4 text-orange-500"/>
            {score.toLocaleString()}
          </span>
          <button 
            onClick={handleToggleExpand} 
            className="flex items-center gap-1.5 hover:text-white transition-colors duration-200"
            aria-expanded={isExpanded}
            >
            <CommentIcon className="w-4 h-4 text-blue-400"/>
            {num_comments.toLocaleString()}
          </button>
        </div>
        <div className="flex items-center gap-4">
            <button
                onClick={handleDownloadJson}
                disabled={isDownloading}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                title="Download Post JSON"
            >
                <DownloadIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'JSON'}</span>
            </button>
            <a 
                href={`https://reddit.com${permalink}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-200"
            >
                <LinkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">View on Reddit</span>
            </a>
        </div>
      </div>
    </div>
  );
};