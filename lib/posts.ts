/**
 * POSTS DATABASE OPERATIONS
 * 
 * Simple CRUD for posts - no episodes, no rabbit holes
 * Just posts about different topics
 */

import { supabase } from './supabase';
import { Post, ANONYMOUS_USER_ID } from '@/types';

// ==================================================
// TYPES
// ==================================================

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

type TopicRow = {
  topic: string;
};

// ==================================================
// TRANSFORM FUNCTIONS
// ==================================================

function transformPost(row: PostRow, topics: string[] = []): Post {
  return {
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
}

// ==================================================
// GET POSTS
// ==================================================

/**
 * Get all posts with optional filters
 */
export async function getPosts(options: {
  topic?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ data: Post[]; error: string | null }> {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset !== undefined) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: rows, error } = await query;

    if (error) throw error;
    if (!rows) return { data: [], error: null };

    // Fetch topics for all posts
    const ids = rows.map((r: PostRow) => r.id);
    const { data: topicRows } = await supabase
      .from('post_topics')
      .select('post_id, topic')
      .in('post_id', ids);

    // Group topics by post
    const topicMap = new Map<string, string[]>();
    (topicRows || []).forEach((t: { post_id: string; topic: string }) => {
      const existing = topicMap.get(t.post_id) || [];
      topicMap.set(t.post_id, [...existing, t.topic]);
    });

    // Filter by topic if specified
    let filteredRows = rows;
    if (options.topic) {
      filteredRows = rows.filter((r: PostRow) => 
        topicMap.get(r.id)?.includes(options.topic!) || false
      );
    }

    const posts = filteredRows.map((row: PostRow) => 
      transformPost(row, topicMap.get(row.id) || [])
    );

    return { data: posts, error: null };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch posts' 
    };
  }
}

/**
 * Get a single post by ID
 */
export async function getPostById(id: string): Promise<{ data: Post | null; error: string | null }> {
  try {
    const { data: row, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!row) return { data: null, error: null };

    // Fetch topics
    const { data: topicRows } = await supabase
      .from('post_topics')
      .select('topic')
      .eq('post_id', id);

    const topics = (topicRows || []).map((t: TopicRow) => t.topic);
    
    return { data: transformPost(row, topics), error: null };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch post' 
    };
  }
}

// ==================================================
// CREATE POST
// ==================================================

/**
 * Create a new post with topics
 */
export async function createPost(post: {
  title: string;
  content: string;
  topics?: string[];
  thumbnailUrl?: string;
  sourceUrl?: string;
  summary?: string;
  wowFact?: string;
  relatedPostId?: string;
  relatedPostTitle?: string;
}): Promise<{ data: Post | null; error: string | null }> {
  try {
    // Insert post
    const { data: row, error } = await supabase
      .from('posts')
      .insert({
        title: post.title,
        content: post.content,
        thumbnail_url: post.thumbnailUrl || null,
        source_url: post.sourceUrl || null,
        summary: post.summary || null,
        wow_fact: post.wowFact || null,
        related_post_id: post.relatedPostId || null,
        related_post_title: post.relatedPostTitle || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!row) throw new Error('No row returned from insert');

    // Insert topics if provided
    if (post.topics && post.topics.length > 0) {
      const topicInserts = post.topics.map(topic => ({
        post_id: row.id,
        topic,
      }));

      const { error: topicError } = await supabase
        .from('post_topics')
        .insert(topicInserts);

      if (topicError) {
        console.warn('Error inserting topics:', topicError);
      }
    }

    return { 
      data: transformPost(row, post.topics || []), 
      error: null 
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create post' 
    };
  }
}

// ==================================================
// GET POSTS BY TOPIC
// ==================================================

/**
 * Get posts for a specific topic, cursor-paginated.
 * Used by adaptive depth — when a user shows strong interest in a topic,
 * the feed can pull more cards from that topic specifically.
 */
export async function getPostsByTopic(
  topic: string,
  options: { limit?: number; afterCursor?: { publishedAt: string; id: string } } = {}
): Promise<{ data: Post[]; error: string | null }> {
  try {
    // First get post IDs for this topic
    const { data: topicRows, error: topicError } = await supabase
      .from('post_topics')
      .select('post_id')
      .eq('topic', topic);

    if (topicError) throw topicError;
    if (!topicRows || topicRows.length === 0) return { data: [], error: null };

    const postIds = topicRows.map((r: { post_id: string }) => r.post_id);

    let query = supabase
      .from('posts')
      .select('*')
      .in('id', postIds)
      .order('published_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(options.limit || 15);

    if (options.afterCursor) {
      query = query.or(
        `published_at.lt.${options.afterCursor.publishedAt},and(published_at.eq.${options.afterCursor.publishedAt},id.lt.${options.afterCursor.id})`
      );
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const ids = (rows || []).map((r: PostRow) => r.id);
    const { data: allTopicRows } = await supabase
      .from('post_topics')
      .select('post_id, topic')
      .in('post_id', ids);

    const topicMap = new Map<string, string[]>();
    (allTopicRows || []).forEach((t: { post_id: string; topic: string }) => {
      const existing = topicMap.get(t.post_id) || [];
      topicMap.set(t.post_id, [...existing, t.topic]);
    });

    const posts = (rows || []).map((row: PostRow) =>
      transformPost(row, topicMap.get(row.id) || [])
    );

    return { data: posts, error: null };
  } catch (error) {
    console.error('Error fetching posts by topic:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch posts by topic',
    };
  }
}

// ==================================================
// SAVED POSTS
// ==================================================

/**
 * Save a post for a user
 */
export async function savePost(
  postId: string,
  userId: string = ANONYMOUS_USER_ID
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('saved_posts')
      .insert({
        user_id: userId,
        post_id: postId,
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving post:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save post' 
    };
  }
}

/**
 * Unsave a post
 */
export async function unsavePost(
  postId: string,
  userId: string = ANONYMOUS_USER_ID
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error unsaving post:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to unsave post' 
    };
  }
}

/**
 * Get saved posts for a user
 */
export async function getSavedPosts(
  userId: string = ANONYMOUS_USER_ID
): Promise<{ data: Post[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`
        post_id,
        posts (*)
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) throw error;

    type SavedPostRow = { post_id: string; posts: PostRow | null };
    const posts: Post[] = [];
    for (const item of (data || []) as unknown as SavedPostRow[]) {
      const postRow = item.posts;
      if (postRow) {
        // Fetch topics
        const { data: topicRows } = await supabase
          .from('post_topics')
          .select('topic')
          .eq('post_id', postRow.id);
        
        const topics = (topicRows || []).map((t: TopicRow) => t.topic);
        posts.push(transformPost(postRow, topics));
      }
    }

    return { data: posts, error: null };
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch saved posts' 
    };
  }
}
