/**
 * useSubscriptions HOOK - Manages user subscriptions
 * 
 * Handles subscribing/unsubscribing to rabbit holes and
 * tracking subscription state.
 * 
 * KEY FUNCTIONS:
 * - subscribe: Follow a rabbit hole
 * - unsubscribe: Stop following
 * - isSubscribed: Check if user follows a rabbit hole
 * - getUnreadCount: Get unread episodes for a subscription
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Subscription, 
  SubscriptionWithDetails, 
  RabbitHole,
  ANONYMOUS_USER_ID 
} from '@/types';

// ==================================================
// TYPES
// ==================================================

type SubscriptionRow = {
  id: string;
  user_id: string;
  rabbit_hole_id: string;
  subscribed_at: string;
  last_seen_episode: number;
  notify_new_episodes: boolean;
};

type SubscriptionWithRabbitHole = SubscriptionRow & {
  rabbit_holes: {
    id: string;
    title: string;
    description: string;
    hook_text: string;
    type: string;
    status: string;
    total_episodes: number;
    thumbnail_url: string | null;
    created_at: string;
    last_updated: string;
  };
};

// ==================================================
// TRANSFORM FUNCTIONS
// ==================================================

function transformSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    rabbitHoleId: row.rabbit_hole_id,
    subscribedAt: row.subscribed_at,
    lastSeenEpisode: row.last_seen_episode,
    notifyNewEpisodes: row.notify_new_episodes,
  };
}

// ==================================================
// HOOK
// ==================================================

export function useSubscriptions(userId: string = ANONYMOUS_USER_ID) {
  // ==================================================
  // STATE
  // ==================================================
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionMap, setSubscriptionMap] = useState<Map<string, Subscription>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================================================
  // FETCH SUBSCRIPTIONS
  // ==================================================
  
  const fetchSubscriptions = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('subscribed_at', { ascending: false });

      if (fetchError) throw fetchError;

      const subs = (data || []).map(transformSubscription);
      setSubscriptions(subs);
      
      // Build map for quick lookups
      const map = new Map<string, Subscription>();
      subs.forEach(sub => map.set(sub.rabbitHoleId, sub));
      setSubscriptionMap(map);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch on mount
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // ==================================================
  // SUBSCRIBE
  // ==================================================
  
  const subscribe = useCallback(async (rabbitHoleId: string): Promise<boolean> => {
    try {
      // Check if already subscribed
      if (subscriptionMap.has(rabbitHoleId)) {
        return true; // Already subscribed
      }

      const { data, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          rabbit_hole_id: rabbitHoleId,
          last_seen_episode: 0,
          notify_new_episodes: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      const newSub = transformSubscription(data);
      setSubscriptions(prev => [newSub, ...prev]);
      setSubscriptionMap(prev => {
        const newMap = new Map(prev);
        newMap.set(rabbitHoleId, newSub);
        return newMap;
      });

      return true;
    } catch (err) {
      console.error('Error subscribing:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      return false;
    }
  }, [userId, subscriptionMap]);

  // ==================================================
  // UNSUBSCRIBE
  // ==================================================
  
  const unsubscribe = useCallback(async (rabbitHoleId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('rabbit_hole_id', rabbitHoleId);

      if (deleteError) throw deleteError;

      // Update local state
      setSubscriptions(prev => prev.filter(s => s.rabbitHoleId !== rabbitHoleId));
      setSubscriptionMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(rabbitHoleId);
        return newMap;
      });

      return true;
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
      return false;
    }
  }, [userId]);

  // ==================================================
  // TOGGLE SUBSCRIPTION
  // ==================================================
  
  const toggleSubscription = useCallback(async (rabbitHoleId: string): Promise<boolean> => {
    if (subscriptionMap.has(rabbitHoleId)) {
      return unsubscribe(rabbitHoleId);
    } else {
      return subscribe(rabbitHoleId);
    }
  }, [subscriptionMap, subscribe, unsubscribe]);

  // ==================================================
  // CHECK IF SUBSCRIBED
  // ==================================================
  
  const isSubscribed = useCallback((rabbitHoleId: string): boolean => {
    return subscriptionMap.has(rabbitHoleId);
  }, [subscriptionMap]);

  // ==================================================
  // GET SUBSCRIPTION
  // ==================================================
  
  const getSubscription = useCallback((rabbitHoleId: string): Subscription | undefined => {
    return subscriptionMap.get(rabbitHoleId);
  }, [subscriptionMap]);

  // ==================================================
  // UPDATE LAST SEEN EPISODE
  // ==================================================
  
  const updateLastSeen = useCallback(async (
    rabbitHoleId: string, 
    episodeNumber: number
  ): Promise<boolean> => {
    try {
      const sub = subscriptionMap.get(rabbitHoleId);
      if (!sub || episodeNumber <= sub.lastSeenEpisode) {
        return true; // Nothing to update
      }

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ last_seen_episode: episodeNumber })
        .eq('user_id', userId)
        .eq('rabbit_hole_id', rabbitHoleId);

      if (updateError) throw updateError;

      // Update local state
      setSubscriptions(prev => prev.map(s => 
        s.rabbitHoleId === rabbitHoleId 
          ? { ...s, lastSeenEpisode: episodeNumber }
          : s
      ));
      setSubscriptionMap(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(rabbitHoleId);
        if (existing) {
          newMap.set(rabbitHoleId, { ...existing, lastSeenEpisode: episodeNumber });
        }
        return newMap;
      });

      return true;
    } catch (err) {
      console.error('Error updating last seen:', err);
      return false;
    }
  }, [userId, subscriptionMap]);

  // ==================================================
  // GET UNREAD COUNT
  // ==================================================
  
  const getUnreadCount = useCallback((rabbitHoleId: string, totalEpisodes: number): number => {
    const sub = subscriptionMap.get(rabbitHoleId);
    if (!sub) return 0;
    return Math.max(0, totalEpisodes - sub.lastSeenEpisode);
  }, [subscriptionMap]);

  // ==================================================
  // GET SUBSCRIPTIONS WITH UNREAD COUNTS
  // ==================================================
  
  const getSubscriptionsWithUnread = useCallback(async (): Promise<SubscriptionWithDetails[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          rabbit_holes (*)
        `)
        .eq('user_id', userId)
        .order('subscribed_at', { ascending: false });

      if (fetchError) throw fetchError;

      return (data || []).map((row: SubscriptionWithRabbitHole) => {
        const rh = row.rabbit_holes;
        const subscription = transformSubscription(row);
        
        return {
          ...subscription,
          rabbitHole: {
            id: rh.id,
            title: rh.title,
            description: rh.description,
            hookText: rh.hook_text,
            type: rh.type as RabbitHole['type'],
            status: rh.status as RabbitHole['status'],
            totalEpisodes: rh.total_episodes,
            thumbnailUrl: rh.thumbnail_url || undefined,
            topics: [],
            createdAt: rh.created_at,
            lastUpdated: rh.last_updated,
            isSubscribed: true,
          },
          unreadCount: Math.max(0, rh.total_episodes - row.last_seen_episode),
        };
      });
    } catch (err) {
      console.error('Error fetching subscriptions with details:', err);
      return [];
    }
  }, [userId]);

  // ==================================================
  // RETURN
  // ==================================================
  
  return {
    // Data
    subscriptions,
    loading,
    error,
    
    // Actions
    subscribe,
    unsubscribe,
    toggleSubscription,
    updateLastSeen,
    refresh: fetchSubscriptions,
    
    // Queries
    isSubscribed,
    getSubscription,
    getUnreadCount,
    getSubscriptionsWithUnread,
  };
}

// ==================================================
// STANDALONE FUNCTIONS (for non-hook use)
// ==================================================

/**
 * Get total unread count across all subscriptions
 */
export async function getTotalUnreadCount(userId: string = ANONYMOUS_USER_ID): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        last_seen_episode,
        rabbit_holes!inner (total_episodes)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).reduce((total, row: { 
      last_seen_episode: number; 
      rabbit_holes: { total_episodes: number } 
    }) => {
      const unread = row.rabbit_holes.total_episodes - row.last_seen_episode;
      return total + Math.max(0, unread);
    }, 0);
  } catch (err) {
    console.error('Error getting total unread count:', err);
    return 0;
  }
}

/**
 * Get subscribed rabbit hole IDs (for quick checks)
 */
export async function getSubscribedIds(userId: string = ANONYMOUS_USER_ID): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('rabbit_hole_id')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(row => row.rabbit_hole_id);
  } catch (err) {
    console.error('Error getting subscribed IDs:', err);
    return [];
  }
}
