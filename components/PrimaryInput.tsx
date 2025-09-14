import React, { useState } from 'react';
import { SearchIcon, CompassIcon } from './IconComponents';

interface PrimaryInputProps {
  onSubmitSubreddit: (subreddit: string) => void;
  onSubmitGlobal: (query: string) => void;
  onSubmitSubredditSearch: (query: string) => void;
  isLoading: boolean;
}

export const PrimaryInput: React.FC<PrimaryInputProps> = ({ onSubmitSubreddit, onSubmitGlobal, onSubmitSubredditSearch, isLoading }) => {
  const [inputValue, setInputValue] = useState<string>('reactjs');

  const handleSubredditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
        onSubmitSubreddit(inputValue.trim().replace(/^r\//, ''));
    }
  };

  const handleGlobalSubmit = () => {
    if (inputValue.trim()) {
        onSubmitGlobal(inputValue.trim());
    }
  };
  
  const handleSubredditSearch = () => {
    if (inputValue.trim()) {
        onSubmitSubredditSearch(inputValue.trim());
    }
  };

  return (
    <form onSubmit={handleSubredditSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
      <div className="flex-grow flex items-center bg-gray-800 rounded-md shadow-lg focus-within:ring-2 focus-within:ring-orange-500 transition-all duration-300">
        <span className="pl-4 pr-2 text-gray-400">r/</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="subreddit or search query..."
          className="w-full bg-transparent p-4 pl-0 text-white placeholder-gray-500 focus:outline-none"
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-3">
        <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex-1 sm:flex-initial bg-orange-600 text-white font-bold py-4 px-6 rounded-md shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Fetching...' : 'Get Posts'}
        </button>
        <button
            type="button"
            onClick={handleSubredditSearch}
            disabled={isLoading || !inputValue.trim()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-4 px-6 rounded-md shadow-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            <CompassIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Search Subs</span>
        </button>
        <button
            type="button"
            onClick={handleGlobalSubmit}
            disabled={isLoading || !inputValue.trim()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-4 px-6 rounded-md shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            <SearchIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Search All</span>
        </button>
      </div>
    </form>
  );
};
