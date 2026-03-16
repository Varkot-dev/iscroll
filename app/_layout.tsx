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
        - "post/[id]" displays full post content
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

      </Stack>
    </View>
  );
}
