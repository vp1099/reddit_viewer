import React, { useState } from 'react';
import type { RedditPost, RedditComment } from '../types';
import { UpvoteIcon, CommentIcon, LinkIcon, PlaceholderIcon, ClockIcon, DownloadIcon } from './IconComponents';
import { fetchPostComments, fetchPostJson } from '../services/redditService';
import { CommentCard } from './Comment';
import { formatTimestamp } from '../utils/time';

interface PostCardProps {
  post: RedditPost;
  isExpanded: boolean;
  onToggleExpand: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isExpanded, onToggleExpand }) => {
  const { title, author, score, num_comments, permalink, thumbnail, created_utc, selftext, url, is_video } = post.data;

  const [comments, setComments] = useState<RedditComment[] | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const isValidThumbnail = thumbnail && thumbnail !== 'self' && thumbnail !== 'default' && thumbnail !== 'nsfw';

  const handleToggleExpand = async () => {
    // If we are about to expand the card, and we haven't fetched comments yet.
    if (!isExpanded && !comments && num_comments > 0) {
      setIsLoadingComments(true);
      setCommentsError(null);
      try {
        const fetchedComments = await fetchPostComments(permalink);
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
    }

    // Let the parent component handle the actual state change.
    onToggleExpand(post.data.id);
  };

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

    if (isImageUrl) {
      return (
        <div className="mt-4 flex justify-center bg-black/20 rounded-lg">
          <img src={url} alt={title} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
        </div>
      );
    }
    
    if (is_video) {
      return (
         <div className="mt-4 p-4 bg-gray-700 rounded-lg text-center">
            <p className="font-semibold text-gray-300">This post contains a video.</p>
            <a 
                href={`https://reddit.com${permalink}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline"
            >
                Watch video on Reddit
            </a>
         </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-orange-500/20">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {isValidThumbnail ? (
            <img src={thumbnail} alt="thumbnail" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
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
                <p>by {author}</p>
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
            {(selftext || is_video || (url && /\.(jpg|jpeg|png|gif)$/i.test(url))) && (
                <div className="border-t border-gray-700 pt-4">
                    {selftext && (
                        <div className="max-w-none text-gray-300 whitespace-pre-wrap mb-4">
                            <p>{selftext}</p>
                        </div>
                    )}
                    {renderMedia()}
                </div>
            )}
           
            {num_comments > 0 && (
                <div id={`comments-${post.data.id}`} className="pt-4 border-t border-gray-700">
                    <h4 className="text-base font-semibold text-gray-200 mb-3">Top Comments</h4>
                    {isLoadingComments && <p className="text-sm text-gray-400 text-center animate-pulse">Loading top comments...</p>}
                    {commentsError && <p className="text-sm text-red-400 text-center">{commentsError}</p>}
                    {comments && comments.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {comments.map((comment) => (
                        <CommentCard key={comment.data.id} comment={comment} />
                        ))}
                    </div>
                    )}
                    {comments && comments.length === 0 && !isLoadingComments && (
                    <p className="text-sm text-gray-400 text-center">No comments found or failed to load.</p>
                    )}
                </div>
            )}
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