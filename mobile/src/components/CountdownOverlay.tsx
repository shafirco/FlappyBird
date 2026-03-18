import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const STEPS = [3, 2, 1];
const STEP_MS = 800;
const GO_MS = 500;

type Props = {
  onFinish: () => void;
};

export function CountdownOverlay({ onFinish }: Props) {
  const [step, setStep] = useState(0);
  const [showGo, setShowGo] = useState(false);

  useEffect(() => {
    if (step < STEPS.length) {
      const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
      return () => clearTimeout(t);
    }
    setShowGo(true);
    const t = setTimeout(() => {
      onFinish();
    }, GO_MS);
    return () => clearTimeout(t);
  }, [step, onFinish]);

  if (showGo) {
    return (
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.goText}>GO!</Text>
      </View>
    );
  }
  if (step >= STEPS.length) return null;
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Text style={styles.countText}>{STEPS[step]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 60,
  },
  countText: {
    fontSize: 120,
    fontWeight: "bold",
    color: "#fff",
  },
  goText: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#ffc107",
  },
});
