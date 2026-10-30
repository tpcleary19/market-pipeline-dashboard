
import { useState } from "react";
import { StockCard } from "./components/StockCard";
import { TradesTable } from "./components/TradesTable";
import ApiStatus from "./components/ApiStatus";
import "./App.css";

const symbols = ["AAPL", "MSFT", "NVDA"];
const testSymbols = Array.from({ length: 12 }, (_, index) => `LOAD${index}`);

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState("LOAD0");
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Real-Time Market Dashboard</h1>
        <ApiStatus />
        <h1>Market Pipeline Dashboard</h1>
        <p>Real-Time Market Data Pipeline</p>
      </header>
      <section className="stock-grid">
        {symbols.map((symbol) => (
          <StockCard key={symbol} symbol={symbol} />
        ))}
      </section>

      <h2 className="test-symbol-heading">Synthetic test trades</h2>
      <p className="test-symbol-description">LOAD symbols contain generated test data, not live market prices.</p>
      <section className="stock-grid" aria-label="Synthetic test prices">
        {testSymbols.slice(0, 3).map((symbol) => (
          <StockCard key={symbol} symbol={symbol} />
        ))}
      </section>

      <label className="symbol-selector">
        Trade history symbol
        <select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)}>
          <optgroup label="Synthetic test trades">
            {testSymbols.map((symbol) => <option key={symbol} value={symbol}>{symbol}</option>)}
          </optgroup>
          <optgroup label="Market symbols">
            {symbols.map((symbol) => <option key={symbol} value={symbol}>{symbol}</option>)}
          </optgroup>
        </select>
      </label>
      <TradesTable key={selectedSymbol} symbol={selectedSymbol} />
    </main>
  );
}

export default App;
