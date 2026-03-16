import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Post } from '@/types';
import { Colors, Typography, Spacing } from '@/constants/colors';

export default function PostDetailScreen() {
  const { post: postJson } = useLocalSearchParams<{ id: string; post: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const post: Post = JSON.parse(postJson);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={20} color={Colors.accent} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['3xl'] }]}
        showsVerticalScrollIndicator={false}
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
        <Text style={styles.body}>{post.content}</Text>

        {/* Subtopics — DIVE DEEPER */}
        {post.subtopics && post.subtopics.length > 0 && (
          <View style={styles.subtopicsSection}>
            <Text style={styles.subtopicsLabel}>DIVE DEEPER</Text>
            <View style={styles.subtopicsRow}>
              {post.subtopics.map(sub => (
                <View key={sub} style={styles.subtopicPill}>
                  <Text style={styles.subtopicText}>{sub}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SIGNAL callout */}
        {post.wowFact && (
          <View style={styles.wowFactBox}>
            <Text style={styles.wowFactLabel}>SIGNAL</Text>
            <Text style={styles.wowFactText}>{post.wowFact}</Text>
          </View>
        )}

        {/* Source link */}
        {post.sourceUrl && (
          <TouchableOpacity
            style={styles.sourceButton}
            onPress={() => Linking.openURL(post.sourceUrl!)}
          >
            <Text style={styles.sourceButtonText}>Read original source →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backText: {
    fontSize: Typography.base,
    color: Colors.accent,
    fontWeight: Typography.medium,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  topicPill: {
    borderWidth: 1,
    borderColor: 'rgba(168, 184, 216, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topicText: {
    fontSize: Typography.xs,
    color: Colors.accent,
    letterSpacing: 1.5,
    fontWeight: Typography.semibold,
  },
  title: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    lineHeight: Typography['3xl'] * 1.2,
    marginBottom: Spacing.xl,
  },
  body: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * 1.6,
    marginBottom: Spacing['2xl'],
  },
  subtopicsSection: {
    marginBottom: Spacing['2xl'],
  },
  subtopicsLabel: {
    fontSize: Typography.xs,
    color: Colors.accent,
    letterSpacing: 2,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.md,
  },
  subtopicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  subtopicPill: {
    backgroundColor: Colors.accentLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  subtopicText: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.medium,
  },
  wowFactBox: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    backgroundColor: Colors.accentGlow,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing['2xl'],
  },
  wowFactLabel: {
    fontSize: Typography.xs,
    color: Colors.accent,
    letterSpacing: 2,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.sm,
  },
  wowFactText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: Typography.sm * 1.6,
  },
  sourceButton: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 20,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignSelf: 'flex-start',
  },
  sourceButtonText: {
    fontSize: Typography.base,
    color: Colors.accent,
    fontWeight: Typography.medium,
  },
});
