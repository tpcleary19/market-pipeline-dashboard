# Real-Time Market Pipeline Dashboard

A React and TypeScript dashboard displaying live stock prices and recent trades from a Rust-based market data pipeline.

## System Architecture

```mermaid
flowchart TD
    A["Alpaca Market Data WebSocket"] --> B["Rust Market Producer"]
    B --> C["Apache Kafka: stock-trades"]
    C --> D["Rust Market Consumer"]

    D --> E[("PostgreSQL: Trade History")]
    D --> F[("Redis: Latest Prices")]

    E --> G["Rust Axum Query API"]
    F --> G

    G --> H["React Dashboard (Vite + TypeScript)"]
```

### How Data Flows

1. **Alpaca** streams real-time market trades over a WebSocket connection.
2. **Rust Producer** receives the trades and publishes them to Kafka.
3. **Kafka** buffers the events for downstream processing.
4. **Rust Consumer** processes trades in batches, writing historical data to PostgreSQL and the latest prices to Redis.
5. **Axum Query API** exposes HTTP endpoints for retrieving prices and trade history.
6. **React Dashboard** periodically requests updated data and renders stock cards and recent trades.

### Dashboard Polling

- Latest stock prices: every **2 seconds**, from Redis through the API.
- Recent trades: every **5 seconds**, from PostgreSQL through the API.

The dashboard uses HTTP polling rather than a persistent WebSocket connection.

## Frontend File Map

| File | Purpose |
|---|---|
| `index.html` | HTML entry point. Provides the root element where React mounts the application. |
| `src/main.tsx` | Starts React and renders the `App` component. |
| `src/App.tsx` | Main dashboard layout. Creates the stock cards and recent trades table. |
| `src/App.css` | Dashboard styling, including cards, grid layout, and trade table. |
| `src/index.css` | Global styling, including fonts, background, and base CSS rules. |
| `src/components/StockCard.tsx` | Displays the latest price for one stock. Refreshes every 2 seconds. |
| `src/components/TradesTable.tsx` | Displays recent trades for one stock. Refreshes every 5 seconds. |
| `src/api/market.ts` | Makes HTTP requests to the Rust Axum API. |
| `src/types/market.ts` | Defines TypeScript interfaces for API responses. |
| `vite.config.ts` | Configures Vite and proxies `/api` requests to the local Rust API during development. |
| `package.json` | Defines project dependencies and npm commands. |
| `tsconfig.json` | TypeScript project configuration. |

### How the React Files Work Together

```mermaid
flowchart TD
    A["main.tsx"] --> B["App.tsx"]
    B --> C["StockCard.tsx"]
    B --> D["TradesTable.tsx"]
    C --> E["api/market.ts"]
    D --> E
    E --> F["Rust Axum API"]
    C -. "TypeScript interfaces" .-> G["types/market.ts"]
    D -. "TypeScript interfaces" .-> G
    E -. "TypeScript interfaces" .-> G
```

**Key distinction:** Components determine what appears on the screen. The API module handles data retrieval. TypeScript interfaces define the expected data structure.

Keeping these responsibilities separate makes the dashboard easier to extend and maintain.

## React State, Effects, and Polling

Our dashboard uses three important React concepts:

### 1. `useState` — Remember Data

`useState` allows a component to retain data between renders.

For example, `StockCard.tsx` stores the latest trade:

```tsx
const [trade, setTrade] = useState<LatestTrade | null>(null);
```

When new market data arrives, `setTrade()` updates the state and React renders the component again with the new price.

### 2. `useEffect` — Perform Background Work

`useEffect` runs code associated with a component's lifecycle.

We use it to start fetching market data when a component mounts.

```tsx
useEffect(() => {
  // Start fetching data
}, [symbol]);
```

The dependency array `[symbol]` tells React to rerun the effect if the stock symbol changes.

### 3. `setInterval` — Poll for Updates

Our stock cards periodically request fresh prices:

```tsx
useEffect(() => {
  const refresh = () => {
    getLatestTrade(symbol).then(setTrade).catch(console.error);
  };

  refresh();

  const interval = setInterval(refresh, 2000);

  return () => clearInterval(interval);
}, [symbol]);
```

This performs an immediate request and then repeats it every two seconds.

**Why cleanup matters:** `clearInterval()` stops the timer when the component unmounts or its symbol changes. Without cleanup, multiple timers could accumulate and generate unnecessary requests.

Our recent trades table uses the same approach with a five-second polling interval.

### How a Price Update Reaches the Screen

```mermaid
sequenceDiagram
    participant Timer as React Timer
    participant API as Rust Axum API
    participant Redis
    participant React

    Timer->>API: GET /prices/AAPL
    API->>Redis: Read latest:AAPL
    Redis-->>API: Latest trade
    API-->>Timer: JSON response
    Timer->>React: setTrade(newTrade)
    React->>React: Re-render StockCard
```

React updates the displayed price without reloading the entire web page.

## Local Development

The project consists of two separate repositories:

- **Backend:** `real-time-market-pipeline` — Rust, Kafka, PostgreSQL, Redis, and Axum.
- **Frontend:** `market-pipeline-dashboard` — React, TypeScript, and Vite.

### Prerequisites

- Rust and Cargo
- Docker Desktop with Docker Compose
- Node.js and npm
- Alpaca API credentials

### 1. Start Infrastructure

From the Rust backend directory:

```bash
cd ~/real-time-market-pipeline
docker compose up -d
```

This starts Kafka, PostgreSQL, and Redis.

The PostgreSQL database must have the required migrations applied before starting the consumer.

### 2. Configure Environment Variables

The Rust backend uses a `.env` file for local configuration.

From the backend directory:

```bash
cd ~/real-time-market-pipeline
cp .env.example .env
```

Edit `.env` and enter your Alpaca API credentials.

The configuration includes:

| Variable | Purpose |
|---|---|
| `APCA_API_KEY_ID` | Alpaca API key |
| `APCA_API_SECRET_KEY` | Alpaca API secret |
| `ALPACA_SYMBOLS` | Symbols to subscribe to |
| `ALPACA_FEED` | Market-data feed, such as `iex` |
| `DATABASE_URL` | PostgreSQL connection string |

Before starting a Rust service, load the configuration in its terminal:

```bash
set -a
source .env
set +a
```

The producer, consumer, and query API run in separate terminals. Load the environment in each terminal as needed.

Never commit `.env` to GitHub.

### 3. Start the Market Producer

Open a terminal:

```bash
cd ~/real-time-market-pipeline

# Load credentials into the current shell
set -a
source .env
set +a

# Start the producer
cargo run -p market-producer
```

The producer connects to Alpaca's WebSocket and publishes market trades to Kafka.

The environment variables must be loaded in the same terminal session used to start the producer.

### 4. Start the Market Consumer

Open a second terminal:

```bash
cd ~/real-time-market-pipeline
cargo run -p market-consumer
```

The consumer reads trades from Kafka in batches, writes historical trades to PostgreSQL, and updates the latest trade in Redis.

### 5. Start the Query API

Open a third terminal:

```bash
cd ~/real-time-market-pipeline
cargo run -p query-api
```

The Axum HTTP API listens locally on port `3000`.

### 6. Start the React Dashboard

Open a fourth terminal:

```bash
cd ~/market-pipeline-dashboard
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

The dashboard displays latest stock prices and recent trades, refreshing automatically.

### API Endpoints

| Endpoint | Purpose | Data Source |
|---|---|---|
| `GET /health` | Backend health check | Axum |
| `GET /prices/AAPL` | Latest AAPL trade | Redis, with PostgreSQL fallback |
| `GET /trades/AAPL?limit=10` | Ten most recent AAPL trades | PostgreSQL |

### Development Proxy

During local development, Vite forwards requests beginning with `/api` to the Rust API at `http://localhost:3000`.

For example:

```text
Browser
  GET http://localhost:5173/api/prices/AAPL
                  |
                  v
Vite Development Server
                  |
                  v
Rust Axum API
  GET http://localhost:3000/prices/AAPL
                  |
                  v
Redis / PostgreSQL
```

The frontend uses `VITE_API_BASE_URL` when explicitly configured; otherwise it defaults to `/api`.

The React dashboard does not need Alpaca credentials. All market-data access goes through the Rust backend.

### Git Workflow

The frontend and backend are maintained in separate Git repositories.

After making changes:

```bash
git status
git add .
git commit -m "Describe the changes"
git push
```

Commit changes independently in the repository where they were made.