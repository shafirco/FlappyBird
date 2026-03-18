import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { BIRD_SIZE, BIRD_X } from "../game/constants";

const COUNT = 14;
const DURATION = 600;

type Particle = { id: number; x: number; y: number; size: number };

function ParticleDot({
  x,
  y,
  size,
}: {
  x: number;
  y: number;
  size: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: DURATION,
      useNativeDriver: true,
    }).start();
  }, [anim]);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ scale }, { translateY }],
        },
      ]}
    />
  );
}

type Props = {
  active: boolean;
  birdY: number;
};

export function DeathParticles({ active, birdY }: Props) {
  const cx = BIRD_X + BIRD_SIZE / 2;
  const cy = birdY + BIRD_SIZE / 2;
  const particlesRef = useRef<Particle[]>([]);
  if (active && particlesRef.current.length === 0) {
    particlesRef.current = Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      x: cx + (Math.random() - 0.5) * BIRD_SIZE,
      y: cy + (Math.random() - 0.5) * BIRD_SIZE,
      size: 6 + Math.random() * 8,
    }));
  }
  if (!active) {
    particlesRef.current = [];
    return null;
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particlesRef.current.map((p) => (
        <ParticleDot key={p.id} x={p.x} y={p.y} size={p.size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    backgroundColor: "rgba(255,220,100,0.95)",
  },
});
