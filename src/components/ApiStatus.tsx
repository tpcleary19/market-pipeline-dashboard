import { useEffect, useState } from "react";
import { getHealth } from "../api/market";

export default function ApiStatus() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const checkHealth = async () => {
      try {
        const healthy = await getHealth();

        if (!stopped) {
          setConnected(healthy);
        }
      } catch {
        if (!stopped) {
          setConnected(false);
        }
      } finally {
        if (!stopped) {
          timer = setTimeout(checkHealth, 5000);
        }
      }
    };

    checkHealth();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div>
      <span
        style={{
          color:
            connected === null ? "#94a3b8" : connected ? "#22c55e" : "#ef4444",
          fontWeight: 600,
        }}
      >
        {connected === null
          ? "Checking API..."
          : connected
            ? "● API Connected"
            : "● API Disconnected"}
      </span>
    </div>
  );
}
