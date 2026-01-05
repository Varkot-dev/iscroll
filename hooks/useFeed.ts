/**
 * useFeed HOOK - Manages feed data and infinite scroll
 * 
 * This is a CUSTOM HOOK - reusable logic that components can use.
 * It handles:
 * - Fetching articles from Wikipedia
 * - Loading more when scrolling to bottom
 * - Refresh (pull-to-refresh)
 * - Loading and error states
 * 
 * HOOKS USED:
 * - useState: Stores data that can change
 * - useEffect: Runs code when component mounts or data changes
 * - useCallback: Memoizes functions for performance
 * 
 * USAGE:
 * const { articles, loading, refresh, loadMore } = useFeed();
 */

import { useState, useEffect, useCallback } from 'react';
import { getRandomArticles } from '@/lib/wikipedia';
import { FeedItem } from '@/types';

// How many articles to load at once
const BATCH_SIZE = 10;

/**
 * Custom hook for managing the feed
 * 
 * Returns an object with:
 * - articles: Array of feed items
 * - loading: Boolean, true when fetching
 * - refreshing: Boolean, true when pull-to-refresh
 * - error: Error message if something went wrong
 * - refresh: Function to refresh the feed
 * - loadMore: Function to load more articles
 */
export function useFeed() {
  // ============================================
  // STATE
  // ============================================
  // useState creates a "state variable" that triggers re-renders when changed
  
  // The list of articles in the feed
  const [articles, setArticles] = useState<FeedItem[]>([]);
  
  // Are we currently loading?
  const [loading, setLoading] = useState(true);
  
  // Are we refreshing (pull-to-refresh)?
  const [refreshing, setRefreshing] = useState(false);
  
  // Error message (if any)
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FETCH INITIAL DATA
  // ============================================
  // useEffect runs code when component mounts (loads)
  // The empty array [] means "run once when component first renders"
  
  useEffect(() => {
    loadInitialArticles();
  }, []);

  /**
   * Load the initial batch of articles
   */
  async function loadInitialArticles() {
    setLoading(true);
    setError(null);
    
    try {
      const newArticles = await getRandomArticles(BATCH_SIZE);
      
      if (newArticles.length === 0) {
        setError('No articles found. Check your internet connection.');
      } else {
        setArticles(newArticles);
      }
    } catch (err) {
      setError('Failed to load articles. Please try again.');
      console.error('Feed error:', err);
    } finally {
      // 'finally' runs whether success or error
      setLoading(false);
    }
  }

  // ============================================
  // REFRESH (Pull-to-refresh)
  // ============================================
  // useCallback memoizes the function - it won't be recreated every render
  // This is important for performance with FlatList
  
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const newArticles = await getRandomArticles(BATCH_SIZE);
      // Replace all articles with fresh ones
      setArticles(newArticles);
    } catch (err) {
      setError('Failed to refresh. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ============================================
  // LOAD MORE (Infinite scroll)
  // ============================================
  // Called when user scrolls near the bottom
  
  const loadMore = useCallback(async () => {
    // Don't load more if we're already loading
    if (loading || refreshing) return;
    
    try {
      const moreArticles = await getRandomArticles(BATCH_SIZE);
      
      // Add new articles to the existing list
      // Spread operator (...) unpacks the arrays
      setArticles(prev => [...prev, ...moreArticles]);
    } catch (err) {
      console.error('Error loading more:', err);
      // Don't show error for load-more failures - just silently retry later
    }
  }, [loading, refreshing]);

  // ============================================
  // RETURN VALUES
  // ============================================
  // Return everything the component needs
  
  return {
    articles,
    loading,
    refreshing,
    error,
    refresh,
    loadMore,
  };
}
