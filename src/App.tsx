
import { useState } from "react";
import { StockCard } from "./components/StockCard";
import { TradesTable } from "./components/TradesTable";
import ApiStatus from "./components/ApiStatus";
import "./App.css";

const symbols = ["AAPL", "MSFT", "NVDA"];

function App() {
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
    </main>
  );
}

export default App;
