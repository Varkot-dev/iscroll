/**
 * TAB NAVIGATION LAYOUT
 * 
 * This creates the bottom tab bar with two tabs:
 * 1. Feed (home) - Main scrolling content
 * 2. Saved (bookmark) - Bookmarked articles
 * 
 * KEY CONCEPTS:
 * - Tabs component creates the bottom navigation
 * - Each Tabs.Screen defines a tab and its appearance
 * - tabBarIcon receives { focused, color } to show active/inactive states
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Don't show headers - we'll design our own in each screen
        headerShown: false,
        
        // Tab bar styling - dark theme to match the app
        tabBarStyle: {
          backgroundColor: '#0a0a0a',     // Dark background
          borderTopColor: '#1a1a1a',      // Subtle border
          borderTopWidth: 1,
          height: 85,                      // Taller for modern look
          paddingBottom: 25,               // Space for home indicator on iPhone
          paddingTop: 10,
        },
        
        // Active tab color (when selected)
        tabBarActiveTintColor: '#22c55e',  // Green - matches our accent color
        
        // Inactive tab color (when not selected)
        tabBarInactiveTintColor: '#666666', // Gray
        
        // Label styling
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* 
        FEED TAB - The main home screen
        index.tsx in (tabs) folder = the default/first tab
      */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          // tabBarIcon receives props: { focused, color, size }
          // focused: boolean - is this tab currently active?
          // color: string - the tint color based on active/inactive
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              // Different icon when focused vs not focused
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 
        SAVED TAB - Bookmarked articles
        saved.tsx in (tabs) folder
      */}
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
