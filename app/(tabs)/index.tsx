import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { usePostFeed } from '@/hooks/usePostFeed';
import { LearnCard } from '@/components/LearnCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FeedItem, ANONYMOUS_USER_ID } from '@/types';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { getSavedPosts, getPostById, savePost, unsavePost } from '@/lib/posts';

export default function FeedScreenWrapper() {
  return (
    <ErrorBoundary>
      <FeedScreen />
    </ErrorBoundary>
  );
}

function FeedScreen() {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const { items, loading, error, hasMore, refresh, loadMore, appendItemAt } = usePostFeed();
  const flatListRef = useRef<FlatList<FeedItem>>(null);
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [chainLoading, setChainLoading] = useState(false);

  useEffect(() => {
    getSavedPosts(ANONYMOUS_USER_ID).then(({ data }) => {
      if (data) {
        setSavedPostIds(new Set(data.map(p => p.id)));
      }
    });
  }, []);

  const handleChain = useCallback(async (relatedPostId: string, currentIndex: number) => {
    const existingIndex = items.findIndex(item => item.post.id === relatedPostId);
    if (existingIndex !== -1) {
      flatListRef.current?.scrollToIndex({ index: existingIndex, animated: true });
      return;
    }
    setChainLoading(true);
    const { data: post } = await getPostById(relatedPostId);
    setChainLoading(false);
    if (!post) return;
    appendItemAt(post, currentIndex);
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    });
  }, [items, appendItemAt]);

  const handleSave = useCallback(async (postId: string) => {
    const isSaved = savedPostIds.has(postId);
    if (isSaved) {
      setSavedPostIds(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      await unsavePost(postId, ANONYMOUS_USER_ID);
    } else {
      setSavedPostIds(prev => new Set(prev).add(postId));
      await savePost(postId, ANONYMOUS_USER_ID);
    }
  }, [savedPostIds]);

  const renderItem = useCallback(({ item, index }: { item: FeedItem; index: number }) => {
    if (item.type === 'post') {
      return (
        <LearnCard
          post={item.post}
          onChain={(relatedPostId) => handleChain(relatedPostId, index)}
          onSave={handleSave}
          isSaved={savedPostIds.has(item.post.id)}
        />
      );
    }
    return null;
  }, [handleChain, handleSave, savedPostIds]);

  const keyExtractor = useCallback((item: FeedItem) => item.id, []);

  if (loading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="planet-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptyText}>Content is being generated. Pull down to refresh!</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Ionicons name="refresh" size={18} color={Colors.accent} />
          <Text style={styles.retryText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        onEndReached={loadMore}
        onEndReachedThreshold={3}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={1}
      />
      {chainLoading && (
        <View style={styles.chainLoadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
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
    fontWeight: '700',
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
    fontWeight: '500',
  },
  chainLoadingOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
