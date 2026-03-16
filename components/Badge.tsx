/**
 * BADGE COMPONENT
 * 
 * Reusable badge for status indicators like:
 * - NEW (urgent red - unread content)
 * - LIVE (green - ongoing updates)
 * - SERIES (purple - structured course)
 * - UPDATES (amber - notification count)
 * 
 * Usage:
 * <Badge type="new" />
 * <Badge type="updates" count={3} />
 * <Badge type="live" />
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BadgeStyles, Typography, BorderRadius, Spacing } from '@/constants/colors';

// ==================================================
// TYPES
// ==================================================

type BadgeType = 'new' | 'live' | 'series' | 'updates' | 'completed' | 'upcoming';

type BadgeProps = {
  type: BadgeType;
  count?: number; // For 'updates' type
  size?: 'sm' | 'md';
  style?: object;
};

// ==================================================
// COMPONENT
// ==================================================

export function Badge({ type, count, size = 'sm', style }: BadgeProps) {
  const badgeStyle = BadgeStyles[type];
  
  // Determine text content
  let text: string;
  switch (type) {
    case 'new':
      text = 'NEW';
      break;
    case 'live':
      text = 'LIVE';
      break;
    case 'series':
      text = 'SERIES';
      break;
    case 'updates':
      text = count ? `${count} NEW` : 'UPDATES';
      break;
    case 'completed':
      text = 'COMPLETED';
      break;
    case 'upcoming':
      text = 'COMING SOON';
      break;
    default:
      text = (type as string).toUpperCase();
  }

  const isSmall = size === 'sm';

  return (
    <View 
      style={[
        styles.badge, 
        { backgroundColor: badgeStyle.background },
        isSmall ? styles.badgeSm : styles.badgeMd,
        style,
      ]}
    >
      {/* Pulse animation dot for LIVE badges */}
      {type === 'live' && (
        <View style={styles.liveDot} />
      )}
      
      <Text 
        style={[
          styles.text, 
          { color: badgeStyle.text },
          isSmall ? styles.textSm : styles.textMd,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

// ==================================================
// EPISODE NUMBER BADGE
// ==================================================

type EpisodeBadgeProps = {
  number: number;
  isRead?: boolean;
  isCurrent?: boolean;
};

export function EpisodeBadge({ number, isRead, isCurrent }: EpisodeBadgeProps) {
  const backgroundColor = isCurrent 
    ? Colors.accent 
    : isRead 
      ? Colors.progressComplete 
      : Colors.progressUnread;
  
  const textColor = isCurrent || isRead 
    ? Colors.textPrimary 
    : Colors.textSecondary;

  return (
    <View style={[styles.episodeBadge, { backgroundColor }]}>
      <Text style={[styles.episodeNumber, { color: textColor }]}>
        {number}
      </Text>
    </View>
  );
}

// ==================================================
// UNREAD COUNT BADGE
// ==================================================

type UnreadBadgeProps = {
  count: number;
  style?: object;
};

export function UnreadBadge({ count, style }: UnreadBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : String(count);

  return (
    <View style={[styles.unreadBadge, style]}>
      <Text style={styles.unreadText}>{displayCount}</Text>
    </View>
  );
}

// ==================================================
// TOPIC TAG BADGE
// ==================================================

type TopicBadgeProps = {
  topic: string;
  selected?: boolean;
  onPress?: () => void;
};

const topicColors: Record<string, string> = {
  science: Colors.topicScience,
  technology: Colors.topicTech,
  tech: Colors.topicTech,
  history: Colors.topicHistory,
  economics: Colors.topicEconomics,
  psychology: Colors.topicPsychology,
  physics: Colors.topicPhysics,
  biology: Colors.topicScience,
  ai: Colors.topicTech,
  space: Colors.topicPhysics,
};

export function TopicBadge({ topic, selected }: TopicBadgeProps) {
  const color = topicColors[topic.toLowerCase()] || Colors.textSecondary;

  return (
    <View 
      style={[
        styles.topicBadge,
        { borderColor: color },
        selected && { backgroundColor: `${color}20` },
      ]}
    >
      <Text style={[styles.topicText, { color }]}>
        {topic}
      </Text>
    </View>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  // Main badge styles
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontWeight: Typography.bold,
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: Typography.xs - 1,
  },
  textMd: {
    fontSize: Typography.xs,
  },

  // Live dot animation
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textInverse,
    marginRight: 4,
  },

  // Episode badge
  episodeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeNumber: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },

  // Unread badge
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.urgentRed,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: Colors.textPrimary,
    fontSize: Typography.xs - 1,
    fontWeight: Typography.bold,
  },

  // Topic badge
  topicBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  topicText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    textTransform: 'lowercase',
  },
});
