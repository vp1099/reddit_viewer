import React, { useState, useCallback, useEffect } from 'react';
import { fetchSubredditPosts, searchSubredditPosts } from './services/redditService';
import type { RedditPost, RedditSort } from './types';
import { SubredditInput } from './components/SubredditInput';
import { PostCard } from './components/PostCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { Trending } from './components/Trending';
import { FireIcon, SparklesIcon, TrophyIcon, TrendingUpIcon } from './components/IconComponents';
import { SortSelector, SortOption } from './components/SortSelector';
import { SearchInput } from './components/SearchInput';
import { PerPageSelector } from './components/PerPageSelector';

const allSortOptions: SortOption[] = [
  { id: 'hot', label: 'Hot', icon: FireIcon },
  { id: 'new', label: 'New', icon: SparklesIcon },
  { id: 'top', label: 'Top', icon: TrophyIcon },
  { id: 'rising', label: 'Rising', icon: TrendingUpIcon },
];

const perPageOptions = [30, 60, 100];

const App: React.FC = () => {
  const [posts, setPosts] = useState<RedditPost[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSubreddit, setCurrentSubreddit] = useState<string>('');
  const [sort, setSort] = useState<RedditSort>('hot');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [count, setCount] = useState<number>(30);
  const [after, setAfter] = useState<string | null>(null);
  
  const executeFetch = useCallback(async (
      { subreddit, sortType, query, pageCount, isLoadMore }:
      { subreddit: string, sortType: RedditSort, query: string, pageCount: number, isLoadMore?: boolean }
  ) => {
    if (!subreddit) return;

    const afterToken = isLoadMore ? after : null;

    if (isLoadMore) {
        setIsLoadingMore(true);
    } else {
        setIsLoading(true);
        // Clear posts if the context is changing, not just for a sort/count refresh
        if (subreddit !== currentSubreddit || query !== searchQuery) {
             setPosts(null);
        }
    }
    setError(null);
    setExpandedPostId(null);

    setCurrentSubreddit(subreddit);
    setSort(sortType);
    setSearchQuery(query);

    try {
      let fetchedData: { posts: RedditPost[], after: string | null };
      if (query) {
        fetchedData = await searchSubredditPosts(subreddit, query, sortType, pageCount, afterToken);
      } else {
        fetchedData = await fetchSubredditPosts(subreddit, sortType, pageCount, afterToken);
      }
      
      if (fetchedData.posts.length === 0 && !isLoadMore) {
          if (query) {
             setError(`No results for "${query}" in r/${subreddit}.`);
          } else {
             setError(`No posts found for "r/${subreddit}". It might be a private or empty subreddit.`);
          }
      }

      setPosts(prevPosts => 
        isLoadMore && prevPosts ? [...prevPosts, ...fetchedData.posts] : fetchedData.posts
      );
      setAfter(fetchedData.after);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
       if (!isLoadMore) {
         setPosts(null);
      }
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [after, currentSubreddit, searchQuery]);

  const handleSubredditSubmit = (subreddit: string) => {
    const newQuery = '';
    const newSort = 'hot';
    executeFetch({ subreddit, sortType: newSort, query: newQuery, pageCount: count });
  };

  const handleSortChange = (newSort: RedditSort) => {
    if (!currentSubreddit || isLoading) return;
    executeFetch({ subreddit: currentSubreddit, sortType: newSort, query: searchQuery, pageCount: count });
  };
  
  const handleSearch = (query: string) => {
    if (!currentSubreddit || isLoading) return;
    executeFetch({ subreddit: currentSubreddit, sortType: sort, query, pageCount: count });
  };

  const handleClearSearch = () => {
    if (!currentSubreddit || isLoading) return;
    const newQuery = '';
    executeFetch({ subreddit: currentSubreddit, sortType: sort, query: newQuery, pageCount: count });
  };

  const handleToggleExpand = (postId: string) => {
    setExpandedPostId(currentId => (currentId === postId ? null : postId));
  };
  
  const handleCountChange = (newCount: number) => {
    if (isLoading) return;
    setCount(newCount);
    if(currentSubreddit) {
        executeFetch({ subreddit: currentSubreddit, sortType: sort, query: searchQuery, pageCount: newCount });
    }
  };

  const handleLoadMore = () => {
    if (!currentSubreddit || isLoading || isLoadingMore || !after) return;
    executeFetch({ subreddit: currentSubreddit, sortType: sort, query: searchQuery, pageCount: count, isLoadMore: true });
  }

  const activeSortOptions = searchQuery ? allSortOptions.filter(opt => opt.id !== 'rising') : allSortOptions;
  
  let resultTitle;
  if (posts) {
    if (searchQuery) {
      resultTitle = <>Showing results for <span className="text-white">"{searchQuery}"</span> in <span className="text-white">r/{currentSubreddit}</span></>;
    } else {
      resultTitle = <>Showing posts from <span className="text-white">r/{currentSubreddit}</span></>;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
       <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
              Reddit Viewer
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-gray-400 text-lg">
            Enter a subreddit name to fetch its posts via the public JSON API.
          </p>
        </div>

        <SubredditInput onSubmit={handleSubredditSubmit} isLoading={isLoading} />

        <div className="mt-10">
          {isLoading && !posts && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && posts === null && <Trending onSubredditSelect={handleSubredditSubmit} />}
          {posts && (
            <div>
              <div className="border-b-2 border-gray-700 pb-2 mb-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                   <h2 className="text-xl md:text-2xl font-bold text-orange-400">
                      {resultTitle}
                  </h2>
                   <div className="flex items-center gap-4 flex-shrink-0">
                      <PerPageSelector 
                        currentCount={count}
                        onCountChange={handleCountChange}
                        isLoading={isLoading}
                        options={perPageOptions}
                      />
                      <SortSelector
                          currentSort={sort}
                          onSortChange={handleSortChange}
                          isLoading={isLoading}
                          options={activeSortOptions}
                      />
                   </div>
                </div>
                <SearchInput
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  isLoading={isLoading}
                  currentQuery={searchQuery}
                  currentSubreddit={currentSubreddit}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard 
                    key={post.data.id} 
                    post={post}
                    isExpanded={expandedPostId === post.data.id}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </div>

               {posts.length > 0 && after && !isLoading && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="bg-orange-600 text-white font-bold py-3 px-8 rounded-md shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {isLoadingMore ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : 'Load More Posts'}
                        </button>
                    </div>
                )}
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Built with React, Tailwind CSS, and the Reddit JSON API.</p>
      </footer>
    </div>
  );
};

export default App;