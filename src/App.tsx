
import { useState } from "react";
import { StockCard } from "./components/StockCard";
import { TradesTable } from "./components/TradesTable";
import { InvestigationsPanel } from "./components/InvestigationsPanel";
import { InvestigationPage } from "./components/InvestigationPage";
import ApiStatus from "./components/ApiStatus";
import "./App.css";

const symbols = ["AAPL", "MSFT", "NVDA"];

function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Real-Time Market Dashboard</h1>
        <ApiStatus />
      </header>
      
      <section className="stock-grid">
        {symbols.map((symbol) => (
          <StockCard key={symbol} symbol={symbol} />
        ))}
      </section>

      <label className="symbol-selector">
        Trade history symbol
        <select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)}>
          {symbols.map((symbol) => <option key={symbol} value={symbol}>{symbol}</option>)}
        </select>
      </label>
      <TradesTable key={selectedSymbol} symbol={selectedSymbol} />
      <InvestigationsPanel />
    </main>
  );
}

function App() {
  // Ordinary links load each page; the URL can be bookmarked and browser Back works.
  const path = window.location.pathname;
  if (path === "/") return <Dashboard />;

  const match = path.match(/^\/investigations\/([^/]+)\/?$/);
  if (match) {
    let eventId: string | undefined;
    try {
      eventId = decodeURIComponent(match[1]);
    } catch {
      // A malformed percent-encoded URL falls through to the not-found page.
    }
    if (eventId !== undefined) {
      return <InvestigationPage key={eventId} eventId={eventId} />;
    }
  }

  return (
    <main className="dashboard">
      <h1>Page not found</h1>
      <a className="investigation-link" href="/">Back to dashboard</a>
    </main>
  );
}

export default App;
