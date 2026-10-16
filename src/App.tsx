
import { StockCard } from "./components/StockCard";
import { TradesTable } from "./components/TradesTable";
import ApiStatus from "./components/ApiStatus";
import "./App.css";

const symbols = ["AAPL", "MSFT", "NVDA"];

function App() {
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

      <TradesTable symbol="AAPL" />
    </main>
  );
}

export default App;
