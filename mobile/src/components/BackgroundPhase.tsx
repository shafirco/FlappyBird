import { StyleSheet, View } from "react-native";
import { PHASE_NIGHT, PHASE_SUNSET, SCREEN_HEIGHT, SCREEN_WIDTH } from "../game/constants";

type Props = { score: number };

const STAR_POSITIONS = [
  [0.15, 0.12], [0.45, 0.08], [0.72, 0.15], [0.88, 0.06],
  [0.22, 0.28], [0.6, 0.22], [0.35, 0.18], [0.78, 0.32],
  [0.08, 0.2], [0.55, 0.1], [0.9, 0.25],
];

export function BackgroundPhase({ score }: Props) {
  const isNight = score >= PHASE_NIGHT;
  const isSunset = score >= PHASE_SUNSET && !isNight;

  let overlayColor = "transparent";
  if (isSunset) overlayColor = "rgba(255,140,60,0.25)";
  if (isNight) overlayColor = "rgba(20,25,60,0.7)";

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: overlayColor },
        ]}
      />
      {isNight && (
        <>
          <View
            style={[
              styles.moon,
              {
                left: SCREEN_WIDTH * 0.72,
                top: SCREEN_HEIGHT * 0.12,
              },
            ]}
          />
          {STAR_POSITIONS.map(([x, y], i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  left: SCREEN_WIDTH * Number(x),
                  top: SCREEN_HEIGHT * Number(y),
                },
              ]}
            />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  moon: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,248,220,0.95)",
  },
  star: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
});
