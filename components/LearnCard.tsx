import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { Post } from '@/types';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { MathContent } from '@/components/MathContent';

type LearnCardProps = {
  post: Post;
  onChain: (relatedPostId: string) => void;
  onSave: (postId: string) => void;
  onExpand: (postId: string) => void;
  isSaved: boolean;
};

export function LearnCard({ post, onChain, onSave, onExpand, isSaved }: LearnCardProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View
      style={[
        styles.container,
        {
          height: windowHeight,
          paddingTop: insets.top + 48,
          paddingBottom: tabBarHeight + 16,
        },
      ]}
    >
      {/* Tappable card body — opens detail screen */}
      <TouchableOpacity
        style={styles.cardBody}
        onPress={() => onExpand(post.id)}
        activeOpacity={0.85}
      >
        {/* Topic pills */}
        {post.topics.length > 0 && (
          <View style={styles.topicsRow}>
            {post.topics.map(topic => (
              <View key={topic} style={styles.topicPill}>
                <Text style={styles.topicText}>{topic.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Title */}
        <Text style={styles.title}>{post.title}</Text>

        {/* Content */}
        <MathContent
          content={post.content}
          fontSize={16}
          lineHeight={26}
        />

        {/* Wow fact */}
        {post.wowFact && (
          <View style={styles.wowFactBox}>
            <Text style={styles.wowFactLabel}>SIGNAL</Text>
            <Text style={styles.wowFactText}>{post.wowFact}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <View style={styles.chainContainer}>
          {post.relatedPostId && post.relatedPostTitle && (
            <TouchableOpacity
              style={styles.chainButton}
              onPress={() => onChain(post.relatedPostId!)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.chainButtonText}>
                Explore → {post.relatedPostTitle}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => onSave(post.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={Colors.accent}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
  },
  cardBody: {
    flex: 1,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  topicPill: {
    borderWidth: 1,
    borderColor: 'rgba(168, 184, 216, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topicText: {
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 38,
    marginTop: 28,
  },
  content: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginTop: 20,
  },
  wowFactBox: {
    backgroundColor: Colors.accentGlow,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 184, 216, 0.2)',
    marginTop: 24,
  },
  wowFactLabel: {
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 8,
  },
  wowFactText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chainContainer: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  chainButton: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  chainButtonText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
});
