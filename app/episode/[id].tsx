/**
 * EPISODE SCREEN
 * 
 * Shows full episode content with:
 * - "Previously on..." recap
 * - Main narrative content
 * - Next episode teaser
 * - Episode navigation
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { EpisodeView } from '@/components/EpisodeView';
import { 
  getEpisodeById, 
  getEpisodeByNumber, 
  getRabbitHoleById,
  markEpisodeRead,
} from '@/lib/rabbit-holes';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Episode, RabbitHole, ANONYMOUS_USER_ID } from '@/types';
import { Colors, Typography, Spacing } from '@/constants/colors';

export default function EpisodeScreen() {
  // ==================================================
  // PARAMS & ROUTING
  // ==================================================
  
  const { id, rabbitHoleId } = useLocalSearchParams<{ 
    id: string; 
    rabbitHoleId?: string;
  }>();
  const router = useRouter();

  // ==================================================
  // STATE
  // ==================================================
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [rabbitHole, setRabbitHole] = useState<Pick<RabbitHole, 'id' | 'title' | 'type' | 'totalEpisodes'> | null>(null);
  const [previousEpisode, setPreviousEpisode] = useState<Episode | null>(null);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================================================
  // SUBSCRIPTION HOOK
  // ==================================================
  
  const { 
    isSubscribed, 
    toggleSubscription,
    updateLastSeen,
  } = useSubscriptions(ANONYMOUS_USER_ID);

  // ==================================================
  // FETCH DATA
  // ==================================================
  
  const fetchData = useCallback(async (episodeId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch episode
      const { data: epData, error: epError } = await getEpisodeById(episodeId);
      if (epError || !epData) {
        throw new Error(epError || 'Episode not found');
      }
      setEpisode(epData);

      // Fetch rabbit hole
      const rhId = rabbitHoleId || epData.rabbitHoleId;
      const { data: rhData, error: rhError } = await getRabbitHoleById(rhId);
      if (rhError || !rhData) {
        throw new Error(rhError || 'Rabbit hole not found');
      }
      setRabbitHole({
        id: rhData.id,
        title: rhData.title,
        type: rhData.type,
        totalEpisodes: rhData.totalEpisodes,
      });

      // Fetch previous episode
      if (epData.episodeNumber > 1) {
        const { data: prevData } = await getEpisodeByNumber(
          rhId, 
          epData.episodeNumber - 1
        );
        setPreviousEpisode(prevData);
      } else {
        setPreviousEpisode(null);
      }

      // Fetch next episode
      if (epData.episodeNumber < rhData.totalEpisodes) {
        const { data: nextData } = await getEpisodeByNumber(
          rhId, 
          epData.episodeNumber + 1
        );
        setNextEpisode(nextData);
      } else {
        setNextEpisode(null);
      }

      // Mark episode as read
      await markEpisodeRead(episodeId, ANONYMOUS_USER_ID);
      
      // Update last seen episode in subscription
      if (isSubscribed(rhId)) {
        await updateLastSeen(rhId, epData.episodeNumber);
      }

    } catch (err) {
      console.error('Error fetching episode:', err);
      setError(err instanceof Error ? err.message : 'Failed to load episode');
    } finally {
      setLoading(false);
    }
  }, [rabbitHoleId, isSubscribed, updateLastSeen]);

  useEffect(() => {
    if (id) {
      fetchData(id);
    } else {
      setError('No episode ID provided');
      setLoading(false);
    }
  }, [id, fetchData]);

  // ==================================================
  // HANDLERS
  // ==================================================
  
  const handlePreviousPress = useCallback(() => {
    if (previousEpisode) {
      router.replace({
        pathname: '/episode/[id]',
        params: { 
          id: previousEpisode.id,
          rabbitHoleId: previousEpisode.rabbitHoleId,
        },
      });
    }
  }, [previousEpisode, router]);

  const handleNextPress = useCallback(() => {
    if (nextEpisode) {
      router.replace({
        pathname: '/episode/[id]',
        params: { 
          id: nextEpisode.id,
          rabbitHoleId: nextEpisode.rabbitHoleId,
        },
      });
    }
  }, [nextEpisode, router]);

  const handleSubscribe = useCallback(async () => {
    if (rabbitHole) {
      await toggleSubscription(rabbitHole.id);
    }
  }, [rabbitHole, toggleSubscription]);

  // ==================================================
  // COMPUTED VALUES
  // ==================================================
  
  const subscribed = rabbitHole ? isSubscribed(rabbitHole.id) : false;

  // ==================================================
  // HEADER
  // ==================================================
  
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.headerButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {episode?.title || 'Episode'}
        </Text>
        {episode && (
          <Text style={styles.headerSubtitle}>
            Episode {episode.episodeNumber}
            {rabbitHole?.totalEpisodes ? ` of ${rabbitHole.totalEpisodes}` : ''}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubscribe}
        style={styles.headerButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={subscribed ? 'notifications' : 'notifications-outline'}
          size={24}
          color={subscribed ? Colors.accent : Colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );

  // ==================================================
  // LOADING STATE
  // ==================================================
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading episode...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==================================================
  // ERROR STATE
  // ==================================================
  
  if (error || !episode || !rabbitHole) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error || 'Episode not found'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==================================================
  // MAIN RENDER
  // ==================================================
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <EpisodeView
        episode={episode}
        rabbitHole={rabbitHole}
        previousEpisode={previousEpisode}
        nextEpisode={nextEpisode}
        onPreviousPress={previousEpisode ? handlePreviousPress : undefined}
        onNextPress={nextEpisode ? handleNextPress : undefined}
        onSubscribe={handleSubscribe}
        isSubscribed={subscribed}
      />
    </SafeAreaView>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: Spacing.sm,
    width: 40,
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  errorText: {
    marginTop: Spacing.lg,
    fontSize: Typography.base,
    color: Colors.error,
    textAlign: 'center',
  },
  backLink: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
  },
  backLinkText: {
    fontSize: Typography.base,
    color: Colors.accent,
    fontWeight: Typography.medium,
  },
});
