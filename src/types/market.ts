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