/**
 * Backend URL. Set EXPO_PUBLIC_API_URL in .env or when building for production.
 * - Local: http://localhost:3000
 * - Android emulator: http://10.0.2.2:3000
 * - Physical device / production: your deployed URL (e.g. https://xxx.railway.app)
 */
const API_BASE =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "http://localhost:3000";

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  date: number;
};

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}/api/scores`);
  if (!res.ok) throw new Error("Failed to load leaderboard");
  const data = await res.json();
  return data.scores || [];
}

export async function submitToLeaderboard(
  name: string,
  score: number
): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}/api/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim().slice(0, 20) || "Player", score }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to submit score");
  }
  const data = await res.json();
  return data.scores || [];
}
