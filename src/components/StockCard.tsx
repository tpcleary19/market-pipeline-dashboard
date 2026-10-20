import { useEffect, useState } from "react";
import { getLatestTrade } from "../api/market";
import type { LatestTrade } from "../types/market";

interface StockCardProps {
  symbol: string;
}

function formatTradeAge(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;

  return `${seconds}s`;
}

export function StockCard({ symbol }: StockCardProps) {
  const [trade, setTrade] = useState<LatestTrade | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function refreshPrice() {
      try {
        const latest = await getLatestTrade(symbol);

        if (active) {
          setTrade(latest);
          setError(null);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    }

    void refreshPrice();

    const interval = setInterval(() => {
      void refreshPrice();
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [symbol]);

  const tradeAgeSeconds = trade
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(trade.timestamp).getTime()) / 1000),
      )
    : null;

  return (
    <article className="stock-card">
      <h2>{symbol}</h2>

      {error && <p className="error">{error}</p>}
      {!trade && !error && <p>Loading...</p>}

      {trade && (
        <>
          <div className="stock-price">${Number(trade.price).toFixed(2)}</div>
          <div className="stock-details">
            <p>Size: {trade.size} shares</p>

            <p>
              <p>
                Last trade: {new Date(trade.timestamp).toLocaleString()}
                {" · "}
                {tradeAgeSeconds !== null
                  ? `${formatTradeAge(tradeAgeSeconds)} ago`
                  : "Unknown"}
              </p>
            </p>

            <p>Exchange: {trade.exchange}</p>
          </div>
        </>
      )}
    </article>
  );
}
