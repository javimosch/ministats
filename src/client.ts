import { getMemoryMetrics, getDiskMetrics, getCpuMetrics } from "./metrics.ts";
import type { ClientMetrics } from "./types.ts";

export async function startClient(name: string, serverUrl: string) {
  const wsUrl = serverUrl.replace(/^http/, "ws") + "/ws";
  console.log(`Connecting to ${wsUrl}...`);

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log(`Connected as "${name}"`);
    runLoop(name, ws);
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  ws.onclose = () => {
    console.log("Disconnected, retrying in 5s...");
    setTimeout(() => startClient(name, serverUrl), 5000);
  };
}

async function runLoop(name: string, ws: WebSocket) {
  while (ws.readyState === WebSocket.OPEN) {
    try {
      const [memory, disk, cpu] = await Promise.all([
        getMemoryMetrics(),
        getDiskMetrics(),
        getCpuMetrics(),
      ]);

      const metrics: ClientMetrics = {
        name,
        memory,
        disk,
        cpu,
        timestamp: Date.now(),
      };

      ws.send("stats:" + JSON.stringify(metrics));
    } catch (err) {
      console.error("Error collecting metrics:", err);
    }

    await new Promise((r) => setTimeout(r, 5000));
  }
}
