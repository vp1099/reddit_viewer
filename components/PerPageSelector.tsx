import React from 'react';

interface PerPageSelectorProps {
  currentCount: number;
  onCountChange: (count: number) => void;
  isLoading: boolean;
  options: number[];
}

export const PerPageSelector: React.FC<PerPageSelectorProps> = ({ currentCount, onCountChange, isLoading, options }) => {
  return (
    <div className="flex items-center gap-2">
        <label htmlFor="per-page-select" className="text-sm font-medium text-gray-400">Posts:</label>
        <div className="relative">
            <select
                id="per-page-select"
                value={currentCount}
                onChange={(e) => onCountChange(Number(e.target.value))}
                disabled={isLoading}
                className="bg-gray-800 text-white font-semibold py-1.5 pl-3 pr-8 rounded-md shadow-inner appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    </div>
  );
};