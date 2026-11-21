import { useEffect, useState } from "react";
import { ApiError, getInvestigation } from "../api/market";
import type { InvestigationDetail } from "../types/market";
import { InvestigationReport } from "./InvestigationReport";

interface InvestigationPageProps {
  eventId: string;
}

export function InvestigationPage({ eventId }: InvestigationPageProps) {
  const [job, setJob] = useState<InvestigationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getInvestigation(eventId)
      .then((data) => {
        if (active) setJob(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof ApiError && err.status === 404
              ? "Investigation not found."
              : "Could not load this investigation. Try reloading the page."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [eventId]);

  return (
    <main className="dashboard investigation-page">
      <a className="investigation-link" href="/">← Back to dashboard</a>
      <header className="dashboard-header">
        <h1>{job ? `${job.symbol} investigation` : "Investigation"}</h1>
      </header>

      {loading && <p role="status">Loading investigation...</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {!loading && !error && job && (
        <section className="trades-section" aria-label="Investigation record">
          <dl className="investigation-metadata">
            <div><dt>Status</dt><dd>{job.status}</dd></div>
            <div>
              <dt>Movement</dt>
              <dd>{job.spike.percentage_change >= 0 ? "+" : ""}{job.spike.percentage_change.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Spike time</dt>
              <dd><time dateTime={job.spike.current_timestamp}>{new Date(job.spike.current_timestamp).toLocaleString()}</time></dd>
            </div>
          </dl>

          <h2>Report</h2>
          {job.result?.report ? (
            <InvestigationReport result={job.result} />
          ) : (
            <p>
              {job.status === "failed"
                ? "The investigation failed before a report was saved."
                : job.status === "completed"
                  ? "No report was saved for this record."
                  : "No report yet. Reload this page after the investigation finishes."}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
