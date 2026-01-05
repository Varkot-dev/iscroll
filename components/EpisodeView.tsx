/**
 * EPISODE VIEW COMPONENT
 * 
 * Displays the full episode content with:
 * - "Previously on..." recap section
 * - Main narrative content
 * - Next episode teaser
 * - Navigation between episodes
 * 
 * Designed for comfortable reading with clean typography.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Episode, RabbitHole } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';
import { Badge } from './Badge';

// ==================================================
// TYPES
// ==================================================

type EpisodeViewProps = {
  episode: Episode;
  rabbitHole: Pick<RabbitHole, 'id' | 'title' | 'type' | 'totalEpisodes'>;
  previousEpisode?: Episode | null;
  nextEpisode?: Episode | null;
  onPreviousPress?: () => void;
  onNextPress?: () => void;
  onSubscribe?: () => void;
  isSubscribed?: boolean;
  onMarkRead?: () => void;
};

// ==================================================
// COMPONENT
// ==================================================

export function EpisodeView({
  episode,
  rabbitHole,
  previousEpisode,
  nextEpisode,
  onPreviousPress,
  onNextPress,
  onSubscribe,
  isSubscribed,
}: EpisodeViewProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Parse content into paragraphs
  const paragraphs = episode.content.split('\n\n').filter(p => p.trim());

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Episode header */}
      <View style={styles.header}>
        {/* Breadcrumb */}
        <Text style={styles.breadcrumb}>{rabbitHole.title}</Text>

        {/* Episode number and badges */}
        <View style={styles.episodeMeta}>
          <Text style={styles.episodeNumber}>
            Episode {episode.episodeNumber}
            {rabbitHole.totalEpisodes > 0 && ` of ${rabbitHole.totalEpisodes}`}
          </Text>
          {episode.isUpdate && <Badge type="live" />}
        </View>

        {/* Title */}
        <Text style={styles.title}>{episode.title}</Text>

        {/* Date */}
        <Text style={styles.date}>
          Published {formatDate(episode.publishedAt)}
          {episode.sourceUrl && ' • Based on recent news'}
        </Text>
      </View>

      {/* Previously on... section */}
      {previousEpisode?.summary && (
        <View style={styles.recapSection}>
          <View style={styles.recapHeader}>
            <Ionicons name="arrow-back-circle-outline" size={20} color={Colors.accent} />
            <Text style={styles.recapTitle}>Previously...</Text>
          </View>
          <Text style={styles.recapText}>{previousEpisode.summary}</Text>
        </View>
      )}

      {/* Main content */}
      <View style={styles.contentSection}>
        {paragraphs.map((paragraph, index) => (
          <Text key={index} style={styles.paragraph}>
            {paragraph.trim()}
          </Text>
        ))}
      </View>

      {/* Source attribution (if from news) */}
      {episode.sourceUrl && (
        <TouchableOpacity style={styles.sourceCard}>
          <Ionicons name="newspaper-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.sourceText}>Based on recent news</Text>
          <Ionicons name="open-outline" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Next episode teaser */}
      {nextEpisode && (
        <TouchableOpacity 
          style={styles.nextEpisodeCard}
          onPress={onNextPress}
          activeOpacity={0.8}
        >
          <Text style={styles.nextLabel}>NEXT EPISODE</Text>
          <Text style={styles.nextTitle}>{nextEpisode.title}</Text>
          {nextEpisode.summary && (
            <Text style={styles.nextSummary} numberOfLines={2}>
              {nextEpisode.summary}
            </Text>
          )}
          <View style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Continue →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* End of series message */}
      {!nextEpisode && rabbitHole.type === 'series' && (
        <View style={styles.endCard}>
          <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
          <Text style={styles.endTitle}>You've reached the end!</Text>
          <Text style={styles.endText}>
            {isSubscribed 
              ? "We'll notify you when new episodes are added."
              : "Subscribe to be notified when new episodes are added."}
          </Text>
          {!isSubscribed && onSubscribe && (
            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={onSubscribe}
            >
              <Ionicons name="notifications-outline" size={18} color={Colors.background} />
              <Text style={styles.subscribeText}>Subscribe</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Live topic - staying updated */}
      {!nextEpisode && rabbitHole.type === 'live' && (
        <View style={styles.liveEndCard}>
          <Badge type="live" size="md" />
          <Text style={styles.liveEndTitle}>You're caught up!</Text>
          <Text style={styles.liveEndText}>
            {isSubscribed 
              ? "We'll notify you when there are new developments."
              : "Subscribe to get updates as this story unfolds."}
          </Text>
          {!isSubscribed && onSubscribe && (
            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={onSubscribe}
            >
              <Ionicons name="notifications-outline" size={18} color={Colors.background} />
              <Text style={styles.subscribeText}>Subscribe</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Episode navigation */}
      <View style={styles.navigation}>
        {previousEpisode && onPreviousPress ? (
          <TouchableOpacity 
            style={styles.navButton}
            onPress={onPreviousPress}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
            <View style={styles.navButtonContent}>
              <Text style={styles.navLabel}>Previous</Text>
              <Text style={styles.navTitle} numberOfLines={1}>
                Episode {previousEpisode.episodeNumber}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.navPlaceholder} />
        )}

        {nextEpisode && onNextPress && (
          <TouchableOpacity 
            style={[styles.navButton, styles.navButtonRight]}
            onPress={onNextPress}
          >
            <View style={[styles.navButtonContent, styles.navButtonContentRight]}>
              <Text style={styles.navLabel}>Next</Text>
              <Text style={styles.navTitle} numberOfLines={1}>
                Episode {nextEpisode.episodeNumber}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom padding */}
      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
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
  content: {
    paddingBottom: Spacing['3xl'],
  },

  // Header
  header: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  breadcrumb: {
    fontSize: Typography.sm,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  episodeNumber: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    lineHeight: Typography['2xl'] * Typography.tight,
    marginBottom: Spacing.sm,
  },
  date: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },

  // Recap section
  recapSection: {
    margin: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  recapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recapTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recapText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * Typography.relaxed,
    fontStyle: 'italic',
  },

  // Main content
  contentSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  paragraph: {
    fontSize: Typography.lg,
    color: Colors.textPrimary,
    lineHeight: Typography.lg * Typography.loose,
    marginBottom: Spacing.xl,
  },

  // Source card
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  sourceText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },

  // Next episode card
  nextEpisodeCard: {
    margin: Spacing.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  nextLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.accent,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  nextTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  nextSummary: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * Typography.normal,
    marginBottom: Spacing.md,
  },
  nextButton: {
    alignSelf: 'flex-start',
  },
  nextButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.accent,
  },

  // End card
  endCard: {
    margin: Spacing.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  endTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  endText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  // Live end card
  liveEndCard: {
    margin: Spacing.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.liveGreenLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.liveGreen,
  },
  liveEndTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  liveEndText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  // Subscribe button
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
  },
  subscribeText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.background,
  },

  // Navigation
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xl,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  navButtonRight: {
    justifyContent: 'flex-end',
  },
  navButtonContent: {
    flex: 1,
  },
  navButtonContentRight: {
    alignItems: 'flex-end',
  },
  navLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navTitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  navPlaceholder: {
    flex: 1,
  },
});
