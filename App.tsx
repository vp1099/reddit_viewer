import React, { useState, useEffect } from 'react';
import {
  fetchSubredditPosts,
  searchSubredditPosts,
  searchAllReddit,
  searchSubreddits,
} from './services/redditService';
import * as authService from './services/authService';

import type { RedditPost, RedditSort, Subreddit, RedditUserMeData } from './types';

import { PostCard } from './components/PostCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { WelcomeMessage } from './components/WelcomeMessage';
import { SortSelector, SortOption } from './components/SortSelector';
import { PerPageSelector } from './components/PerPageSelector';
import { PrimaryInput } from './components/PrimaryInput';
import { SearchInput } from './components/SearchInput';
import { SubredditSearchResults } from './components/SubredditSearchResults';
import { Trending } from './components/Trending';
import { UserProfile } from './components/UserProfile';

import { FireIcon, SparklesIcon, TrophyIcon, TrendingUpIcon, TagIcon, HomeIcon, LoginIcon, CloseIcon } from './components/IconComponents';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const sortOptions: SortOption[] = [
  { id: 'hot', label: 'Hot', icon: FireIcon },
  { id: 'new', label: 'New', icon: SparklesIcon },
  { id: 'top', label: 'Top', icon: TrophyIcon },
  { id: 'rising', label: 'Rising', icon: TrendingUpIcon },
];

const searchSortOptions: SortOption[] = [
    { id: 'relevance', label: 'Relevance', icon: TagIcon },
    ...sortOptions.filter(o => !['rising', 'hot'].includes(o.id)),
];

const perPageOptions = [10, 25, 50, 100];

const App: React.FC = () => {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [subreddit, setSubreddit] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [sort, setSort] = useState<RedditSort>('hot');
  const [count, setCount] = useState<number>(25);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGlobalSearch, setIsGlobalSearch] = useState<boolean>(false);

  const [subredditSearchResults, setSubredditSearchResults] = useState<Subreddit[] | null>(null);
  const [isSubredditSearchLoading, setIsSubredditSearchLoading] = useState<boolean>(false);
  const [subredditSearchError, setSubredditSearchError] = useState<string | null>(null);
  const [subredditSearchQuery, setSubredditSearchQuery] = useState<string>('');
  
  const [user, setUser] = useState<RedditUserMeData | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const debouncedSort = useDebounce(sort, 500);
  const debouncedCount = useDebounce(count, 500);

  useEffect(() => {
    const initAuth = async () => {
      setIsAuthLoading(true);
      try {
        authService.handleOAuthRedirect(); // Handles redirect from Reddit auth
        const token = authService.getAccessToken();
        if (token) {
          const userData = await authService.fetchMe();
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        authService.logout(false); // Clear invalid token
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  const resetPostsState = () => {
    setPosts([]);
    setAfter(null);
    setError(null);
    setExpandedPostId(null);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (isInitialLoad || (!subreddit && !(isGlobalSearch && searchQuery))) {
        return;
      }
      setIsLoading(true);
      resetPostsState();

      try {
        let result;
        const currentSort = (debouncedSort === 'rising' && searchQuery) ? 'relevance' : debouncedSort;
        if (searchQuery) {
          if (isGlobalSearch) {
            result = await searchAllReddit(searchQuery, currentSort, debouncedCount, null);
          } else {
            result = await searchSubredditPosts(subreddit, searchQuery, currentSort, debouncedCount, null);
          }
        } else {
          result = await fetchSubredditPosts(subreddit, currentSort, debouncedCount, null);
        }
        setPosts(result.posts);
        setAfter(result.after);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [subreddit, debouncedSort, debouncedCount, searchQuery, isGlobalSearch, isInitialLoad]);

  const handleLoadMore = async () => {
    if (isLoading || !after) return;
    setIsLoading(true);
    setError(null);
    try {
      let result;
      const currentSort = (sort === 'rising' && searchQuery) ? 'relevance' : sort;
      if (searchQuery) {
        if (isGlobalSearch) {
          result = await searchAllReddit(searchQuery, currentSort, count, after);
        } else {
          result = await searchSubredditPosts(subreddit, searchQuery, currentSort, count, after);
        }
      } else {
        result = await fetchSubredditPosts(subreddit, currentSort, count, after);
      }
      setPosts(prev => [...prev, ...result.posts]);
      setAfter(result.after);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubredditSubmit = (newSubreddit: string) => {
    if (isInitialLoad) setIsInitialLoad(false);
    setSubredditSearchQuery('');
    setSubredditSearchResults(null);
    setSearchQuery('');
    setIsGlobalSearch(false);
    setSort('hot');
    setSubreddit(newSubreddit);
  };

  const handleGlobalSearch = (query: string) => {
    if (isInitialLoad) setIsInitialLoad(false);
    setSubredditSearchQuery('');
    setSubredditSearchResults(null);
    setSubreddit('');
    setIsGlobalSearch(true);
    setSort('relevance');
    setSearchQuery(query);
  };

  const handleSubredditSearch = async (query: string) => {
    if (isInitialLoad) setIsInitialLoad(false);
    setSubredditSearchQuery(query);
    setSubredditSearchResults(null);
    setIsSubredditSearchLoading(true);
    setSubredditSearchError(null);
    resetPostsState();
    setSubreddit('');
    setIsGlobalSearch(false);
    setSearchQuery('');
    try {
      const results = await searchSubreddits(query);
      setSubredditSearchResults(results);
    } catch (err) {
      setSubredditSearchError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSubredditSearchLoading(false);
    }
  };

  const handleInSubredditSearch = (query: string) => {
    setSearchQuery(query);
    if (sort === 'rising') setSort('relevance');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (isGlobalSearch) {
      setIsGlobalSearch(false);
      setSubreddit('');
      resetPostsState();
    }
  };

  const handleToggleExpand = (postId: string) => {
    setExpandedPostId(current => (current === postId ? null : postId));
  };
  
  const handleCloseExpandedPost = () => {
    if (expandedPostId) {
      const postElement = document.getElementById(`post-${expandedPostId}`);
      // Scroll the card into view. This is helpful if the user has scrolled deep into comments.
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setExpandedPostId(null);
    }
  };

  const handleGoHome = () => {
    setIsInitialLoad(true);
    setSubreddit('');
    setSearchQuery('');
    setIsGlobalSearch(false);
    setSubredditSearchQuery('');
    setSubredditSearchResults(null);
    setSubredditSearchError(null);
    resetPostsState();
  };

  const renderAuthSection = () => {
    if (isAuthLoading) {
      return <div className="w-24 h-10 bg-gray-700 rounded-lg animate-pulse"></div>;
    }
    if (user) {
      return <UserProfile user={user} onLogout={() => authService.logout()} />;
    }
    return (
      <button
        onClick={() => authService.login()}
        className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300"
      >
        <LoginIcon className="w-5 h-5" />
        Login
      </button>
    );
  };

  const currentSortOptions = searchQuery ? searchSortOptions : sortOptions;
  const showPosts = posts.length > 0;
  const showWelcome = isInitialLoad && !isLoading && !error;
  const showSubredditResults = subredditSearchResults !== null || isSubredditSearchLoading || subredditSearchError;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleGoHome} 
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-full hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Go to homepage"
              title="Go to homepage"
            >
              <HomeIcon className="w-7 h-7"/>
            </button>
            <h1 className="text-xl sm:text-3xl font-bold text-orange-400">
              Reddit Viewer
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:block flex-grow max-w-2xl">
              <PrimaryInput 
                onSubmitSubreddit={handleSubredditSubmit}
                onSubmitGlobal={handleGlobalSearch}
                onSubmitSubredditSearch={handleSubredditSearch}
                isLoading={isLoading || isSubredditSearchLoading}
              />
            </div>
            {renderAuthSection()}
          </div>
        </div>
        <div className="lg:hidden max-w-2xl mx-auto pt-4">
          <PrimaryInput 
            onSubmitSubreddit={handleSubredditSubmit}
            onSubmitGlobal={handleGlobalSearch}
            onSubmitSubredditSearch={handleSubredditSearch}
            isLoading={isLoading || isSubredditSearchLoading}
          />
        </div>
      </header>
      <main className="container mx-auto p-4 space-y-6">
        {showWelcome && (
          <div className="space-y-8 mt-8">
            <WelcomeMessage />
            <Trending onSubredditSelect={handleSubredditSubmit} />
          </div>
        )}
        {showSubredditResults && (
          <SubredditSearchResults 
            isLoading={isSubredditSearchLoading}
            error={subredditSearchError}
            results={subredditSearchResults}
            query={subredditSearchQuery}
            onSubredditSelect={handleSubredditSubmit}
          />
        )}
        {(subreddit || isGlobalSearch) && !showSubredditResults && (
          <>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md">
              <div className="flex-grow w-full">
                <SearchInput 
                  onSearch={handleInSubredditSearch}
                  onClear={handleClearSearch}
                  isLoading={isLoading}
                  currentQuery={searchQuery}
                  currentSubreddit={isGlobalSearch ? 'All of Reddit' : subreddit}
                />
              </div>
              <div className="flex gap-4 items-center w-full md:w-auto flex-shrink-0">
                <SortSelector 
                  currentSort={sort} 
                  onSortChange={setSort}
                  isLoading={isLoading}
                  options={currentSortOptions}
                />
                <PerPageSelector 
                  currentCount={count}
                  onCountChange={setCount}
                  isLoading={isLoading}
                  options={perPageOptions}
                />
              </div>
            </div>
            {isLoading && posts.length === 0 && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {showPosts && (
              <div className="grid grid-cols-1 gap-6">
                {posts.map(post => (
                  <PostCard 
                    key={post.data.id} 
                    post={post}
                    isExpanded={expandedPostId === post.data.id}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </div>
            )}
            {!isLoading && !error && posts.length === 0 && !isInitialLoad && (
              <div className="text-center p-10 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400">No posts found. Try a different subreddit or search query.</p>
              </div>
            )}
            {after && !isLoading && (
              <div className="text-center mt-6">
                <button 
                  onClick={handleLoadMore} 
                  className="bg-orange-600 text-white font-bold py-3 px-8 rounded-md shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-wait"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Built for exploring Reddit's JSON API. Not affiliated with Reddit.</p>
      </footer>
       {expandedPostId && (
        <button
          onClick={handleCloseExpandedPost}
          aria-label="Close post"
          title="Close and scroll to top of post"
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 bg-gray-900/70 backdrop-blur-sm text-gray-300 rounded-full shadow-lg border-2 border-gray-700 hover:bg-orange-600 hover:text-white hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-gray-900 focus:ring-orange-500 transition-all duration-300 ease-in-out transform hover:scale-110"
        >
          <CloseIcon className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

export default App;