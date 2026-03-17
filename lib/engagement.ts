/**
 * ENGAGEMENT TRACKING
 *
 * One job: write engagement events to Supabase.
 * No React, no UI, no state management.
 *
 * These events power adaptive depth — the feed algorithm reads
 * topic_engagement_scores to decide which topics to go deeper on.
 *
 * Usage:
 *   trackView(postId, userId, topics, durationMs)
 *   trackChainTap(postId, userId, topics)
 *   trackSave(postId, userId, topics)
 *   trackUnsave(postId, userId, topics)
 */

import { supabase } from './supabase';
import { EngagementEvent, EngagementEventType, ANONYMOUS_USER_ID } from '@/types';

// ==================================================
// INTERNAL WRITE FUNCTION
// ==================================================

async function writeEvent(event: EngagementEvent): Promise<void> {
  const { error } = await supabase.from('engagement_events').insert({
    user_id:     event.userId,
    post_id:     event.postId,
    event_type:  event.eventType,
    duration_ms: event.durationMs ?? null,
  });

  if (error) {
    // Engagement tracking is non-critical — log but never throw.
    // A failed track event should never break the user experience.
    console.warn('[engagement] Failed to write event:', error.message);
  }
}

// ==================================================
// PUBLIC TRACKING FUNCTIONS
// ==================================================

/**
 * Track how long a card was visible on screen.
 * Call this when the user swipes away from a card.
 *
 * durationMs = timestamp when they swiped away - timestamp when card appeared
 */
export async function trackView(
  postId: string,
  topics: string[],
  durationMs: number,
  userId: string = ANONYMOUS_USER_ID,
): Promise<void> {
  // Don't track views under 1 second — probably just a fast scroll past
  if (durationMs < 1000) return;

  await writeEvent({
    userId,
    postId,
    eventType: 'view',
    durationMs,
    topics,
  });
}

/**
 * Track when a user taps the chain button.
 * This is the strongest intent signal — they actively want to go deeper.
 */
export async function trackChainTap(
  postId: string,
  topics: string[],
  userId: string = ANONYMOUS_USER_ID,
): Promise<void> {
  await writeEvent({ userId, postId, eventType: 'chain_tap', topics });
}

/**
 * Track when a user saves a post.
 */
export async function trackSave(
  postId: string,
  topics: string[],
  userId: string = ANONYMOUS_USER_ID,
): Promise<void> {
  await writeEvent({ userId, postId, eventType: 'save', topics });
}

/**
 * Track when a user unsaves a post.
 */
export async function trackUnsave(
  postId: string,
  topics: string[],
  userId: string = ANONYMOUS_USER_ID,
): Promise<void> {
  await writeEvent({ userId, postId, eventType: 'unsave', topics });
}

// ==================================================
// QUERY FUNCTIONS
// ==================================================

/**
 * Get a user's top engaged topics, ranked by score.
 * Used by the feed algorithm to decide what to serve next.
 *
 * Returns topics sorted highest score first.
 */
export async function getTopEngagedTopics(
  userId: string = ANONYMOUS_USER_ID,
  limit = 5,
): Promise<{ topic: string; score: number }[]> {
  const { data, error } = await supabase
    .from('topic_engagement_scores')
    .select('topic, score')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[engagement] Failed to fetch top topics:', error.message);
    return [];
  }

  return (data || []) as { topic: string; score: number }[];
}
