/**
 * FEED SCREEN - Main infinite scroll feed
 * 
 * This is the home screen where users scroll through articles.
 * 
 * KEY COMPONENTS:
 * - FlatList: Efficiently renders long lists (only visible items)
 * - FeedCard: Individual article card
 * - useFeed: Custom hook for data fetching
 * - useSavedItems: Custom hook for bookmark management
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useFeed } from '@/hooks/useFeed';
import { useSavedItems } from '@/hooks/useSavedItems';
import { FeedCard } from '@/components/FeedCard';
import { FeedItem } from '@/types';

export default function FeedScreen() {
  // ============================================
  // HOOKS
  // ============================================
  
  // useFeed handles all the data fetching logic
  const { articles, loading, refreshing, error, refresh, loadMore } = useFeed();
  
  // useSavedItems handles bookmark operations
  const { toggleItem, isItemSaved } = useSavedItems();
  
  // Router for navigation
  const router = useRouter();

  // ============================================
  // HANDLERS
  // ============================================
  
  /**
   * Navigate to thread view when card is tapped
   */
  const handleCardPress = useCallback((item: FeedItem) => {
    router.push({
      pathname: '/thread/[id]',
      params: { 
        id: item.id,
        title: item.title,
      },
    });
  }, [router]);

  /**
   * Handle bookmark button press
   * Now actually saves/unsaves using Supabase!
   */
  const handleBookmark = useCallback(async (item: FeedItem) => {
    const success = await toggleItem(item);
    if (!success) {
      console.warn('Failed to toggle bookmark');
      // In a production app, you'd show a toast/alert here
    }
  }, [toggleItem]);

  /**
   * Render individual feed item
   */
  const renderItem = useCallback(({ item }: { item: FeedItem }) => (
    <FeedCard
      item={item}
      onPress={() => handleCardPress(item)}
      onBookmark={() => handleBookmark(item)}
      isSaved={isItemSaved(item.id)}
    />
  ), [handleCardPress, handleBookmark, isItemSaved]);

  /**
   * Get unique key for each item
   */
  const keyExtractor = useCallback((item: FeedItem) => item.id, []);

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (loading && articles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>iScroll</Text>
          <Text style={styles.subtitle}>Learn by scrolling</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading interesting facts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  
  if (error && articles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>iScroll</Text>
          <Text style={styles.subtitle}>Learn by scrolling</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryHint}>Pull down to retry</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>iScroll</Text>
        <Text style={styles.subtitle}>Learn by scrolling</Text>
      </View>

      {/* Feed list */}
      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#22c55e"
            colors={['#22c55e']}
            progressBackgroundColor="#141414"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No articles yet</Text>
          </View>
        }
        ListFooterComponent={
          loading && articles.length > 0 ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color="#22c55e" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  listContent: {
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryHint: {
    fontSize: 14,
    color: '#666666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});
