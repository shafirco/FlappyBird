import { Image, StyleSheet, View } from "react-native";
import { FLOOR_HEIGHT, SCREEN_WIDTH } from "../game/constants";

const GROUND_IMAGE = require("../../assets/images/ground.png");

type Props = { offset: number };

export function GameGround({ offset }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.groundEdge} />
      <Image
        source={GROUND_IMAGE}
        style={[styles.strip, { left: offset }]}
        resizeMode="stretch"
      />
      <Image
        source={GROUND_IMAGE}
        style={[styles.strip, { left: offset + SCREEN_WIDTH }]}
        resizeMode="stretch"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH,
    height: FLOOR_HEIGHT,
    overflow: "hidden",
    zIndex: 10,
  },
  groundEdge: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.15)",
    zIndex: 11,
  },
  strip: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH,
    height: FLOOR_HEIGHT,
  },
});
