import React, { useState, useEffect } from 'react';
import { SearchIcon, CloseIcon } from './IconComponents';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading: boolean;
  currentQuery: string;
  currentSubreddit: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, onClear, isLoading, currentQuery, currentSubreddit }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
      <div className="flex-grow flex items-center bg-gray-800 rounded-md shadow-inner focus-within:ring-2 focus-within:ring-orange-500 transition-all duration-300">
        <span className="pl-4 pr-2 text-gray-400">
            <SearchIcon className="w-5 h-5" />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={currentSubreddit ? `Search in r/${currentSubreddit}` : 'Search posts'}
          className="w-full bg-transparent py-2 pl-0 pr-4 text-white placeholder-gray-500 focus:outline-none"
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            Search
        </button>
        {currentQuery && (
            <button
            type="button"
            onClick={onClear}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gray-600 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                <CloseIcon className="w-5 h-5" />
                Clear
            </button>
        )}
      </div>
    </form>
  );
};