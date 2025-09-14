import React from 'react';
import type { RedditSort } from '../types';

export interface SortOption {
  id: RedditSort;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface SortSelectorProps {
  currentSort: RedditSort;
  onSortChange: (sort: RedditSort) => void;
  isLoading: boolean;
  options: SortOption[];
}

export const SortSelector: React.FC<SortSelectorProps> = ({ currentSort, onSortChange, isLoading, options }) => {
  return (
    <div className="flex items-center bg-gray-800 rounded-lg p-1 gap-1 flex-shrink-0">
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSortChange(id)}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            currentSort === id
              ? 'bg-orange-600 text-white shadow'
              : 'text-gray-300 hover:bg-gray-700/50'
          }`}
          aria-pressed={currentSort === id}
        >
          <Icon className="w-5 h-5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};