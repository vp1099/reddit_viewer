import React, { useState, useEffect } from 'react';
import { fetchPopularSubreddits } from '../services/redditService';
import { FireIcon, TagIcon, CompassIcon } from './IconComponents';

interface TrendingProps {
  onSubredditSelect: (subreddit: string) => void;
}

const popularTopics = [
  { name: 'News', sub: 'news' },
  { name: 'Technology', sub: 'technology' },
  { name: 'Science', sub: 'science' },
  { name: 'Gaming', sub: 'gaming' },
  { name: 'Movies', sub: 'movies' },
  { name: 'Music', sub: 'Music' },
];

const exploreGenres = [
  { name: 'Funny', sub: 'funny' },
  { name: 'Aww', sub: 'aww' },
  { name: 'Ask', sub: 'AskReddit' },
  { name: 'Pics & Gifs', sub: 'pics' },
  { name: 'Interesting', sub: 'mildlyinteresting' },
  { name: 'DIY', sub: 'DIY' },
];

interface Category {
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  items: { name: string; sub: string }[] | string[];
  isDynamic?: boolean;
}

export const Trending: React.FC<TrendingProps> = ({ onSubredditSelect }) => {
  const [trendingSubs, setTrendingSubs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTrending = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const subs = await fetchPopularSubreddits();
        setTrendingSubs(subs);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Could not load trending subreddits.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    getTrending();
  }, []);

  const categories: Category[] = [
    { title: 'Trending Subreddits', icon: FireIcon, items: trendingSubs, isDynamic: true },
    { title: 'Popular Topics', icon: TagIcon, items: popularTopics },
    { title: 'Explore Genres', icon: CompassIcon, items: exploreGenres },
  ];

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-700 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );

  return (
    <div className="p-6 bg-gray-800/50 rounded-lg max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Trending & Discovery
      </h2>
      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat.title}>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-orange-400 mb-3">
              <cat.icon className="w-5 h-5" />
              {cat.title}
            </h3>
            {cat.isDynamic && isLoading && renderSkeleton()}
            {cat.isDynamic && error && <p className="text-sm text-red-400">{error}</p>}
            
            <div className="flex flex-wrap gap-3">
               {(cat.isDynamic ? trendingSubs : cat.items).map((item, index) => {
                 const name = typeof item === 'string' ? item : item.name;
                 const sub = typeof item === 'string' ? item : item.sub;
                 return (
                    <button
                        key={`${sub}-${index}`}
                        onClick={() => onSubredditSelect(sub)}
                        className="bg-gray-700 text-gray-200 font-medium py-2 px-4 rounded-lg hover:bg-orange-600 hover:text-white transition-all duration-200 shadow"
                    >
                        {name}
                    </button>
                 )
               })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
