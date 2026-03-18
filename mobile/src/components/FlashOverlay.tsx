import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = { trigger: boolean };

export function FlashOverlay({ trigger }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    opacity.setValue(1);
    Animated.timing(opacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [trigger, opacity]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.flash, { opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  flash: {
    backgroundColor: "#fff",
    zIndex: 50,
  },
});
