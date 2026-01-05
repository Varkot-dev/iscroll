/**
 * useFeed HOOK - Episode-first feed
 *
 * Delivers a Twitter-like experience by streaming individual episodes
 * (chapters/articles) directly in the feed. Each feed item is ready to
 * read with one tap.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FeedItem, RabbitHole, Episode, LegacyFeedItem } from '@/types';

// ==================================================
// TYPES
// ==================================================

type FeedState = {
  items: FeedItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
};

// ==================================================
// CONSTANTS
// ==================================================

const BATCH_SIZE = 12;

// ==================================================
// MAIN HOOK
// ==================================================

export function useFeed() {
  const [state, setState] = useState<FeedState>({
    items: [],
    loading: true,
    refreshing: false,
    error: null,
    hasMore: true,
  });
  const [page, setPage] = useState(0);

  // ==================================================
  // INTERNAL FETCHERS
  // ==================================================

  const fetchBatch = useCallback(async (offset: number): Promise<FeedItem[]> => {
    const { data, error } = await supabase
      .from('episodes')
      .select(`
        id,
        rabbit_hole_id,
        episode_number,
        title,
        content,
        content_type,
        published_at,
        is_update,
        source_url,
        summary,
        rabbit_holes (
          id,
          title,
          hook_text,
          type,
          status,
          total_episodes,
          thumbnail_url,
          created_at,
          last_updated
        )
      `)
      .order('published_at', { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) throw error;
    const rows = data || [];

    // Fetch topics for all involved rabbit holes
    const rabbitHoleIds = Array.from(
      new Set(rows.map((row: EpisodeRow) => row.rabbit_hole_id))
    );
    const { data: topicRows } = await supabase
      .from('rabbit_hole_topics')
      .select('rabbit_hole_id, topic')
      .in('rabbit_hole_id', rabbitHoleIds);

    const topicMap = new Map<string, string[]>();
    (topicRows || []).forEach((t: { rabbit_hole_id: string; topic: string }) => {
      const existing = topicMap.get(t.rabbit_hole_id) || [];
      topicMap.set(t.rabbit_hole_id, [...existing, t.topic]);
    });

    return rows.map((row: EpisodeRow) => {
      const episode: Episode = {
        id: row.id,
        rabbitHoleId: row.rabbit_hole_id,
        episodeNumber: row.episode_number,
        title: row.title,
        content: row.content,
        contentType: row.content_type as Episode['contentType'],
        publishedAt: row.published_at,
        isUpdate: row.is_update,
        sourceUrl: row.source_url || undefined,
        summary: row.summary || undefined,
      };

      const rh = row.rabbit_holes;
      const rabbitHole: Pick<RabbitHole,
        'id' | 'title' | 'hookText' | 'topics' | 'type' | 'status'
      > = {
        id: rh.id,
        title: rh.title,
        hookText: rh.hook_text,
        type: rh.type,
        status: rh.status,
        topics: topicMap.get(rh.id) || [],
      };

      return {
        id: row.id,
        type: 'episode',
        episode,
        rabbitHole,
        reason: row.is_update ? 'Fresh' : undefined,
      } as FeedItem;
    });
  }, []);

  // ==================================================
  // LOAD INITIAL DATA
  // ==================================================

  const loadInitialFeed = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setPage(0);

    try {
      const items = await fetchBatch(0);
      setState({
        items,
        loading: false,
        refreshing: false,
        error: null,
        hasMore: items.length === BATCH_SIZE,
      });
    } catch (error) {
      console.error('Feed load error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load feed. Pull to refresh.',
      }));
    }
  }, [fetchBatch]);

  useEffect(() => {
    loadInitialFeed();
  }, [loadInitialFeed]);

  // ==================================================
  // REFRESH
  // ==================================================

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true, error: null }));
    setPage(0);

    try {
      const items = await fetchBatch(0);
      setState({
        items,
        loading: false,
        refreshing: false,
        error: null,
        hasMore: items.length === BATCH_SIZE,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        refreshing: false,
        error: 'Failed to refresh. Please try again.',
      }));
    }
  }, [fetchBatch]);

  // ==================================================
  // LOAD MORE
  // ==================================================

  const loadMore = useCallback(async () => {
    if (state.loading || state.refreshing || !state.hasMore) return;

    const nextPage = page + 1;
    const offset = nextPage * BATCH_SIZE;

    try {
      const moreItems = await fetchBatch(offset);
      setPage(nextPage);
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...moreItems],
        hasMore: moreItems.length === BATCH_SIZE,
      }));
    } catch (error) {
      console.error('Error loading more:', error);
    }
  }, [state.loading, state.refreshing, state.hasMore, page, fetchBatch]);

  // ==================================================
  // RETURN
  // ==================================================

  return {
    items: state.items,
    loading: state.loading,
    refreshing: state.refreshing,
    error: state.error,
    hasMore: state.hasMore,
    refresh,
    loadMore,
  };
}

// ==================================================
// HELPER TYPES
// ==================================================

type EpisodeRow = {
  id: string;
  rabbit_hole_id: string;
  episode_number: number;
  title: string;
  content: string;
  content_type: string;
  published_at: string;
  is_update: boolean;
  source_url: string | null;
  summary: string | null;
  rabbit_holes: {
    id: string;
    title: string;
    hook_text: string;
    type: RabbitHole['type'];
    status: RabbitHole['status'];
    total_episodes: number;
    thumbnail_url: string | null;
    created_at: string;
    last_updated: string;
  };
};

// ==================================================
// LEGACY HOOK (for backward compatibility)
// ==================================================

import { getRandomArticles } from '@/lib/wikipedia';

/**
 * Legacy useFeed hook that returns Wikipedia articles
 * @deprecated Use useFeed() instead
 */
export function useLegacyFeed() {
  const [articles, setArticles] = useState<LegacyFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialArticles();
  }, []);

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
      setLoading(false);
    }
  }

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const newArticles = await getRandomArticles(BATCH_SIZE);
      setArticles(newArticles);
    } catch (err) {
      setError('Failed to refresh. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || refreshing) return;
    
    try {
      const moreArticles = await getRandomArticles(BATCH_SIZE);
      setArticles(prev => [...prev, ...moreArticles]);
    } catch (err) {
      console.error('Error loading more:', err);
    }
  }, [loading, refreshing]);

  return {
    articles,
    loading,
    refreshing,
    error,
    refresh,
    loadMore,
  };
}
