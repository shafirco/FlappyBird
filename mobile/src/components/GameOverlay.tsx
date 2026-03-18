import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  MEDAL_BRONZE,
  MEDAL_GOLD,
  MEDAL_PLATINUM,
  MEDAL_SILVER,
} from "../game/constants";
import type { HighScoreEntry } from "../services/highScores";
import type { LeaderboardEntry } from "../services/leaderboardApi";

function getMedal(score: number): string {
  if (score >= MEDAL_PLATINUM) return "PLATINUM";
  if (score >= MEDAL_GOLD) return "GOLD";
  if (score >= MEDAL_SILVER) return "SILVER";
  return "BRONZE";
}

const MEDAL_COLORS: Record<string, string> = {
  BRONZE: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#ffd700",
  PLATINUM: "#e5e4e2",
};

type Props = {
  score: number;
  gameOver: boolean;
  highScores: HighScoreEntry[];
  globalLeaderboard: LeaderboardEntry[];
  loadingLeaderboard: boolean;
  onRefreshLeaderboard: () => void;
  onSubmitToLeaderboard: (name: string) => Promise<void>;
  submitStatus: "idle" | "loading" | "done" | "error";
  submitError: string | null;
  onRestart: () => void;
};

export function GameOverlay({
  score,
  gameOver,
  highScores,
  globalLeaderboard,
  loadingLeaderboard,
  onRefreshLeaderboard,
  onSubmitToLeaderboard,
  submitStatus,
  submitError,
  onRestart,
}: Props) {
  const scoreScale = useRef(new Animated.Value(1)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const [prevScore, setPrevScore] = useState(score);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    if (score > prevScore) {
      setPrevScore(score);
      scoreScale.setValue(1.4);
      Animated.spring(scoreScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 16,
        bounciness: 6,
      }).start();
    }
  }, [score, prevScore, scoreScale]);

  useEffect(() => {
    if (!gameOver) return;
    const seq = [0, 1, 0, -1, 0];
    const anims = seq.map((v, i) =>
      Animated.timing(shakeX, {
        toValue: v,
        duration: 40,
        useNativeDriver: true,
      })
    );
    shakeX.setValue(0);
    Animated.sequence(anims).start();
  }, [gameOver, shakeX]);

  const shakeTranslate = shakeX.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-8, 0, 8],
  });

  const medal = gameOver ? getMedal(score) : null;

  const handleSubmit = () => {
    onSubmitToLeaderboard(playerName.trim() || "Player");
  };

  return (
    <>
      <Animated.View
        style={[
          styles.scoreWrap,
          {
            transform: [{ scale: scoreScale }],
          },
        ]}
      >
        <Text style={styles.score}>{score}</Text>
      </Animated.View>

      {gameOver && (
        <Animated.View
          style={[
            styles.backdrop,
            { transform: [{ translateX: shakeTranslate }] },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.gameOverPanel}>
            <ScrollView
              style={styles.panelScroll}
              contentContainerStyle={styles.panelScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.gameOverText}>Game Over</Text>
              {medal && (
                <View
                  style={[
                    styles.medalBadge,
                    { backgroundColor: MEDAL_COLORS[medal] || "#999" },
                  ]}
                >
                  <Text style={styles.medalText}>{medal}</Text>
                </View>
              )}
              <Text style={styles.finalScore}>Score: {score}</Text>

              {highScores.length > 0 && (
                <View style={styles.highScoresBox}>
                  <Text style={styles.highScoresTitle}>My Best</Text>
                  {highScores.slice(0, 5).map((e, i) => (
                    <Text key={e.date + i} style={styles.highScoreRow}>
                      #{i + 1} {e.score}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.leaderboardSection}>
                <Text style={styles.highScoresTitle}>Global Leaderboard</Text>
                {loadingLeaderboard ? (
                  <Text style={styles.leaderboardHint}>Loading...</Text>
                ) : globalLeaderboard.length === 0 ? (
                  <Text style={styles.leaderboardHint}>No scores yet</Text>
                ) : (
                  globalLeaderboard.slice(0, 10).map((e) => (
                    <Text key={e.rank + e.date} style={styles.globalRow}>
                      #{e.rank} {e.name} — {e.score}
                    </Text>
                  ))
                )}
                <Pressable
                  onPress={onRefreshLeaderboard}
                  style={styles.refreshButton}
                >
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </Pressable>
              </View>

              {submitStatus !== "done" && (
                <View style={styles.submitSection}>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Your name"
                    placeholderTextColor="#999"
                    value={playerName}
                    onChangeText={setPlayerName}
                    maxLength={20}
                    editable={submitStatus !== "loading"}
                  />
                  <Pressable
                    onPress={handleSubmit}
                    disabled={submitStatus === "loading"}
                    style={[
                      styles.submitButton,
                      submitStatus === "loading" && styles.submitButtonDisabled,
                    ]}
                  >
                    <Text style={styles.restartText}>
                      {submitStatus === "loading" ? "..." : "Submit Score"}
                    </Text>
                  </Pressable>
                  {submitStatus === "error" && submitError && (
                    <Text style={styles.submitError}>{submitError}</Text>
                  )}
                </View>
              )}
              {submitStatus === "done" && (
                <Text style={styles.submitDone}>Submitted!</Text>
              )}
            </ScrollView>
            <Pressable
              style={({ pressed }) => [
                styles.restartButton,
                pressed && styles.restartButtonPressed,
              ]}
              onPress={onRestart}
            >
              <Text style={styles.restartText}>Restart</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scoreWrap: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 30,
  },
  score: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 40,
  },
  gameOverPanel: {
    backgroundColor: "rgba(255,255,255,0.98)",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 260,
    maxHeight: "80%",
  },
  panelScroll: { maxHeight: 340 },
  panelScrollContent: { paddingBottom: 12 },
  leaderboardSection: {
    marginTop: 12,
    alignSelf: "stretch",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 8,
  },
  leaderboardHint: { fontSize: 12, color: "#888", marginTop: 4 },
  globalRow: { fontSize: 13, color: "#333", marginTop: 2 },
  refreshButton: { marginTop: 8, alignSelf: "flex-start" },
  refreshButtonText: { fontSize: 12, color: "#666" },
  submitSection: { marginTop: 12, alignSelf: "stretch" },
  nameInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitError: { fontSize: 11, color: "#c62828", marginTop: 4 },
  submitDone: { fontSize: 14, color: "#2e7d32", marginTop: 8 },
  gameOverText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#c62828",
  },
  medalBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  medalText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  finalScore: {
    marginTop: 8,
    fontSize: 18,
    color: "#333",
  },
  highScoresBox: {
    marginTop: 14,
    alignSelf: "stretch",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 8,
  },
  highScoresTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
  },
  highScoreRow: {
    fontSize: 14,
    color: "#333",
  },
  restartButton: {
    marginTop: 20,
    backgroundColor: "#ffc107",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  restartButtonPressed: {
    opacity: 0.9,
  },
  restartText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
});
