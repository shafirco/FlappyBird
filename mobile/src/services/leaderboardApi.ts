/**
 * Backend URL. Set EXPO_PUBLIC_API_URL in .env or when building for production.
 * - Local: http://localhost:3000
 * - Android emulator: http://10.0.2.2:3000
 * - Physical device / production: your deployed URL (e.g. https://xxx.railway.app)
 */
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  date: number;
};

export function getApiBase(): string {
  return API_BASE;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}/api/scores`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Leaderboard GET failed (${res.status}) ${text || `${API_BASE}/api/scores`}`
    );
  }
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
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Leaderboard POST failed (${res.status}) ${errText || `${API_BASE}/api/scores`}`
    );
  }
  const data = await res.json();
  return data.scores || [];
}
