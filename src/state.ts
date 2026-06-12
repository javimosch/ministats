import { type ClientMetrics, type ServerBroadcast } from "./types.ts";

const clients = new Map<string, ClientMetrics>();

const TTL_MS =
  (Number(process.env.MINISTATS_TTL_HOURS) || 24) * 60 * 60 * 1000;

export function handleClientMessage(data: string, wsId: string) {
  try {
    const metrics: ClientMetrics = JSON.parse(data);
    const name = metrics.name || wsId;
    metrics.name = name;
    metrics.timestamp = Date.now();
    clients.set(name, metrics);
    return metrics;
  } catch {
    return null;
  }
}

export function getAllClients(): ClientMetrics[] {
  return Array.from(clients.values());
}

export function pruneStaleClients(): string[] {
  const now = Date.now();
  const pruned: string[] = [];
  for (const [name, metrics] of clients) {
    if (now - metrics.timestamp > TTL_MS) {
      clients.delete(name);
      pruned.push(name);
    }
  }
  return pruned;
}

export function broadcastState(ws: any) {
  const state: ServerBroadcast = {
    clients: getAllClients(),
    timestamp: Date.now(),
  };
  ws.send(JSON.stringify(state));
}
