
import type {
  LatestTrade,
  HistoricalTrade,
  InvestigationSummary,
  InvestigationDetail,
  InvestigationFilters,
} from "../types/market";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`API request failed: ${status}`);
    this.status = status;
  }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  return response.json() as Promise<T>;
}

export async function getHealth(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    signal: AbortSignal.timeout(3000),
    cache: "no-store",
  });

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


export function getInvestigations(
  filters: InvestigationFilters = {}
): Promise<InvestigationSummary[]> {
  const params = new URLSearchParams();
  if (filters.symbol !== undefined) params.set("symbol", filters.symbol);
  if (filters.status !== undefined) params.set("status", filters.status);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));

  const query = params.toString();
  return getJson<InvestigationSummary[]>(
    `/investigations${query ? `?${query}` : ""}`
  );
}

export function getInvestigation(eventId: string): Promise<InvestigationDetail> {
  return getJson<InvestigationDetail>(
    `/investigations/${encodeURIComponent(eventId)}`
  );
}
