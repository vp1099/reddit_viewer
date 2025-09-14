import React, { useState, useEffect } from 'react';
import type { RedditComment } from '../types';
import { UpvoteIcon, UserIcon } from './IconComponents';
import { timeAgo, formatTimestamp } from '../utils/time';
import { fetchUserAbout } from '../services/redditService';

interface CommentProps {
  comment: RedditComment;
}

export const CommentCard: React.FC<CommentProps> = ({ comment }) => {
  const { author, body, score, created_utc, replies } = comment.data;

  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfileImg = async () => {
      if (!author || author === '[deleted]') {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const userData = await fetchUserAbout(author);
      if (userData) {
        const imgUrl = userData.snoovatar_img || userData.icon_img;
        setProfileImg(imgUrl ? imgUrl.split('?')[0] : null);
      }
      setIsLoading(false);
    };
    loadProfileImg();
  }, [author]);


  const validReplies = replies && replies.data && replies.data.children 
    ? replies.data.children.filter(reply => reply.kind === 't1') 
    : [];

  return (
    <div className="py-2 border-t border-gray-700/50 first:border-t-0 first:pt-0">
      <div className="flex items-center text-xs text-gray-400 mb-1.5">
        {author === '[deleted]' ? (
            <span className="flex items-center gap-1.5 font-bold text-gray-500">
                <UserIcon className="w-4 h-4" />
                [deleted]
            </span>
        ) : (
            <a
                href={`https://reddit.com/user/${author}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-gray-300 hover:underline"
                onClick={(e) => e.stopPropagation()}
            >
                {isLoading ? (
                    <div className="w-4 h-4 bg-gray-600 rounded-full animate-pulse"></div>
                ) : profileImg ? (
                    <img src={profileImg} alt={`${author}'s profile`} className="w-4 h-4 rounded-full object-cover bg-gray-700" />
                ) : (
                    <UserIcon className="w-4 h-4" />
                )}
                {author}
            </a>
        )}
        <span className="mx-1.5">•</span>
        <time 
            dateTime={new Date(created_utc * 1000).toISOString()}
            title={formatTimestamp(created_utc)}
            className="cursor-help"
        >
            {timeAgo(created_utc)} ago
        </time>
      </div>
      <p className="text-sm text-gray-200 whitespace-pre-wrap">{body}</p>
      <div className="flex items-center mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1 font-semibold">
          <UpvoteIcon className="w-3 h-3 text-orange-500" />
          {score.toLocaleString()}
        </span>
      </div>
      
      {validReplies.length > 0 && (
        <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-700 space-y-2">
            {validReplies.map(reply => (
                <CommentCard key={reply.data.id} comment={reply} />
            ))}
        </div>
      )}
    </div>
  );
};
