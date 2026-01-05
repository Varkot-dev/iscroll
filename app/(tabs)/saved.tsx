/**
 * SAVED SCREEN v2.0 - Subscribed Rabbit Holes
 * 
 * Shows all rabbit holes the user is subscribed to with:
 * - Unread episode counts
 * - Quick access to continue watching
 * - Subscription management
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useSubscriptions, getTotalUnreadCount } from '@/hooks/useSubscriptions';
import { CompactFeedCard } from '@/components/FeedCard';
import { SubscriptionWithDetails, ANONYMOUS_USER_ID } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

export default function SavedScreen() {
  // ==================================================
  // HOOKS
  // ==================================================
  
  const { 
    getSubscriptionsWithUnread, 
    unsubscribe,
    loading: hookLoading,
    refresh,
  } = useSubscriptions(ANONYMOUS_USER_ID);
  
  const router = useRouter();
  
  // ==================================================
  // STATE
  // ==================================================
  
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  // ==================================================
  // FETCH DATA
  // ==================================================
  
  const fetchData = useCallback(async () => {
    try {
      const subs = await getSubscriptionsWithUnread();
      setSubscriptions(subs);
      
      const unread = await getTotalUnreadCount(ANONYMOUS_USER_ID);
      setTotalUnread(unread);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getSubscriptionsWithUnread]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==================================================
  // HANDLERS
  // ==================================================
  
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    await fetchData();
  }, [refresh, fetchData]);

  const handleItemPress = useCallback((item: SubscriptionWithDetails) => {
    router.push({
      pathname: '/rabbit-hole/[id]',
      params: { id: item.rabbitHoleId },
    });
  }, [router]);

  const handleUnsubscribe = useCallback(async (item: SubscriptionWithDetails) => {
    await unsubscribe(item.rabbitHoleId);
    setSubscriptions(prev => prev.filter(s => s.id !== item.id));
  }, [unsubscribe]);

  // ==================================================
  // RENDER ITEM
  // ==================================================

  const renderItem = useCallback(({ item }: { item: SubscriptionWithDetails }) => (
    <View style={styles.itemContainer}>
      <CompactFeedCard
        rabbitHole={item.rabbitHole}
        onPress={() => handleItemPress(item)}
        unreadCount={item.unreadCount}
      />
      
      {/* Unsubscribe button */}
      <TouchableOpacity
        onPress={() => handleUnsubscribe(item)}
        style={styles.unsubscribeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="notifications" size={20} color={Colors.accent} />
      </TouchableOpacity>
    </View>
  ), [handleItemPress, handleUnsubscribe]);

  const keyExtractor = useCallback((item: SubscriptionWithDetails) => item.id, []);

  // ==================================================
  // LOADING STATE
  // ==================================================
  
  if (loading && subscriptions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header totalUnread={0} count={0} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==================================================
  // EMPTY STATE
  // ==================================================
  
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-outline" size={64} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No subscriptions yet</Text>
      <Text style={styles.emptyText}>
        Subscribe to rabbit holes to follow their journey and get notified of new episodes
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push('/')}
      >
        <Ionicons name="planet-outline" size={20} color={Colors.accent} />
        <Text style={styles.browseButtonText}>Explore Rabbit Holes</Text>
      </TouchableOpacity>
    </View>
  );

  // ==================================================
  // MAIN RENDER
  // ==================================================
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header totalUnread={totalUnread} count={subscriptions.length} />

      <FlatList
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          subscriptions.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
            progressBackgroundColor={Colors.background}
          />
        }
        ListEmptyComponent={EmptyState}
        ListHeaderComponent={
          subscriptions.length > 0 && totalUnread > 0 ? (
            <View style={styles.unreadBanner}>
              <Ionicons name="mail-unread" size={18} color={Colors.warningAmber} />
              <Text style={styles.unreadBannerText}>
                {totalUnread} unread episode{totalUnread !== 1 ? 's' : ''} waiting for you
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

// ==================================================
// HEADER COMPONENT
// ==================================================

function Header({ totalUnread, count }: { totalUnread: number; count: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Following</Text>
      <Text style={styles.subtitle}>
        {count > 0
          ? `${count} rabbit hole${count !== 1 ? 's' : ''}`
          : 'Your subscribed rabbit holes'}
      </Text>
    </View>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.lg,
  },
  emptyListContent: {
    flex: 1,
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

  // Unread banner
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warningAmberLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  unreadBannerText: {
    fontSize: Typography.sm,
    color: Colors.warningAmber,
    fontWeight: Typography.medium,
  },

  // Item container
  itemContainer: {
    position: 'relative',
    marginBottom: 0,
  },
  unsubscribeButton: {
    position: 'absolute',
    right: Spacing.lg,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: Spacing.sm,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.base * Typography.relaxed,
    marginBottom: Spacing.xl,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  browseButtonText: {
    fontSize: Typography.base,
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
});
