
import React from 'react';
import type { RedditComment } from '../types';
import { UpvoteIcon } from './IconComponents';
import { timeAgo, formatTimestamp } from '../utils/time';

interface CommentProps {
  comment: RedditComment;
}

export const CommentCard: React.FC<CommentProps> = ({ comment }) => {
  const { author, body, score, created_utc } = comment.data;

  return (
    <div className="py-2 border-t border-gray-700/50 first:border-t-0 first:pt-0">
      <div className="flex items-center text-xs text-gray-400 mb-1.5">
        <span className="font-bold text-gray-300">{author}</span>
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
    </div>
  );
};