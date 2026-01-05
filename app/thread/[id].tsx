/**
 * THREAD SCREEN - Full article view
 * 
 * Displays when user taps a card in the feed.
 * Shows the complete article in a readable format.
 * Now with working bookmark functionality!
 */

import React, { useEffect, useState } from 'react';
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

import { ThreadView } from '@/components/ThreadView';
import { getArticleByTitle } from '@/lib/wikipedia';
import { useSavedItems } from '@/hooks/useSavedItems';
import { WikipediaArticle, FeedItem } from '@/types';

export default function ThreadScreen() {
  // ============================================
  // ROUTE PARAMS & HOOKS
  // ============================================
  
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const router = useRouter();
  
  // Saved items hook for bookmarking
  const { toggleItem, isItemSaved } = useSavedItems();

  // ============================================
  // STATE
  // ============================================
  
  const [article, setArticle] = useState<WikipediaArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if this article is saved
  const isSaved = id ? isItemSaved(id) : false;

  // ============================================
  // FETCH ARTICLE
  // ============================================
  
  useEffect(() => {
    async function fetchArticle() {
      if (!title) {
        setError('No article title provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getArticleByTitle(title);
        
        if (data) {
          setArticle(data);
        } else {
          setError('Failed to load article');
        }
      } catch (err) {
        setError('Something went wrong');
        console.error('Thread fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [title]);

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleBookmark = async () => {
    if (!article || !id) return;

    // Create a FeedItem from the article for saving
    const feedItem: FeedItem = {
      id: id,
      title: article.title,
      extract: article.extract,
      thumbnailUrl: article.thumbnail?.source,
      wikipediaUrl: article.content_urls?.desktop?.page || '',
    };

    const success = await toggleItem(feedItem);
    if (!success) {
      console.warn('Failed to toggle bookmark');
    }
  };

  // ============================================
  // HEADER COMPONENT
  // ============================================
  
  const Header = () => (
    <View style={styles.header}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.headerButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title || 'Thread'}
      </Text>

      {/* Bookmark button */}
      <TouchableOpacity
        onPress={handleBookmark}
        style={styles.headerButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isSaved ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={isSaved ? '#22c55e' : '#ffffff'}
        />
      </TouchableOpacity>
    </View>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  
  if (error || !article) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Article not found'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back to feed</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ThreadView
        article={article}
        onBookmark={handleBookmark}
        isSaved={isSaved}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: 8,
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
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  backLink: {
    marginTop: 20,
    padding: 12,
  },
  backLinkText: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '500',
  },
});
