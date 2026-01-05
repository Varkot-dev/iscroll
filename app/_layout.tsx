/**
 * ROOT LAYOUT - The skeleton of the entire app
 * 
 * This file wraps ALL screens in your app. Think of it as the "frame"
 * that holds everything together.
 * 
 * KEY CONCEPTS:
 * - Stack Navigator: Screens "stack" on top of each other like cards
 * - When you navigate to a new screen, it slides in from the right
 * - When you go back, it slides out to the right
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    // Main container with dark background
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* 
        StatusBar: The top bar showing time, battery, etc.
        style="light" means white text (for dark backgrounds)
      */}
      <StatusBar style="light" />
      
      {/* 
        Stack Navigator: Manages screen transitions
        - "(tabs)" is a special route that contains our tab navigation
        - "rabbit-hole/[id]" displays a rabbit hole with its episodes
        - "episode/[id]" displays individual episode content
        - "thread/[id]" is legacy route for Wikipedia articles
      */}
      <Stack
        screenOptions={{
          // Don't show the default header - we'll make our own
          headerShown: false,
          // Dark background for the navigation area
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        {/* 
          The tabs screen - this contains our bottom tab navigation
          name="(tabs)" refers to the folder app/(tabs)/
        */}
        <Stack.Screen name="(tabs)" />
        
        {/* 
          Rabbit Hole screen - shows the full rabbit hole with episodes
          [id] captures the rabbit hole ID from the URL
          Example: /rabbit-hole/abc-123 → id = "abc-123"
        */}
        <Stack.Screen 
          name="rabbit-hole/[id]" 
          options={{
            gestureEnabled: true,
            animation: 'slide_from_right',
          }}
        />
        
        {/* 
          Episode screen - for reading full episode content
          [id] captures the episode ID from the URL
          Example: /episode/xyz-456 → id = "xyz-456"
        */}
        <Stack.Screen 
          name="episode/[id]" 
          options={{
            gestureEnabled: true,
            animation: 'slide_from_right',
          }}
        />
        
        {/* 
          Thread screen - legacy route for Wikipedia articles
          Kept for backward compatibility
          [id] is a dynamic segment
          Example: /thread/12345 → id = "12345"
        */}
        <Stack.Screen 
          name="thread/[id]" 
          options={{
            gestureEnabled: true,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </View>
  );
}
