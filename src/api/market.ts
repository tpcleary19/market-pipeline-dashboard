
import type { LatestTrade, HistoricalTrade } from "../types/market";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getHealth(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.ok;
}

export function getLatestTrade(symbol: string): Promise<LatestTrade> {
  return getJson<LatestTrade>(`/prices/${encodeURIComponent(symbol)}`);
}

export function getHistoricalTrades(
  symbol: string,
  limit = 10
): Promise<HistoricalTrade[]> {
  return getJson<HistoricalTrade[]>(
    `/trades/${encodeURIComponent(symbol)}?limit=${limit}`
  );
}
