/**
 * SAVED SCREEN - Bookmarked posts
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
import { Ionicons } from '@expo/vector-icons';

import { getSavedPosts, unsavePost } from '@/lib/posts';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StarField } from '@/components/StarField';
import { Post, ANONYMOUS_USER_ID } from '@/types';
import { Colors, Typography, Spacing } from '@/constants/colors';

export default function SavedScreenWrapper() {
  return (
    <ErrorBoundary>
      <SavedScreen />
    </ErrorBoundary>
  );
}

function SavedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const { data, error: fetchError } = await getSavedPosts(ANONYMOUS_USER_ID);
    if (fetchError) {
      setError(fetchError);
    } else {
      setPosts(data);
      setError(null);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleUnsave = useCallback(async (postId: string) => {
    await unsavePost(postId, ANONYMOUS_USER_ID);
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  const renderItem = useCallback(({ item }: { item: Post }) => (
    <SavedPostRow post={item} onUnsave={handleUnsave} />
  ), [handleUnsave]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  if (loading && posts.length === 0) {
    return (
      <View style={styles.root}>
        <StarField />
        <SafeAreaView style={styles.container}>
          <Header count={0} />
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>Loading saved posts...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <View style={styles.root}>
        <StarField />
        <SafeAreaView style={styles.container}>
          <Header count={0} />
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StarField />
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header count={posts.length} />
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            posts.length === 0 && styles.emptyListContent,
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
          ListEmptyComponent={<EmptyState />}
        />
      </SafeAreaView>
    </View>
  );
}

function SavedPostRow({ post, onUnsave }: { post: Post; onUnsave: (id: string) => void }) {
  return (
    <View style={styles.savedRow}>
      <View style={styles.savedRowContent}>
        {post.topics.length > 0 && (
          <Text style={styles.savedRowTopics}>
            {post.topics.slice(0, 2).map(t => t.toUpperCase()).join(' · ')}
          </Text>
        )}
        <Text style={styles.savedRowTitle} numberOfLines={2}>{post.title}</Text>
        {post.summary && (
          <Text style={styles.savedRowSummary} numberOfLines={2}>{post.summary}</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => onUnsave(post.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.unsaveButton}
      >
        <Ionicons name="bookmark" size={20} color={Colors.accent} />
      </TouchableOpacity>
    </View>
  );
}

function Header({ count }: { count: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Saved</Text>
      <Text style={styles.subtitle}>
        {count > 0 ? `${count} post${count !== 1 ? 's' : ''}` : 'Your bookmarked posts'}
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="bookmark-outline" size={64} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No saved posts yet</Text>
      <Text style={styles.emptyText}>Bookmark posts to read them later</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingVertical: 0,
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
  errorText: {
    fontSize: Typography.base,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  retryText: {
    fontSize: Typography.base,
    color: Colors.accent,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  savedRowContent: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  savedRowTopics: {
    fontSize: Typography.xs,
    color: Colors.accent,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  savedRowTitle: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: Typography.base * 1.3,
  },
  savedRowSummary: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: Typography.sm * 1.4,
  },
  unsaveButton: {
    paddingTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
    paddingTop: Spacing['3xl'],
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
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.base * 1.5,
  },
});
