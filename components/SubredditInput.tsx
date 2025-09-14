
import React, { useState } from 'react';

interface SubredditInputProps {
  onSubmit: (subreddit: string) => void;
  isLoading: boolean;
}

export const SubredditInput: React.FC<SubredditInputProps> = ({ onSubmit, isLoading }) => {
  const [subreddit, setSubreddit] = useState<string>('reactjs');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(subreddit);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
      <div className="flex-grow flex items-center bg-gray-800 rounded-md shadow-lg focus-within:ring-2 focus-within:ring-orange-500 transition-all duration-300">
        <span className="pl-4 pr-2 text-gray-400">r/</span>
        <input
          type="text"
          value={subreddit}
          onChange={(e) => setSubreddit(e.target.value)}
          placeholder="e.g., programming"
          className="w-full bg-transparent p-4 pl-0 text-white placeholder-gray-500 focus:outline-none"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="bg-orange-600 text-white font-bold py-4 px-8 rounded-md shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Fetching...' : 'Get Posts'}
      </button>
    </form>
  );
};
