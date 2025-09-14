
import React from 'react';
import { SearchIcon } from './IconComponents';

export const WelcomeMessage: React.FC = () => {
  return (
    <div className="text-center p-10 bg-gray-800/50 rounded-lg max-w-2xl mx-auto">
      <SearchIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Ready to Explore Reddit?</h2>
      <p className="text-gray-400">
        Type a subreddit name in the search bar above and click "Get Posts" to begin. Try popular subreddits like `pics`, `gaming`, or `askreddit`.
      </p>
    </div>
  );
};
