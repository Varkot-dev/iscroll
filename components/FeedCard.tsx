/**
 * FEED CARD COMPONENT
 * 
 * Displays a single article in the scrolling feed.
 * Users tap to view the full thread.
 * 
 * PROPS (data passed from parent):
 * - item: The article data (FeedItem type)
 * - onPress: Function called when card is tapped
 * - onBookmark: Function called when bookmark button is tapped
 * 
 * KEY CONCEPTS:
 * - TouchableOpacity: Button that fades when pressed
 * - Props: Data passed from parent component
 * - Conditional rendering: {condition && <Component />}
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedItem } from '@/types';
import { truncateText } from '@/lib/wikipedia';

// Get screen width for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// PROPS TYPE DEFINITION
// ============================================
// Define what data this component expects to receive

type FeedCardProps = {
  item: FeedItem;
  onPress: () => void;
  onBookmark?: () => void;
  isSaved?: boolean;
};

// ============================================
// COMPONENT
// ============================================

export function FeedCard({ item, onPress, onBookmark, isSaved = false }: FeedCardProps) {
  return (
    // TouchableOpacity makes the whole card tappable
    // activeOpacity controls how faded it gets when pressed (0-1)
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Card content container */}
      <View style={styles.content}>
        {/* Text section */}
        <View style={styles.textContainer}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          
          {/* Extract (summary) - truncated to fit */}
          <Text style={styles.extract} numberOfLines={4}>
            {truncateText(item.extract, 150)}
          </Text>
          
          {/* Footer with action button */}
          <View style={styles.footer}>
            <Text style={styles.tapHint}>Tap to read more</Text>
            
            {/* Bookmark button */}
            {onBookmark && (
              <TouchableOpacity
                onPress={(e) => {
                  // Stop the tap from also triggering card press
                  e.stopPropagation();
                  onBookmark();
                }}
                style={styles.bookmarkButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={isSaved ? '#22c55e' : '#666666'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Thumbnail image (if available) */}
        {item.thumbnailUrl && (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
      </View>
      
      {/* Subtle gradient overlay at bottom for depth */}
      <View style={styles.bottomGradient} />
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141414',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden', // Clips content to rounded corners
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    
    // Shadow for Android
    elevation: 4,
  },
  content: {
    flexDirection: 'row', // Arrange children horizontally
    padding: 16,
  },
  textContainer: {
    flex: 1, // Take up remaining space
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 24,
  },
  extract: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto', // Push to bottom
  },
  tapHint: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 4,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#2a2a2a', // Placeholder color while loading
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#22c55e',
    opacity: 0.3,
  },
});
