/**
 * usePostFeed - Simple Twitter-like feed hook
 *
 * Uses cursor-based pagination (published_at + id) to prevent
 * duplicates/skips when new content is inserted during a session.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FeedItem, Post } from '@/types';

type FeedState = {
  items: FeedItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
};

type Cursor = {
  publishedAt: string;
  id: string;
} | null;

const BATCH_SIZE = 15;

// Helper type for database rows
type PostRow = {
  id: string;
  title: string;
  content: string;
  published_at: string;
  thumbnail_url: string | null;
  source_url: string | null;
  summary: string | null;
  wow_fact: string | null;
  related_post_id: string | null;
  related_post_title: string | null;
  created_at: string;
  updated_at: string;
};

function rowToFeedItem(row: PostRow, topics: string[]): FeedItem {
  const post: Post = {
    id: row.id,
    title: row.title,
    content: row.content,
    topics,
    publishedAt: row.published_at,
    thumbnailUrl: row.thumbnail_url || undefined,
    sourceUrl: row.source_url || undefined,
    summary: row.summary || undefined,
    wowFact: row.wow_fact || undefined,
    relatedPostId: row.related_post_id || undefined,
    relatedPostTitle: row.related_post_title || undefined,
  };
  return { id: row.id, type: 'post', post } as FeedItem;
}

async function fetchTopicsForPosts(postIds: string[]): Promise<Map<string, string[]>> {
  if (postIds.length === 0) return new Map();
  const { data: topicRows } = await supabase
    .from('post_topics')
    .select('post_id, topic')
    .in('post_id', postIds);

  const topicMap = new Map<string, string[]>();
  (topicRows || []).forEach((t: { post_id: string; topic: string }) => {
    const existing = topicMap.get(t.post_id) || [];
    topicMap.set(t.post_id, [...existing, t.topic]);
  });
  return topicMap;
}

export function usePostFeed() {
  const [state, setState] = useState<FeedState>({
    items: [],
    loading: true,
    refreshing: false,
    error: null,
    hasMore: true,
  });
  const [cursor, setCursor] = useState<Cursor>(null);

  const fetchBatch = useCallback(async (afterCursor: Cursor): Promise<{ items: FeedItem[]; nextCursor: Cursor }> => {
    let query = supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(BATCH_SIZE);

    if (afterCursor) {
      // Fetch posts older than the cursor
      query = query.or(
        `published_at.lt.${afterCursor.publishedAt},and(published_at.eq.${afterCursor.publishedAt},id.lt.${afterCursor.id})`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows: PostRow[] = data || [];
    const topicMap = await fetchTopicsForPosts(rows.map(r => r.id));
    const items = rows.map(row => rowToFeedItem(row, topicMap.get(row.id) || []));

    const lastRow = rows[rows.length - 1];
    const nextCursor: Cursor = lastRow
      ? { publishedAt: lastRow.published_at, id: lastRow.id }
      : null;

    return { items, nextCursor };
  }, []);

  const loadInitialFeed = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { items, nextCursor } = await fetchBatch(null);
      setCursor(nextCursor);
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

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true, error: null }));

    try {
      const { items, nextCursor } = await fetchBatch(null);
      setCursor(nextCursor);
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

  const loadMore = useCallback(async () => {
    if (state.loading || state.refreshing || !state.hasMore || !cursor) return;

    try {
      const { items: moreItems, nextCursor } = await fetchBatch(cursor);
      setCursor(nextCursor);
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...moreItems],
        hasMore: moreItems.length === BATCH_SIZE,
      }));
    } catch (error) {
      console.error('Error loading more:', error);
    }
  }, [state.loading, state.refreshing, state.hasMore, cursor, fetchBatch]);

  const appendItemAt = useCallback((post: Post, afterIndex: number) => {
    const newItem: FeedItem = { id: post.id, type: 'post', post };
    setState(prev => {
      const updated = [...prev.items];
      updated.splice(afterIndex + 1, 0, newItem);
      return { ...prev, items: updated };
    });
  }, []);

  return {
    items: state.items,
    loading: state.loading,
    refreshing: state.refreshing,
    error: state.error,
    hasMore: state.hasMore,
    refresh,
    loadMore,
    appendItemAt,
  };
}
