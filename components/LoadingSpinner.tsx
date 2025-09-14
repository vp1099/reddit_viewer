
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-300">Fetching Posts...</p>
    </div>
  );
};
