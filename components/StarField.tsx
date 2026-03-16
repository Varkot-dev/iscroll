import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  initialOpacity: number;
  duration: number;
  delay: number;
};

function StarDot({ star }: { star: Star }) {
  const opacity = useSharedValue(star.initialOpacity);

  useEffect(() => {
    opacity.value = withDelay(
      star.delay,
      withRepeat(
        withSequence(
          withTiming(star.initialOpacity * 0.2, { duration: star.duration / 2 }),
          withTiming(star.initialOpacity, { duration: star.duration / 2 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: star.color,
        },
        animatedStyle,
      ]}
    />
  );
}

const STAR_COLORS = ['#ffffff', '#ffffff', '#ffffff', '#c8d8f0', '#c8d8f0', '#6070a0'];

export function StarField() {
  const { width, height } = useWindowDimensions();

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      initialOpacity: Math.random() * 0.7 + 0.3,
      duration: Math.random() * 4000 + 2000,
      delay: Math.random() * 3000,
    }));
  }, [width, height]);

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#0a0a0f' }]} pointerEvents="none">
      {stars.map(star => (
        <StarDot key={star.id} star={star} />
      ))}
    </View>
  );
}
