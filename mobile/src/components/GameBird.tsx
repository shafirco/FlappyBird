import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet } from "react-native";
import { BIRD_SIZE, BIRD_X } from "../game/constants";

const BIRD_IMAGE = require("../../assets/images/bird.png");

const WING_FRAME_DEG = [-12, 0, 12];
const WING_INTERVAL_MS = 90;

type Props = {
  birdY: number;
  birdRotation: number;
  squishTrigger: number;
  gameOver: boolean;
};

export function GameBird({ birdY, birdRotation, squishTrigger, gameOver }: Props) {
  const [wingFrame, setWingFrame] = useState(0);
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (gameOver) return;
    const t = setInterval(() => {
      setWingFrame((f) => (f + 1) % 3);
    }, WING_INTERVAL_MS);
    return () => clearInterval(t);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || squishTrigger === 0) return;
    scaleX.setValue(1.2);
    scaleY.setValue(0.82);
    Animated.parallel([
      Animated.timing(scaleX, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleY, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [squishTrigger, gameOver, scaleX, scaleY]);

  const rotation = birdRotation + WING_FRAME_DEG[wingFrame];

  return (
    <Animated.Image
      source={BIRD_IMAGE}
      style={[
        styles.bird,
        {
          top: birdY,
          transform: [
            { scaleX },
            { scaleY },
            { rotate: `${rotation}deg` },
          ],
        },
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  bird: {
    position: "absolute",
    left: BIRD_X,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    zIndex: 20,
  },
});
