import React from 'react';
import type { Subreddit } from '../types';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';
import { HashIcon, UserIcon } from './IconComponents';
import { formatNumber } from '../utils/formatters';

interface SubredditSearchResultsProps {
  isLoading: boolean;
  error: string | null;
  results: Subreddit[] | null;
  query: string;
  onSubredditSelect: (subredditName: string) => void;
}

const SubredditResultCard: React.FC<{ result: Subreddit; onSelect: () => void }> = ({ result, onSelect }) => {
  const { display_name, icon_img, public_description, subscribers } = result.data;

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-start gap-4 p-4 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700/70 hover:ring-2 hover:ring-orange-500 transition-all duration-200 text-left"
    >
      {icon_img ? (
        <img src={icon_img} alt={`${display_name} icon`} className="w-12 h-12 rounded-full object-cover bg-gray-700 flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
          <HashIcon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <div className="flex-grow">
        <h3 className="font-bold text-lg text-cyan-400">r/{display_name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <UserIcon className="w-4 h-4" />
            <span>{formatNumber(subscribers)} subscribers</span>
        </div>
        <p className="text-sm text-gray-300 mt-2 line-clamp-2">{public_description}</p>
      </div>
    </button>
  );
};

export const SubredditSearchResults: React.FC<SubredditSearchResultsProps> = ({ isLoading, error, results, query, onSubredditSelect }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!results) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="border-b-2 border-gray-700 pb-2 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-orange-400">
          Subreddit results for <span className="text-white">"{query}"</span>
        </h2>
      </div>

      {results.length === 0 ? (
        <div className="text-center p-8 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400">No subreddits found matching your search.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {results.map((result) => (
            <SubredditResultCard 
              key={result.data.id} 
              result={result} 
              onSelect={() => onSubredditSelect(result.data.display_name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
