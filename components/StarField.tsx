import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';

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

const STAR_COLORS = ['#ffffff', '#ffffff', '#ffffff', '#c8d8f0', '#c8d8f0', '#6070a0'];

function StarDot({ star }: { star: Star }) {
  const opacity = useRef(new Animated.Value(star.initialOpacity)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(star.delay),
        Animated.timing(opacity, {
          toValue: star.initialOpacity * 0.15,
          duration: star.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: star.initialOpacity,
          duration: star.duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: star.x,
        top: star.y,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: star.color,
        opacity,
      }}
    />
  );
}

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
    <View
      style={[StyleSheet.absoluteFillObject, { backgroundColor: '#0a0a0f' }]}
      pointerEvents="none"
    >
      {stars.map(star => (
        <StarDot key={star.id} star={star} />
      ))}
    </View>
  );
}
