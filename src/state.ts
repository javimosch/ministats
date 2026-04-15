import { type ClientMetrics, type ServerBroadcast } from "./types.ts";

const clients = new Map<string, ClientMetrics>();

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

export function broadcastState(ws: any) {
  const state: ServerBroadcast = {
    clients: getAllClients(),
    timestamp: Date.now(),
  };
  ws.send(JSON.stringify(state));
}
