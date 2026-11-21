export interface LatestTrade {
  symbol: string;
  trade_id: string;
  price: string;
  size: string;
  timestamp: string;
  exchange: string;
  tape: string;
}

export interface HistoricalTrade {
  trade_id: number;
  symbol: string;
  price: string;
  size: number;
  timestamp: string;
  exchange: string | null;
  tape: string | null;
}

export type InvestigationStatus = "pending" | "running" | "completed" | "failed";

export interface SpikeEvent {
  schema_version: number;
  event_id: string;
  symbol: string;
  direction: "UP" | "DOWN";
  baseline_price: number;
  current_price: number;
  percentage_change: number;
  window_seconds: number;
  baseline_timestamp: string;
  current_timestamp: string;
  detected_at: string;
}

export interface InvestigationSummary {
  event_id: string;
  symbol: string;
  status: InvestigationStatus;
  spike: SpikeEvent;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  outcome: string | null;
  provider: string | null;
  model: string | null;
  has_report: boolean;
}

export interface InvestigationResult {
  provider: string;
  model: string | null;
  response_id: string | null;
  report: string;
  // Provider-specific source and citation blocks; narrow before rendering.
  output: unknown[];
  usage: Record<string, unknown> | null;
  outcome?: string;
  asset_lookup?: Record<string, unknown>;
}

export interface InvestigationDetail extends InvestigationSummary {
  attempts: number;
  last_error: string | null;
  result: InvestigationResult | null;
}

export interface InvestigationFilters {
  symbol?: string;
  status?: InvestigationStatus;
  limit?: number;
}
