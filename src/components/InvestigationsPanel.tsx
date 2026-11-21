import { useEffect, useState } from "react";
import { getInvestigations } from "../api/market";
import type { InvestigationStatus, InvestigationSummary } from "../types/market";

const statusLabels: Record<InvestigationStatus, string> = {
  pending: "Pending",
  running: "Investigating",
  completed: "Completed",
  failed: "Failed",
};

function statusLabel(job: InvestigationSummary): string {
  if (job.outcome === "not_found") return "Symbol not found";
  if (job.outcome === "unsupported_asset_class") return "Unsupported asset class";
  return statusLabels[job.status];
}

export function InvestigationsPanel() {
  const [jobs, setJobs] = useState<InvestigationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;
    getInvestigations({ limit: 20 })
      .then((data) => {
        if (active) setJobs(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load investigations");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshCount]);

  function refresh() {
    setLoading(true);
    setError(null);
    setRefreshCount((count) => count + 1);
  }

  return (
    <section className="trades-section" aria-labelledby="investigations-title" aria-busy={loading}>
      <div className="investigations-heading">
        <h2 id="investigations-title">Investigations</h2>
        <button type="button" disabled={loading} onClick={refresh}>
          Refresh
        </button>
      </div>

      {loading && <p role="status">Loading investigations...</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {!loading && !error && jobs.length === 0 && <p>No investigations yet.</p>}
      {!loading && !error && jobs.length > 0 && (
        <div className="trades-table-wrapper">
          <table className="trades-table">
            <thead>
              <tr>
                <th scope="col">Symbol</th>
                <th scope="col">Movement</th>
                <th scope="col">Spike time</th>
                <th scope="col">Status</th>
                <th scope="col">Record</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.event_id}>
                  <td>{job.symbol}</td>
                  <td>
                    {job.spike.percentage_change >= 0 ? "+" : ""}
                    {job.spike.percentage_change.toFixed(2)}%
                  </td>
                  <td><time dateTime={job.spike.current_timestamp}>{new Date(job.spike.current_timestamp).toLocaleString()}</time></td>
                  <td>{statusLabel(job)}</td>
                  <td>
                    <a className="investigation-link" href={`/investigations/${encodeURIComponent(job.event_id)}`}>
                      View report<span className="visually-hidden"> for {job.symbol}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
