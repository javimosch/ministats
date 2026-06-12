import { handleClientMessage, getAllClients, pruneStaleClients } from "./state.ts";
import type { ServerBroadcast } from "./types.ts";

const dashboards = new Set<any>();

function broadcastToDashboards() {
  const state: ServerBroadcast = {
    clients: getAllClients(),
    timestamp: Date.now(),
  };
  const data = JSON.stringify(state);
  dashboards.forEach((ws) => ws.send(data));
}
import { version } from "../package.json" assert { type: "json" };

const METRICS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MiniStats</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@900&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0A0A0A;
      --fg: #EAEAEA;
      --accent: #E61919;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'IBM Plex Mono', monospace;
      background: var(--bg);
      color: var(--fg);
      min-height: 100vh;
      font-size: 12px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px);
      pointer-events: none;
      z-index: 9999;
    }
    .brand {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.2em;
      text-align: center;
      margin-bottom: 32px;
    }
    .brand span { color: var(--accent); }
    .container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1px;
      background: #333;
      border: 1px solid #333;
      max-width: 1200px;
      width: 100%;
    }
    .machine {
      display: grid;
      grid-template-columns: 100px repeat(3, 1fr);
      background: var(--bg);
    }
    .machine-name {
      padding: 12px;
      font-weight: 600;
      font-size: 11px;
      display: flex;
      align-items: center;
      border-right: 1px solid #222;
    }
    .panel {
      padding: 10px 12px;
      text-align: left;
      border-right: 1px solid #222;
    }
    .panel:last-child { border-right: none; }
    .label {
      font-size: 9px;
      color: #888;
      margin-bottom: 4px;
    }
    .label::before { content: '// '; color: var(--accent); }
    .value { font-size: 16px; font-weight: 600; letter-spacing: -0.02em; }
    .unit { font-size: 9px; color: #666; margin-left: 2px; }
    .sub { font-size: 8px; color: #666; margin-top: 2px; }
    .value.warning { color: #F5A623; }
    .value.danger { color: #E61919; }
    .machine.stale { opacity: 0.5; }
    .machine.stale .machine-name { border-left: 3px solid #F5A623; flex-direction: column; align-items: flex-start; }
    .stale-badge {
      display: inline-block;
      font-size: 7px;
      color: #F5A623;
      margin-top: 4px;
      animation: pulse 2s ease-in-out infinite;
    }
    .stale-badge::before { content: '⚠ '; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .empty-state { padding: 40px; text-align: center; color: #666; }
    .version { text-align: center; margin-top: 24px; font-size: 11px; color: #555; }
  </style>
</head>
<body>
    <div>
    <div class="brand">MINI<span>STATS</span></div>
    <div class="container" id="machines"></div>
    <div class="version">v${version}</div>
  </div>
  <script>
    const STALE_MS = 5 * 60 * 1000;
    let lastClients = [];
    const ws = new WebSocket(\`ws://\${location.host}/ws\`);
    ws.onopen = () => console.log("Connected to MiniStats server");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      lastClients = data.clients || [];
      render(lastClients);
    };
    ws.onerror = () => console.error("WebSocket error");
    setInterval(() => { if (lastClients.length) render(lastClients); }, 30000);
    function getMemoryClass(available) {
      const match = available.match(/(\d+)/);
      if (!match) return "";
      const val = parseFloat(match[1]);
      if (available.includes("MiB") || available.includes("M")) {
        if (val < 100) return "danger";
        if (val < 500) return "warning";
      }
      return "";
    }
    function timeAgo(ts) {
      const sec = Math.floor((Date.now() - ts) / 1000);
      if (sec < 60) return sec + 's ago';
      const min = Math.floor(sec / 60);
      if (min < 60) return min + 'm ago';
      const hrs = Math.floor(min / 60);
      return hrs + 'h ' + (min % 60) + 'm ago';
    }
    function render(clients) {
      const now = Date.now();
      const container = document.getElementById("machines");
      if (clients.length === 0) {
        container.innerHTML = '<div class="empty-state">No clients connected</div>';
        return;
      }
      container.innerHTML = clients.map(client => {
        const stale = now - client.timestamp > STALE_MS;
        return \`
        <div class="machine\${stale ? ' stale' : ''}">
          <div class="machine-name">\${client.name}\${stale ? '<div class="stale-badge">' + timeAgo(client.timestamp) + '</div>' : ''}</div>
          <div class="panel">
            <div class="label">MEMORY</div>
            <div class="value \${getMemoryClass(client.memory.available)}">\${client.memory.available}</div>
            <div class="sub">available</div>
          </div>
          <div class="panel">
            <div class="label">DISK</div>
            <div class="value">\${client.disk.available}</div>
            <div class="sub">\${client.disk.used}/\${client.disk.total} | \${client.disk.usePercent}% | IUse: \${client.disk.iUsePercent}%</div>
          </div>
          <div class="panel">
            <div class="label">CPU</div>
            <div class="value">\${client.cpu.load5.toFixed(2)}</div>
            <div class="sub">\${client.cpu.load1.toFixed(2)}, \${client.cpu.load5.toFixed(2)}, \${client.cpu.load15.toFixed(2)}</div>
          </div>
        </div>\`;
      }).join("");
    }
  </script>
</body>
</html>`;

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
        return new Response(METRICS_HTML, {
          headers: { "Content-Type": "text/html" },
        });
      }

      return new Response("Not Found", { status: 404 });
    },

    websocket: {
      open(ws) {
        dashboards.add(ws);
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
          broadcastToDashboards();
        }
      },
      close(ws) {
        dashboards.delete(ws);
        console.log("Dashboard disconnected");
      },
    },
  });

  console.log(`MiniStats server running on http://localhost:${server.port}`);
  console.log(`WebSocket endpoint: ws://localhost:${server.port}/ws`);

  setInterval(() => {
    const pruned = pruneStaleClients();
    if (pruned.length > 0) {
      console.log(`Pruned stale clients: ${pruned.join(", ")}`);
      broadcastToDashboards();
    }
  }, 60_000);
}
