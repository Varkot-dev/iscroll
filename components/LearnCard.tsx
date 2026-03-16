import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Post } from '@/types';
import { Colors, Typography, Spacing } from '@/constants/colors';

type LearnCardProps = {
  post: Post;
  onChain: (relatedPostId: string) => void;
  onSave: (postId: string) => void;
  isSaved: boolean;
};

export function LearnCard({ post, onChain, onSave, isSaved }: LearnCardProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          height: windowHeight,
          paddingTop: insets.top + Spacing['2xl'],
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      {/* Topic tags */}
      {post.topics.length > 0 && (
        <View style={styles.topicsRow}>
          {post.topics.map(topic => (
            <Text key={topic} style={styles.topicTag}>
              {topic.toUpperCase()}
            </Text>
          ))}
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>{post.title}</Text>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Wow fact callout */}
      {post.wowFact && (
        <View style={styles.wowFactBox}>
          <Text style={styles.wowFactText}>{post.wowFact}</Text>
        </View>
      )}

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <View style={styles.chainContainer}>
          {post.relatedPostId && post.relatedPostTitle && (
            <TouchableOpacity
              onPress={() => onChain(post.relatedPostId!)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.chainButton}>
                → {post.relatedPostTitle}
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
            size={24}
            color={Colors.accent}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  topicTag: {
    fontSize: Typography.xs,
    color: Colors.accent,
    fontWeight: '600',
  },
  title: {
    fontSize: Typography['3xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: Typography['3xl'] * 1.2,
    marginTop: Spacing['2xl'],
  },
  content: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    lineHeight: Typography.base * 1.6,
    flex: 1,
    marginTop: Spacing.xl,
  },
  wowFactBox: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    backgroundColor: Colors.accentLight,
    padding: Spacing.md,
    marginTop: Spacing.xl,
  },
  wowFactText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: Typography.sm * 1.5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  chainContainer: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  chainButton: {
    fontSize: Typography.base,
    color: Colors.accent,
    fontWeight: '600',
  },
});
