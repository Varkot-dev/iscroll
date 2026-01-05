/**
 * RABBIT HOLE SCREEN
 * 
 * Shows the full rabbit hole with:
 * - Header and description
 * - Episode list with progress
 * - Subscribe functionality
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

import { RabbitHoleView } from '@/components/RabbitHoleView';
import { getRabbitHoleById, getEpisodes, getReadEpisodes } from '@/lib/rabbit-holes';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { RabbitHole, Episode, ANONYMOUS_USER_ID } from '@/types';
import { Colors, Typography, Spacing } from '@/constants/colors';

export default function RabbitHoleScreen() {
  // ==================================================
  // PARAMS & ROUTING
  // ==================================================
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // ==================================================
  // STATE
  // ==================================================
  
  const [rabbitHole, setRabbitHole] = useState<RabbitHole | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [readEpisodeIds, setReadEpisodeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================================================
  // SUBSCRIPTION HOOK
  // ==================================================
  
  const { 
    isSubscribed, 
    toggleSubscription, 
    getSubscription,
    updateLastSeen,
  } = useSubscriptions(ANONYMOUS_USER_ID);

  // ==================================================
  // FETCH DATA
  // ==================================================
  
  useEffect(() => {
    async function fetchData() {
      if (!id) {
        setError('No rabbit hole ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch rabbit hole
        const { data: rhData, error: rhError } = await getRabbitHoleById(id);
        if (rhError || !rhData) {
          throw new Error(rhError || 'Rabbit hole not found');
        }
        setRabbitHole(rhData);

        // Fetch episodes
        const { data: epData } = await getEpisodes(id);
        setEpisodes(epData || []);

        // Fetch read episodes
        const { data: readData } = await getReadEpisodes(id, ANONYMOUS_USER_ID);
        setReadEpisodeIds(readData || []);

      } catch (err) {
        console.error('Error fetching rabbit hole:', err);
        setError(err instanceof Error ? err.message : 'Failed to load rabbit hole');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // ==================================================
  // HANDLERS
  // ==================================================
  
  const handleSubscribe = useCallback(async () => {
    if (!id) return;
    await toggleSubscription(id);
  }, [id, toggleSubscription]);

  const handleEpisodePress = useCallback((episode: Episode) => {
    router.push({
      pathname: '/episode/[id]',
      params: { 
        id: episode.id,
        rabbitHoleId: episode.rabbitHoleId,
      },
    });
  }, [router]);

  // ==================================================
  // COMPUTED VALUES
  // ==================================================
  
  const subscription = id ? getSubscription(id) : undefined;
  const currentEpisode = subscription?.lastSeenEpisode || 0;
  const subscribed = id ? isSubscribed(id) : false;

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

      <Text style={styles.headerTitle} numberOfLines={1}>
        {rabbitHole?.title || 'Rabbit Hole'}
      </Text>

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
          <Text style={styles.loadingText}>Loading rabbit hole...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==================================================
  // ERROR STATE
  // ==================================================
  
  if (error || !rabbitHole) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error || 'Rabbit hole not found'}</Text>
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
      <RabbitHoleView
        rabbitHole={rabbitHole}
        episodes={episodes}
        readEpisodeIds={readEpisodeIds}
        currentEpisode={currentEpisode}
        onSubscribe={handleSubscribe}
        onEpisodePress={handleEpisodePress}
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
  headerTitle: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
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
