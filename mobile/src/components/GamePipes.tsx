import { Image, StyleSheet, View } from "react-native";
import {
  FLOOR_HEIGHT,
  PIPE_GAP,
  PIPE_WIDTH,
  SCREEN_HEIGHT,
} from "../game/constants";
import type { Pipe } from "../game/types";

const PIPE_IMAGE = require("../../assets/images/pipe.png");

type Props = { pipes: Pipe[] };

export function GamePipes({ pipes }: Props) {
  return (
    <View style={styles.container} pointerEvents="none">
      {pipes.map((pipe) => {
        const bottomPipeHeight =
          SCREEN_HEIGHT - FLOOR_HEIGHT - (pipe.height + PIPE_GAP);
        return (
          <View key={pipe.id} style={styles.pipeWrap}>
            <Image
              source={PIPE_IMAGE}
              style={[
                styles.pipe,
                styles.bottomPipe,
                {
                  left: pipe.x,
                  top: 0,
                  height: pipe.height,
                },
              ]}
              resizeMode="stretch"
            />
            <Image
              source={PIPE_IMAGE}
              style={[
                styles.pipe,
                {
                  left: pipe.x,
                  top: pipe.height + PIPE_GAP,
                  height: bottomPipeHeight,
                },
              ]}
              resizeMode="stretch"
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 22,
  },
  pipeWrap: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  pipe: {
    position: "absolute",
    width: PIPE_WIDTH,
  },
  bottomPipe: {
    transform: [{ rotate: "180deg" }],
  },
});
