/**
 * RABBIT HOLE VIEW COMPONENT
 * 
 * Displays the full rabbit hole with:
 * - Header with subscribe button
 * - Episode list with progress indicators
 * - Topics and metadata
 * 
 * This is the main view when a user taps on a rabbit hole card.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RabbitHole, Episode } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';
import { Badge, EpisodeBadge, TopicBadge } from './Badge';

// ==================================================
// TYPES
// ==================================================

type RabbitHoleViewProps = {
  rabbitHole: RabbitHole;
  episodes: Episode[];
  readEpisodeIds: string[];
  currentEpisode?: number;
  onSubscribe: () => void;
  onEpisodePress: (episode: Episode) => void;
  isSubscribed: boolean;
};

// ==================================================
// COMPONENT
// ==================================================

export function RabbitHoleView({
  rabbitHole,
  episodes,
  readEpisodeIds,
  currentEpisode,
  onSubscribe,
  onEpisodePress,
  isSubscribed,
}: RabbitHoleViewProps) {
  // Calculate progress
  const readCount = readEpisodeIds.length;
  const totalCount = episodes.length;
  const progressPercent = totalCount > 0 ? (readCount / totalCount) * 100 : 0;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero image */}
      {rabbitHole.thumbnailUrl && (
        <Image
          source={{ uri: rabbitHole.thumbnailUrl }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      )}

      {/* Header section */}
      <View style={styles.header}>
        {/* Badges */}
        <View style={styles.badges}>
          {rabbitHole.type === 'live' && <Badge type="live" size="md" />}
          {rabbitHole.type === 'series' && <Badge type="series" size="md" />}
          {rabbitHole.status === 'completed' && <Badge type="completed" size="md" />}
        </View>

        {/* Title */}
        <Text style={styles.title}>{rabbitHole.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{rabbitHole.description}</Text>

        {/* Topics */}
        {rabbitHole.topics.length > 0 && (
          <View style={styles.topicsContainer}>
            {rabbitHole.topics.map((topic, index) => (
              <TopicBadge key={index} topic={topic} />
            ))}
          </View>
        )}

        {/* Subscribe button */}
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            isSubscribed && styles.subscribeButtonActive,
          ]}
          onPress={onSubscribe}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isSubscribed ? 'notifications' : 'notifications-outline'}
            size={20}
            color={isSubscribed ? Colors.background : Colors.textPrimary}
          />
          <Text style={[
            styles.subscribeText,
            isSubscribed && styles.subscribeTextActive,
          ]}>
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress section (if subscribed) */}
      {isSubscribed && totalCount > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressCount}>
              {readCount} / {totalCount} episodes
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercent}%` }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Episodes section */}
      <View style={styles.episodesSection}>
        <Text style={styles.sectionTitle}>
          {totalCount > 0 ? `${totalCount} Episodes` : 'Episodes'}
        </Text>

        {episodes.length === 0 ? (
          <View style={styles.emptyEpisodes}>
            <Ionicons name="time-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyText}>
              {rabbitHole.status === 'upcoming' 
                ? 'Coming soon! Subscribe to be notified.'
                : 'No episodes yet. Check back soon!'}
            </Text>
          </View>
        ) : (
          <View style={styles.episodesList}>
            {episodes.map((episode) => {
              const isRead = readEpisodeIds.includes(episode.id);
              const isCurrent = episode.episodeNumber === currentEpisode;
              const isNew = !isRead && episode.episodeNumber > (currentEpisode || 0);

              return (
                <TouchableOpacity
                  key={episode.id}
                  style={[
                    styles.episodeItem,
                    isCurrent && styles.episodeItemCurrent,
                  ]}
                  onPress={() => onEpisodePress(episode)}
                  activeOpacity={0.8}
                >
                  {/* Episode number indicator */}
                  <EpisodeBadge 
                    number={episode.episodeNumber} 
                    isRead={isRead}
                    isCurrent={isCurrent}
                  />

                  {/* Episode content */}
                  <View style={styles.episodeContent}>
                    <View style={styles.episodeTitleRow}>
                      <Text 
                        style={[
                          styles.episodeTitle,
                          isRead && styles.episodeTitleRead,
                        ]} 
                        numberOfLines={1}
                      >
                        {episode.title}
                      </Text>
                      {isNew && <Badge type="new" />}
                      {episode.isUpdate && <Badge type="updates" />}
                    </View>
                    {episode.summary && (
                      <Text style={styles.episodeSummary} numberOfLines={2}>
                        {episode.summary}
                      </Text>
                    )}
                  </View>

                  {/* Chevron */}
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={Colors.textMuted} 
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Bottom padding */}
      <View style={{ height: Spacing['3xl'] }} />
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
  heroImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.surface,
  },
  header: {
    padding: Spacing.xl,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    lineHeight: Typography['2xl'] * Typography.tight,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * Typography.relaxed,
    marginBottom: Spacing.lg,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  subscribeButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  subscribeText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  subscribeTextActive: {
    color: Colors.background,
  },

  // Progress section
  progressSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  progressCount: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 2,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xl,
  },

  // Episodes section
  episodesSection: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  emptyEpisodes: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  episodesList: {
    gap: Spacing.md,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  episodeItemCurrent: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  episodeTitle: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  episodeTitleRead: {
    color: Colors.textSecondary,
  },
  episodeSummary: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    lineHeight: Typography.sm * Typography.normal,
  },
});
