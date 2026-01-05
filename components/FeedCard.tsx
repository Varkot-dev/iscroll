/**
 * FEED CARD COMPONENT v2.0
 * 
 * Displays a rabbit hole in the scrolling feed.
 * Now supports:
 * - NEW/LIVE/SERIES badges
 * - Subscribe button
 * - Unread episode counts
 * - FOMO-inducing hook text
 * 
 * PROPS:
 * - rabbitHole: The rabbit hole data
 * - onPress: Function called when card is tapped
 * - onSubscribe: Function called when subscribe is tapped
 * - isSubscribed: Whether user follows this rabbit hole
 * - unreadCount: Number of unread episodes
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Episode, FeedItem as LegacyFeedItem } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

// ==================================================
// TYPES
// ==================================================

type FeedCardProps = {
  episode: Episode;
  rabbitHoleTitle: string;
  hookText?: string;
  topics?: string[];
  onPress: () => void;
};

// Legacy props for backward compatibility
type LegacyFeedCardProps = {
  item: LegacyFeedItem;
  onPress: () => void;
  onBookmark?: () => void;
  isSaved?: boolean;
};

// ==================================================
// MAIN COMPONENT
// ==================================================

export function FeedCard({ 
  episode,
  rabbitHoleTitle,
  hookText,
  topics = [],
  onPress,
}: FeedCardProps) {
  const rawSnippet = hookText || episode.summary || episode.content;
  const snippet = rawSnippet.length > 260 ? `${rawSnippet.slice(0, 257)}...` : rawSnippet;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text style={styles.context} numberOfLines={1}>
        {rabbitHoleTitle} · Chapter {episode.episodeNumber}
      </Text>

      <Text style={styles.title} numberOfLines={2}>
        {episode.title}
      </Text>

      <Text style={styles.snippet} numberOfLines={4}>
        {snippet}
      </Text>

      {topics.length > 0 && (
        <View style={styles.topics}>
          {topics.slice(0, 3).map((topic, index) => (
            <Text key={index} style={styles.topicTag}>
              #{topic}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ==================================================
// LEGACY FEED CARD (for backward compatibility)
// ==================================================

export function LegacyFeedCard({ item, onPress, onBookmark, isSaved = false }: LegacyFeedCardProps) {
  return (
    <TouchableOpacity
      style={styles.legacyCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text style={styles.legacyContent}>
        {createHook(item.title, item.extract)}
      </Text>
      
      {onBookmark && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onBookmark();
          }}
          style={styles.legacyBookmarkButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? Colors.accent : Colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// Legacy hook generator
function createHook(title: string, extract: string): string {
  const sentences = extract.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length < 40 || trimmed.length > 200) continue;
    
    const lower = trimmed.toLowerCase();
    const interestingPatterns = [
      /first|largest|smallest|oldest|newest|biggest/,
      /million|billion|thousand|hundreds/,
      /discover|invent|create|found/,
      /only|never|always|unique/,
      /famous|known for|renowned/,
      /war|battle|revolution/,
      /secret|mysterious|unknown/,
      /record|achievement|breakthrough/,
    ];
    
    if (interestingPatterns.some(pattern => pattern.test(lower))) {
      return trimmed + '.';
    }
  }
  
  const firstSentence = sentences[0]?.trim();
  if (firstSentence && firstSentence.length >= 40 && firstSentence.length <= 180) {
    return firstSentence + '.';
  }
  
  return extract.length > 160 ? extract.slice(0, 157) + '...' : extract;
}

// ==================================================
// COMPACT FEED CARD (for subscription list)
// ==================================================

type CompactFeedCardProps = {
  rabbitHole: RabbitHole;
  onPress: () => void;
  unreadCount?: number;
};

export function CompactFeedCard({ rabbitHole, onPress, unreadCount = 0 }: CompactFeedCardProps) {
  return (
    <TouchableOpacity
      style={styles.compactCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Thumbnail or placeholder */}
      {rabbitHole.thumbnailUrl ? (
        <Image
          source={{ uri: rabbitHole.thumbnailUrl }}
          style={styles.compactThumbnail}
        />
      ) : (
        <View style={[styles.compactThumbnail, styles.compactPlaceholder]}>
          <Ionicons 
            name={rabbitHole.type === 'live' ? 'radio' : 'book'} 
            size={24} 
            color={Colors.textMuted} 
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.compactContent}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {rabbitHole.title}
          </Text>
          {unreadCount > 0 && (
            <UnreadBadge count={unreadCount} />
          )}
        </View>
        <Text style={styles.compactSubtitle} numberOfLines={1}>
          {rabbitHole.totalEpisodes} episodes • {rabbitHole.type}
        </Text>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  context: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.lg * Typography.tight,
    marginBottom: Spacing.xs,
  },
  snippet: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    lineHeight: Typography.base * Typography.relaxed,
    marginBottom: Spacing.sm,
  },
  topics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  topicTag: {
    fontSize: Typography.sm,
    color: Colors.accent,
  },

  // Legacy card (kept for backward compatibility)
  legacyCard: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  legacyContent: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    lineHeight: Typography.base * Typography.normal,
    fontWeight: Typography.normal,
    marginBottom: Spacing.md,
  },
  legacyBookmarkButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.xs,
  },

  // Compact card (used in subscription lists)
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  compactThumbnail: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.border,
  },
  compactPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContent: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  compactTitle: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  compactSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
