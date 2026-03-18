const HIGH_SCORES_KEY = "@flappy_high_scores";
const MAX_ENTRIES = 5;

export type HighScoreEntry = { score: number; date: number };

let AsyncStorage: typeof import("@react-native-async-storage/async-storage").default | null = null;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {
  // fallback in-memory if not installed
}

const memoryStore: number[] = [];

export async function getHighScores(): Promise<HighScoreEntry[]> {
  if (AsyncStorage) {
    try {
      const raw = await AsyncStorage.getItem(HIGH_SCORES_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("getHighScores", e);
    }
  }
  return memoryStore.slice(0, MAX_ENTRIES).map((score, i) => ({ score, date: Date.now() - i * 86400000 }));
}

export async function addHighScore(score: number): Promise<HighScoreEntry[]> {
  const list = await getHighScores();
  const next: HighScoreEntry[] = [...list, { score, date: Date.now() }]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  if (AsyncStorage) {
    try {
      await AsyncStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("addHighScore", e);
    }
  } else {
    memoryStore.length = 0;
    next.forEach((e) => memoryStore.push(e.score));
  }
  return next;
}
