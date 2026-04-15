import { handleClientMessage, getAllClients } from "./state.ts";
import type { ServerBroadcast } from "./types.ts";

export function startServer(port: number) {
  const server = Bun.serve({
    port,
    fetch(req, server) {
      const url = new URL(req.url);

      if (url.pathname === "/ws") {
        const upgraded = server.upgrade(req);
        if (upgraded) return;
        return new Response("WebSocket upgrade failed", { status: 500 });
      }

      if (url.pathname === "/api/clients") {
        const state: ServerBroadcast = {
          clients: getAllClients(),
          timestamp: Date.now(),
        };
        return Response.json(state);
      }

      if (url.pathname === "/" || url.pathname === "/metrics.html") {
        const file = Bun.file("./public/metrics.html");
        return new Response(file, {
          headers: { "Content-Type": "text/html" },
        });
      }

      return new Response("Not Found", { status: 404 });
    },

    websocket: {
      open(ws) {
        console.log("Dashboard connected");
        const state: ServerBroadcast = {
          clients: getAllClients(),
          timestamp: Date.now(),
        };
        ws.send(JSON.stringify(state));
      },
      message(ws, msg) {
        const data = msg as string;
        if (data.startsWith("stats:")) {
          const payload = data.slice(6);
          handleClientMessage(payload, String(ws));
          const broadcast: ServerBroadcast = {
            clients: getAllClients(),
            timestamp: Date.now(),
          };
          ws.send(JSON.stringify(broadcast));
        }
      },
      close(ws) {
        console.log("Dashboard disconnected");
      },
    },
  });

  console.log(`MiniStats server running on http://localhost:${server.port}`);
  console.log(`WebSocket endpoint: ws://localhost:${server.port}/ws`);
}
