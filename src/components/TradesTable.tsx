
import { useEffect, useState } from "react";
import { getHistoricalTrades } from "../api/market";
import type { HistoricalTrade } from "../types/market";

interface TradesTableProps {
  symbol: string;
}

export function TradesTable({ symbol }: TradesTableProps) {
  const [trades, setTrades] = useState<HistoricalTrade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadTrades() {
      try {
        const data = await getHistoricalTrades(symbol, 10);

        if (active) {
          setTrades(data);
          setError(null);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load trades"
          );
          setLoading(false);
        }
      }
    }

    void loadTrades();

    const interval = setInterval(() => {
      void loadTrades();
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return (
    <section className="trades-section">
      <h2>Recent Trades — {symbol}</h2>

      {loading && <p>Loading trades...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="trades-table-wrapper">
          <table className="trades-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Price</th>
                <th>Size</th>
                <th>Exchange</th>
                <th>Trade ID</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.trade_id}>
                  <td>
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </td>
                  <td>${Number(trade.price).toFixed(2)}</td>
                  <td>{trade.size}</td>
                  <td>{trade.exchange ?? "—"}</td>
                  <td>{trade.trade_id}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {trades.length === 0 && <p>No trades found.</p>}
        </div>
      )}
    </section>
  );
}
