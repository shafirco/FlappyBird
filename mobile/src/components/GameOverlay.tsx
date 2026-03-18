import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  MEDAL_BRONZE,
  MEDAL_GOLD,
  MEDAL_PLATINUM,
  MEDAL_SILVER,
  SCREEN_HEIGHT,
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

function formatDate(ts: number): string {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

type Props = {
  score: number;
  gameOver: boolean;
  highScores: HighScoreEntry[];
  globalLeaderboard: LeaderboardEntry[];
  loadingLeaderboard: boolean;
  apiBase: string;
  leaderboardError: string | null;
  onRefreshLeaderboard: () => void;
  submitError: string | null;
  playerName: string | null;
  sfxMuted: boolean;
  bgMuted: boolean;
  onToggleSfx: () => void;
  onToggleBg: () => void;
  onRestart: () => void;
};

export function GameOverlay({
  score,
  gameOver,
  highScores,
  globalLeaderboard,
  loadingLeaderboard,
  apiBase,
  leaderboardError,
  onRefreshLeaderboard,
  submitError,
  playerName,
  sfxMuted,
  bgMuted,
  onToggleSfx,
  onToggleBg,
  onRestart,
}: Props) {
  const scoreScale = useRef(new Animated.Value(1)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const [prevScore, setPrevScore] = useState(score);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMyBestModal, setShowMyBestModal] = useState(false);

  useEffect(() => {
    if (!gameOver) {
      setShowMyBestModal(false);
      setShowLeaderboard(false);
    }
  }, [gameOver]);

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

      {showLeaderboard && (
        <View style={styles.modalBackdrop} pointerEvents="box-none">
          <View style={styles.modalPanel}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Global Leaderboard</Text>
              <Pressable
                onPress={() => setShowLeaderboard(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>

            {/* no API / player debug info in production UI */}

            {loadingLeaderboard ? (
              <Text style={styles.modalLoading}>Loading...</Text>
            ) : leaderboardError ? (
              <Text style={styles.modalError}>{leaderboardError}</Text>
            ) : globalLeaderboard.length === 0 ? (
              <Text style={styles.modalLoading}>No scores yet</Text>
            ) : (
              <ScrollView
                style={styles.table}
                contentContainerStyle={styles.tableContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.tableHeaderRow}>
                  <View style={styles.rankCircleHeader}>
                    <Text style={styles.rankCircleHeaderText} numberOfLines={1}>
                      Rank
                    </Text>
                  </View>
                  <Text style={styles.headerName} numberOfLines={1}>
                    Name
                  </Text>
                  <Text style={styles.tableHeaderCellRightScore}>Score</Text>
                  <Text style={styles.tableHeaderCellRightDate}>Date</Text>
                </View>

                {globalLeaderboard.slice(0, 100).map((e, i) => (
                  <View
                    key={e.rank + e.date}
                    style={[
                      styles.row,
                      i % 2 === 0 ? styles.rowEven : styles.rowOdd,
                    ]}
                  >
                    <View style={styles.rankCircle}>
                      <Text style={styles.rankCircleText}>{e.rank}</Text>
                    </View>
                      <Text style={[styles.name, styles.colName]} numberOfLines={1}>
                      {e.name}
                    </Text>
                    <Text style={[styles.scoreCell, styles.colRight]}>{e.score}</Text>
                    <Text style={[styles.dateCell, styles.colRight]}>
                      {formatDate(e.date)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <Pressable
              onPress={onRefreshLeaderboard}
              style={({ pressed }) => [
                styles.refreshPill,
                pressed && styles.refreshPillPressed,
              ]}
            >
              <Text style={styles.refreshPillText}>Refresh</Text>
            </Pressable>
          </View>
        </View>
      )}

      {showMyBestModal && (
        <View style={styles.modalBackdrop} pointerEvents="box-none">
          <View style={styles.modalPanel}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Best</Text>
              <Pressable
                onPress={() => setShowMyBestModal(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.table}
              contentContainerStyle={styles.tableContent}
              showsVerticalScrollIndicator={false}
            >
              {highScores.length === 0 ? (
                <Text style={styles.modalLoading}>No local scores yet</Text>
              ) : (
                <>
                  <View style={styles.tableHeaderRow}>
                    <View style={styles.rankCircleHeader}>
                      <Text
                        style={styles.rankCircleHeaderText}
                        numberOfLines={1}
                      >
                        Rank
                      </Text>
                    </View>
                    <Text style={styles.tableHeaderCellRightScore}>Score</Text>
                    <Text style={styles.tableHeaderCellRightDate}>Date</Text>
                  </View>

                  {highScores.slice(0, 100).map((e, i) => (
                    <View
                      key={e.date + i}
                      style={[
                        styles.row,
                        i % 2 === 0 ? styles.rowEven : styles.rowOdd,
                      ]}
                    >
                      <View style={styles.rankCircle}>
                        <Text style={styles.rankCircleText}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.scoreCell, styles.colRight]}>
                        {e.score}
                      </Text>
                      <Text style={[styles.dateCell, styles.colRight]}>
                        {formatDate(e.date)}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      )}

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
              <View style={styles.gameOverHeaderRow}>
                <Text style={styles.gameOverText}>Game Over</Text>
                <View style={styles.soundToggleGroup}>
                  <Pressable
                    onPress={onToggleSfx}
                    style={({ pressed }) => [
                      styles.soundToggleButton,
                      pressed && styles.soundToggleButtonPressed,
                    ]}
                  >
                    <Text style={styles.soundToggleButtonText}>
                      SFX: {sfxMuted ? "OFF" : "ON"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={onToggleBg}
                    style={({ pressed }) => [
                      styles.soundToggleButton,
                      pressed && styles.soundToggleButtonPressed,
                      { backgroundColor: "rgba(255,216,77,0.22)" },
                    ]}
                  >
                    <Text style={styles.soundToggleButtonText}>
                      Music: {bgMuted ? "OFF" : "ON"}
                    </Text>
                  </Pressable>
                </View>
              </View>
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

              <Pressable
                onPress={() => setShowMyBestModal(true)}
                style={({ pressed }) => [
                  styles.myBestToggleButton,
                  pressed && styles.myBestToggleButtonPressed,
                ]}
              >
                <Text style={styles.myBestToggleButtonText}>My Best</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowLeaderboard(true)}
                style={({ pressed }) => [
                  styles.leaderboardInsidePanelButton,
                  pressed && styles.leaderboardInsidePanelButtonPressed,
                ]}
              >
                <Text style={styles.leaderboardInsidePanelButtonText}>
                  Leaderboard
                </Text>
              </Pressable>

              {!!submitError && (
                <Text style={styles.submitError}>{submitError}</Text>
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
    maxHeight: SCREEN_HEIGHT * 0.48,
  },
  panelScroll: { maxHeight: SCREEN_HEIGHT * 0.55 },
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
  leaderboardError: { fontSize: 11, color: "#c62828", marginTop: 6 },
  globalRow: { fontSize: 13, color: "#333", marginTop: 2 },
  refreshButton: { marginTop: 8, alignSelf: "flex-start" },
  refreshButtonText: { fontSize: 12, color: "#666" },
  submitError: { fontSize: 11, color: "#c62828", marginTop: 4 },
  leaderboardButton: {
    position: "absolute",
    top: 36,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.28)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    zIndex: 31,
  },
  leaderboardButtonPressed: {
    opacity: 0.85,
  },
  leaderboardButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  myBestToggleButton: {
    marginTop: 14,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  myBestToggleButtonPressed: { opacity: 0.85 },
  myBestToggleButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
  },
  myBestTableWrap: {
    marginTop: 14,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  myBestHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  myBestHeaderTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
  },
  closeSmallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  closeSmallButtonPressed: { opacity: 0.85 },
  closeSmallButtonText: { fontSize: 12, fontWeight: "900", color: "#333" },
  tabLeaderboardButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "#ffd84d",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabLeaderboardButtonPressed: { opacity: 0.9 },
  tabLeaderboardButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#1a1a1a",
  },
  leaderboardInsidePanelButton: {
    marginTop: 14,
    width: "100%",
    backgroundColor: "#ffd84d",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  leaderboardInsidePanelButtonPressed: { opacity: 0.9 },
  leaderboardInsidePanelButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1a1a1a",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 90,
  },
  modalPanel: {
    width: "92%",
    maxWidth: 520,
    maxHeight: "80%",
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  closeButtonPressed: { opacity: 0.85 },
  closeButtonText: { fontSize: 12, fontWeight: "800", color: "#333" },
  modalHint: { marginTop: 6, fontSize: 11, color: "#666" },
  modalLoading: { marginTop: 12, fontSize: 12, color: "#666" },
  modalError: { marginTop: 12, fontSize: 12, color: "#c62828" },
  table: { marginTop: 10 },
  tableContent: { paddingBottom: 12 },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,216,77,0.18)",
    borderRadius: 12,
    marginBottom: 6,
  },
  tableHeaderCell: {
    width: 52,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
    color: "#333",
  },
  tableHeaderCellRank: {
    width: 28,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "900",
    color: "#333",
  },
  rankCircleHeader: {
    width: 31,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  rankCircleHeaderText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#333",
  },
  headerName: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: 12,
    fontWeight: "900",
    color: "#333",
    textAlign: "left",
  },
  tableHeaderCellName: {
    flex: 1,
    paddingRight: 8,
    fontSize: 12,
    fontWeight: "900",
    color: "#333",
    textAlign: "left",
  },
  tableHeaderCellRightScore: {
    width: 60,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "900",
    color: "#333",
  },
  tableHeaderCellRightDate: {
    width: 75,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "900",
    color: "#333",
  },
  // Gives a small visual gap from the rank circle.
  colName: { flex: 1, paddingLeft: 8, paddingRight: 8 },
  colRight: { textAlign: "right" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  rowEven: { backgroundColor: "rgba(0,0,0,0.02)" },
  rowOdd: { backgroundColor: "transparent" },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,216,77,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  rankCircleText: { fontWeight: "900", color: "#1a1a1a", fontSize: 12 },
  name: { flex: 1, color: "#111", fontWeight: "700" },
  scoreCell: { width: 60, textAlign: "right", fontWeight: "900", color: "#111" },
  dateCell: {
    width: 84,
    textAlign: "right",
    fontWeight: "800",
    color: "#333",
    fontSize: 12,
  },
  refreshPill: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  refreshPillPressed: { opacity: 0.85 },
  refreshPillText: { fontSize: 12, fontWeight: "800", color: "#333" },
  gameOverText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#c62828",
  },
  gameOverHeaderRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  soundToggleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  soundToggleButton: {
    backgroundColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 8,
  },
  soundToggleButtonPressed: { opacity: 0.85 },
  soundToggleButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#1a1a1a",
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
