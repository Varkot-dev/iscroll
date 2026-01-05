/**
 * RABBIT HOLES DATABASE OPERATIONS
 * 
 * CRUD operations for rabbit holes, episodes, and related data.
 * Uses Supabase for persistence.
 * 
 * KEY FUNCTIONS:
 * - getRabbitHoles: Fetch rabbit holes with optional filtering
 * - getEpisodes: Fetch episodes for a rabbit hole
 * - createRabbitHole: Create new rabbit hole with episodes
 * - markEpisodeRead: Track user progress
 */

import { supabase } from './supabase';
import { 
  RabbitHole, 
  Episode, 
  RabbitHoleType, 
  RabbitHoleStatus,
  ANONYMOUS_USER_ID 
} from '@/types';

// ==================================================
// TYPES FOR DATABASE ROWS
// ==================================================

type RabbitHoleRow = {
  id: string;
  title: string;
  description: string;
  hook_text: string;
  type: RabbitHoleType;
  status: RabbitHoleStatus;
  total_episodes: number;
  thumbnail_url: string | null;
  created_at: string;
  last_updated: string;
};

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
};

type TopicRow = {
  topic: string;
};

// ==================================================
// TRANSFORM FUNCTIONS
// ==================================================

function transformRabbitHole(row: RabbitHoleRow, topics: string[] = []): RabbitHole {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    hookText: row.hook_text,
    type: row.type,
    status: row.status,
    totalEpisodes: row.total_episodes,
    thumbnailUrl: row.thumbnail_url || undefined,
    topics,
    createdAt: row.created_at,
    lastUpdated: row.last_updated,
  };
}

function transformEpisode(row: EpisodeRow): Episode {
  return {
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
}

// ==================================================
// RABBIT HOLE OPERATIONS
// ==================================================

/**
 * Get all rabbit holes with optional filters
 */
export async function getRabbitHoles(options: {
  status?: RabbitHoleStatus;
  type?: RabbitHoleType;
  topic?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ data: RabbitHole[]; error: string | null }> {
  try {
    let query = supabase
      .from('rabbit_holes')
      .select('*')
      .order('last_updated', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.type) {
      query = query.eq('type', options.type);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: rows, error } = await query;

    if (error) throw error;
    if (!rows) return { data: [], error: null };

    // Fetch topics for all rabbit holes
    const ids = rows.map((r: RabbitHoleRow) => r.id);
    const { data: topicRows } = await supabase
      .from('rabbit_hole_topics')
      .select('rabbit_hole_id, topic')
      .in('rabbit_hole_id', ids);

    // Group topics by rabbit hole
    const topicMap = new Map<string, string[]>();
    (topicRows || []).forEach((t: { rabbit_hole_id: string; topic: string }) => {
      const existing = topicMap.get(t.rabbit_hole_id) || [];
      topicMap.set(t.rabbit_hole_id, [...existing, t.topic]);
    });

    // Filter by topic if specified
    let filteredRows = rows;
    if (options.topic) {
      filteredRows = rows.filter((r: RabbitHoleRow) => 
        topicMap.get(r.id)?.includes(options.topic!) || false
      );
    }

    const rabbitHoles = filteredRows.map((row: RabbitHoleRow) => 
      transformRabbitHole(row, topicMap.get(row.id) || [])
    );

    return { data: rabbitHoles, error: null };
  } catch (error) {
    console.error('Error fetching rabbit holes:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch rabbit holes' 
    };
  }
}

/**
 * Get a single rabbit hole by ID
 */
export async function getRabbitHoleById(id: string): Promise<{ data: RabbitHole | null; error: string | null }> {
  try {
    const { data: row, error } = await supabase
      .from('rabbit_holes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!row) return { data: null, error: null };

    // Fetch topics
    const { data: topicRows } = await supabase
      .from('rabbit_hole_topics')
      .select('topic')
      .eq('rabbit_hole_id', id);

    const topics = (topicRows || []).map((t: TopicRow) => t.topic);
    
    return { data: transformRabbitHole(row, topics), error: null };
  } catch (error) {
    console.error('Error fetching rabbit hole:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch rabbit hole' 
    };
  }
}

/**
 * Create a new rabbit hole with topics
 */
export async function createRabbitHole(rabbitHole: {
  title: string;
  description: string;
  hookText: string;
  type: RabbitHoleType;
  status?: RabbitHoleStatus;
  thumbnailUrl?: string;
  topics?: string[];
}): Promise<{ data: RabbitHole | null; error: string | null }> {
  try {
    // Insert rabbit hole
    const { data: row, error } = await supabase
      .from('rabbit_holes')
      .insert({
        title: rabbitHole.title,
        description: rabbitHole.description,
        hook_text: rabbitHole.hookText,
        type: rabbitHole.type,
        status: rabbitHole.status || 'active',
        thumbnail_url: rabbitHole.thumbnailUrl || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!row) throw new Error('No row returned from insert');

    // Insert topics if provided
    if (rabbitHole.topics && rabbitHole.topics.length > 0) {
      const topicInserts = rabbitHole.topics.map(topic => ({
        rabbit_hole_id: row.id,
        topic,
      }));

      const { error: topicError } = await supabase
        .from('rabbit_hole_topics')
        .insert(topicInserts);

      if (topicError) {
        console.warn('Error inserting topics:', topicError);
      }
    }

    return { 
      data: transformRabbitHole(row, rabbitHole.topics || []), 
      error: null 
    };
  } catch (error) {
    console.error('Error creating rabbit hole:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create rabbit hole' 
    };
  }
}

/**
 * Update a rabbit hole
 */
export async function updateRabbitHole(
  id: string, 
  updates: Partial<Pick<RabbitHole, 'title' | 'description' | 'hookText' | 'status' | 'thumbnailUrl'>>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const updateData: Record<string, unknown> = {
      last_updated: new Date().toISOString(),
    };

    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.hookText) updateData.hook_text = updates.hookText;
    if (updates.status) updateData.status = updates.status;
    if (updates.thumbnailUrl !== undefined) updateData.thumbnail_url = updates.thumbnailUrl;

    const { error } = await supabase
      .from('rabbit_holes')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating rabbit hole:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update rabbit hole' 
    };
  }
}

// ==================================================
// EPISODE OPERATIONS
// ==================================================

/**
 * Get all episodes for a rabbit hole
 */
export async function getEpisodes(rabbitHoleId: string): Promise<{ data: Episode[]; error: string | null }> {
  try {
    const { data: rows, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('rabbit_hole_id', rabbitHoleId)
      .order('episode_number', { ascending: true });

    if (error) throw error;

    const episodes = (rows || []).map(transformEpisode);
    return { data: episodes, error: null };
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch episodes' 
    };
  }
}

/**
 * Get a single episode by ID
 */
export async function getEpisodeById(id: string): Promise<{ data: Episode | null; error: string | null }> {
  try {
    const { data: row, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!row) return { data: null, error: null };

    return { data: transformEpisode(row), error: null };
  } catch (error) {
    console.error('Error fetching episode:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch episode' 
    };
  }
}

/**
 * Get episode by rabbit hole and episode number
 */
export async function getEpisodeByNumber(
  rabbitHoleId: string, 
  episodeNumber: number
): Promise<{ data: Episode | null; error: string | null }> {
  try {
    const { data: row, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('rabbit_hole_id', rabbitHoleId)
      .eq('episode_number', episodeNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    if (!row) return { data: null, error: null };

    return { data: transformEpisode(row), error: null };
  } catch (error) {
    console.error('Error fetching episode:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch episode' 
    };
  }
}

/**
 * Create a new episode
 */
export async function createEpisode(episode: {
  rabbitHoleId: string;
  episodeNumber: number;
  title: string;
  content: string;
  contentType?: Episode['contentType'];
  isUpdate?: boolean;
  sourceUrl?: string;
  summary?: string;
}): Promise<{ data: Episode | null; error: string | null }> {
  try {
    const { data: row, error } = await supabase
      .from('episodes')
      .insert({
        rabbit_hole_id: episode.rabbitHoleId,
        episode_number: episode.episodeNumber,
        title: episode.title,
        content: episode.content,
        content_type: episode.contentType || 'text',
        is_update: episode.isUpdate || false,
        source_url: episode.sourceUrl || null,
        summary: episode.summary || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!row) throw new Error('No row returned from insert');

    return { data: transformEpisode(row), error: null };
  } catch (error) {
    console.error('Error creating episode:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create episode' 
    };
  }
}

/**
 * Create multiple episodes at once
 */
export async function createEpisodes(episodes: Array<{
  rabbitHoleId: string;
  episodeNumber: number;
  title: string;
  content: string;
  contentType?: Episode['contentType'];
  isUpdate?: boolean;
  sourceUrl?: string;
  summary?: string;
}>): Promise<{ data: Episode[]; error: string | null }> {
  try {
    const inserts = episodes.map(e => ({
      rabbit_hole_id: e.rabbitHoleId,
      episode_number: e.episodeNumber,
      title: e.title,
      content: e.content,
      content_type: e.contentType || 'text',
      is_update: e.isUpdate || false,
      source_url: e.sourceUrl || null,
      summary: e.summary || null,
    }));

    const { data: rows, error } = await supabase
      .from('episodes')
      .insert(inserts)
      .select();

    if (error) throw error;

    return { data: (rows || []).map(transformEpisode), error: null };
  } catch (error) {
    console.error('Error creating episodes:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to create episodes' 
    };
  }
}

// ==================================================
// USER PROGRESS OPERATIONS
// ==================================================

/**
 * Mark an episode as read for a user
 */
export async function markEpisodeRead(
  episodeId: string,
  userId: string = ANONYMOUS_USER_ID,
  readingTimeSeconds?: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        episode_id: episodeId,
        completed_at: new Date().toISOString(),
        reading_time_seconds: readingTimeSeconds || null,
      }, {
        onConflict: 'user_id,episode_id',
      });

    if (error) throw error;

    // Also update last_seen_episode in subscription if exists
    const { data: episode } = await getEpisodeById(episodeId);
    if (episode) {
      await supabase
        .from('subscriptions')
        .update({ 
          last_seen_episode: episode.episodeNumber 
        })
        .eq('user_id', userId)
        .eq('rabbit_hole_id', episode.rabbitHoleId)
        .lt('last_seen_episode', episode.episodeNumber);
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking episode read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark episode read' 
    };
  }
}

/**
 * Get user's read episodes for a rabbit hole
 */
export async function getReadEpisodes(
  rabbitHoleId: string,
  userId: string = ANONYMOUS_USER_ID
): Promise<{ data: string[]; error: string | null }> {
  try {
    // First get episode IDs for this rabbit hole
    const { data: episodes, error: episodeError } = await supabase
      .from('episodes')
      .select('id')
      .eq('rabbit_hole_id', rabbitHoleId);

    if (episodeError) throw episodeError;

    const episodeIds = (episodes || []).map(e => e.id);
    if (episodeIds.length === 0) return { data: [], error: null };

    // Then get which ones user has read
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('episode_id')
      .eq('user_id', userId)
      .in('episode_id', episodeIds);

    if (progressError) throw progressError;

    return { 
      data: (progress || []).map(p => p.episode_id), 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching read episodes:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch read episodes' 
    };
  }
}

// ==================================================
// STATISTICS
// ==================================================

/**
 * Get statistics for a rabbit hole
 */
export async function getRabbitHoleStats(rabbitHoleId: string): Promise<{
  totalEpisodes: number;
  totalReads: number;
  subscribers: number;
}> {
  const [episodeCount, readCount, subCount] = await Promise.all([
    supabase
      .from('episodes')
      .select('id', { count: 'exact', head: true })
      .eq('rabbit_hole_id', rabbitHoleId),
    supabase
      .from('user_progress')
      .select('id', { count: 'exact', head: true })
      .in('episode_id', 
        supabase
          .from('episodes')
          .select('id')
          .eq('rabbit_hole_id', rabbitHoleId)
      ),
    supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('rabbit_hole_id', rabbitHoleId),
  ]);

  return {
    totalEpisodes: episodeCount.count || 0,
    totalReads: readCount.count || 0,
    subscribers: subCount.count || 0,
  };
}
