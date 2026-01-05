/**
 * SAVED SCREEN - Bookmarked articles
 * 
 * Shows all articles the user has saved.
 * Users can:
 * - View saved articles
 * - Tap to read full thread
 * - Remove saved articles
 * - Pull to refresh
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useSavedItems } from '@/hooks/useSavedItems';
import { SavedItem } from '@/lib/supabase';
import { truncateText } from '@/lib/wikipedia';

export default function SavedScreen() {
  // ============================================
  // HOOKS
  // ============================================
  
  const { savedItems, loading, error, removeItem, refresh } = useSavedItems();
  const router = useRouter();

  // ============================================
  // HANDLERS
  // ============================================
  
  /**
   * Navigate to thread view
   */
  const handleItemPress = useCallback((item: SavedItem) => {
    router.push({
      pathname: '/thread/[id]',
      params: {
        id: item.wikipedia_id,
        title: item.title,
      },
    });
  }, [router]);

  /**
   * Remove item from saved
   */
  const handleRemove = useCallback(async (item: SavedItem) => {
    const success = await removeItem(item.wikipedia_id);
    if (!success) {
      console.warn('Failed to remove item');
    }
  }, [removeItem]);

  /**
   * Render a saved item
   */
  const renderItem = useCallback(({ item }: { item: SavedItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      {item.thumbnail_url ? (
        <Image
          source={{ uri: item.thumbnail_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
          <Ionicons name="document-text-outline" size={24} color="#444444" />
        </View>
      )}

      {/* Content */}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.extract && (
          <Text style={styles.itemExtract} numberOfLines={2}>
            {truncateText(item.extract, 100)}
          </Text>
        )}
        <Text style={styles.savedDate}>
          Saved {formatDate(item.saved_at)}
        </Text>
      </View>

      {/* Remove button */}
      <TouchableOpacity
        onPress={() => handleRemove(item)}
        style={styles.removeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="bookmark" size={22} color="#22c55e" />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleItemPress, handleRemove]);

  /**
   * Key extractor
   */
  const keyExtractor = useCallback((item: SavedItem) => item.id, []);

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (loading && savedItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved</Text>
          <Text style={styles.subtitle}>Your bookmarked articles</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // EMPTY STATE
  // ============================================
  
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="bookmark-outline" size={64} color="#333333" />
      </View>
      <Text style={styles.emptyText}>No saved articles yet</Text>
      <Text style={styles.emptyHint}>
        Tap the bookmark icon on any article to save it for later
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push('/')}
      >
        <Ionicons name="compass-outline" size={20} color="#22c55e" />
        <Text style={styles.browseButtonText}>Browse articles</Text>
      </TouchableOpacity>
    </View>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>
          {savedItems.length > 0
            ? `${savedItems.length} article${savedItems.length !== 1 ? 's' : ''}`
            : 'Your bookmarked articles'}
        </Text>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={savedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          savedItems.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#22c55e"
            colors={['#22c55e']}
            progressBackgroundColor="#141414"
          />
        }
        ListEmptyComponent={EmptyState}
      />
    </SafeAreaView>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format date for display
 * Shows "Today", "Yesterday", or the date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
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
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  // Item card styles
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemExtract: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
    marginBottom: 4,
  },
  savedDate: {
    fontSize: 11,
    color: '#555555',
  },
  removeButton: {
    padding: 8,
  },
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#141414',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  browseButtonText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
});
