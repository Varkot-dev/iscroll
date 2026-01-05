/**
 * THREAD VIEW COMPONENT
 * 
 * Displays the full article content when user taps a card.
 * Designed for comfortable reading with clean typography.
 * 
 * PROPS:
 * - article: The article data to display
 * - onBookmark: Function called when bookmark is tapped
 * - isSaved: Whether this article is bookmarked
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WikipediaArticle } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ThreadViewProps = {
  article: WikipediaArticle;
  onBookmark?: () => void;
  isSaved?: boolean;
};

export function ThreadView({ article, onBookmark, isSaved = false }: ThreadViewProps) {
  /**
   * Open the full Wikipedia article in browser
   */
  const openInWikipedia = () => {
    const url = article.content_urls?.desktop?.page;
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero image (if available) */}
      {article.originalimage?.source && (
        <Image
          source={{ uri: article.originalimage.source }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      )}

      {/* Article title */}
      <Text style={styles.title}>{article.title}</Text>

      {/* Description/subtitle (if available) */}
      {article.description && (
        <Text style={styles.description}>{article.description}</Text>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        {/* Bookmark button */}
        {onBookmark && (
          <TouchableOpacity 
            onPress={onBookmark}
            style={[styles.actionButton, isSaved && styles.actionButtonActive]}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? '#1d9bf0' : '#71767b'}
            />
            <Text style={[styles.actionText, isSaved && styles.actionTextActive]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Open in Wikipedia button */}
        <TouchableOpacity 
          onPress={openInWikipedia}
          style={styles.actionButton}
        >
          <Ionicons name="open-outline" size={20} color="#71767b" />
          <Text style={styles.actionText}>Wikipedia</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Main content */}
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.articleText}>{article.extract}</Text>
      </View>

      {/* Key facts card (placeholder for future AI-generated content) */}
      <View style={styles.factsCard}>
        <View style={styles.factsHeader}>
          <Ionicons name="bulb-outline" size={20} color="#1d9bf0" />
          <Text style={styles.factsTitle}>Quick Facts</Text>
        </View>
        <Text style={styles.factsHint}>
          In future versions, AI will generate key takeaways here!
        </Text>
      </View>

      {/* Related topics section (placeholder) */}
      <View style={styles.relatedSection}>
        <Text style={styles.sectionTitle}>Related Topics</Text>
        <Text style={styles.relatedHint}>
          Coming soon: Explore connected concepts
        </Text>
      </View>

      {/* Bottom padding */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
  },
  heroImage: {
    width: SCREEN_WIDTH - 40,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#16181c',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e7e9ea',
    lineHeight: 36,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#71767b',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2f3336',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(29, 155, 240, 0.1)',
    borderColor: '#1d9bf0',
  },
  actionText: {
    fontSize: 14,
    color: '#71767b',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#1d9bf0',
  },
  divider: {
    height: 1,
    backgroundColor: '#2f3336',
    marginVertical: 20,
  },
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e7e9ea',
    marginBottom: 12,
  },
  articleText: {
    fontSize: 16,
    color: '#e7e9ea',
    lineHeight: 26,
  },
  factsCard: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2f3336',
  },
  factsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  factsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d9bf0',
  },
  factsHint: {
    fontSize: 14,
    color: '#71767b',
    fontStyle: 'italic',
  },
  relatedSection: {
    marginBottom: 24,
  },
  relatedHint: {
    fontSize: 14,
    color: '#71767b',
  },
});
