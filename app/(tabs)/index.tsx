/**
 * FEED SCREEN v2.0 - Rabbit Holes Feed
 * 
 * Main infinite scroll feed showing rabbit holes with:
 * - Subscription updates
 * - Discovery recommendations
 * - Trending content
 * 
 * Uses the new FeedCard component with FOMO-inducing design.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useFeed } from '@/hooks/useFeed';
import { FeedCard } from '@/components/FeedCard';
import { FeedItem } from '@/types';
import { Colors, Typography, Spacing } from '@/constants/colors';

export default function FeedScreen() {
  // ==================================================
  // HOOKS
  // ==================================================
  
  const { items, loading, refreshing, error, refresh, loadMore } = useFeed();
  const router = useRouter();

  // ==================================================
  // HANDLERS
  // ==================================================
  
  const handleCardPress = useCallback((item: FeedItem) => {
    router.push({
      pathname: '/episode/[id]',
      params: { 
        id: item.episode.id,
        rabbitHoleId: item.episode.rabbitHoleId,
      },
    });
  }, [router]);

  // ==================================================
  // RENDER ITEM
  // ==================================================

  const renderItem = useCallback(({ item }: { item: FeedItem }) => (
    <FeedCard
      episode={item.episode}
      rabbitHoleTitle={item.rabbitHole.title}
      hookText={item.rabbitHole.hookText}
      topics={item.rabbitHole.topics}
      onPress={() => handleCardPress(item)}
    />
  ), [handleCardPress]);

  const keyExtractor = useCallback((item: FeedItem) => item.id, []);

  // ==================================================
  // LOADING STATE
  // ==================================================
  
  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
      <Header />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading rabbit holes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==================================================
  // ERROR STATE
  // ==================================================
  
  if (error && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
      <Header />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==================================================
  // EMPTY STATE
  // ==================================================

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header updateCount={0} />
        <View style={styles.centered}>
          <Ionicons name="planet-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No rabbit holes yet</Text>
          <Text style={styles.emptyText}>
            Content is being generated. Pull down to refresh!
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Ionicons name="refresh" size={18} color={Colors.accent} />
            <Text style={styles.retryText}>Refresh</Text>
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
      
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
            progressBackgroundColor={Colors.background}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        ListFooterComponent={
          loading && items.length > 0 ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={Colors.accent} />
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

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>iScroll</Text>
      <Text style={styles.subtitle}>Discover something interesting</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingVertical: 0,
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
    fontSize: Typography.base,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  retryText: {
    fontSize: Typography.base,
    color: Colors.accent,
    fontWeight: Typography.medium,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
});
