// @bun
// src/state.ts
var clients = new Map;
function handleClientMessage(data, wsId) {
  try {
    const metrics = JSON.parse(data);
    const name = metrics.name || wsId;
    metrics.name = name;
    metrics.timestamp = Date.now();
    clients.set(name, metrics);
    return metrics;
  } catch {
    return null;
  }
}
function getAllClients() {
  return Array.from(clients.values());
}

// src/server.ts
function startServer(port) {
  const server = Bun.serve({
    port,
    fetch(req, server2) {
      const url = new URL(req.url);
      if (url.pathname === "/ws") {
        const upgraded = server2.upgrade(req);
        if (upgraded)
          return;
        return new Response("WebSocket upgrade failed", { status: 500 });
      }
      if (url.pathname === "/api/clients") {
        const state = {
          clients: getAllClients(),
          timestamp: Date.now()
        };
        return Response.json(state);
      }
      if (url.pathname === "/" || url.pathname === "/metrics.html") {
        const file = Bun.file("./public/metrics.html");
        return new Response(file, {
          headers: { "Content-Type": "text/html" }
        });
      }
      return new Response("Not Found", { status: 404 });
    },
    websocket: {
      open(ws) {
        console.log("Dashboard connected");
        const state = {
          clients: getAllClients(),
          timestamp: Date.now()
        };
        ws.send(JSON.stringify(state));
      },
      message(ws, msg) {
        const data = msg;
        if (data.startsWith("stats:")) {
          const payload = data.slice(6);
          handleClientMessage(payload, String(ws));
          const broadcast = {
            clients: getAllClients(),
            timestamp: Date.now()
          };
          ws.send(JSON.stringify(broadcast));
        }
      },
      close(ws) {
        console.log("Dashboard disconnected");
      }
    }
  });
  console.log(`MiniStats server running on http://localhost:${server.port}`);
  console.log(`WebSocket endpoint: ws://localhost:${server.port}/ws`);
}

// src/metrics.ts
async function getMemoryMetrics() {
  const proc = Bun.spawn(["free", "-h"], { stdout: "pipe" });
  const output = await new Response(proc.stdout).text();
  const lines = output.trim().split(`
`);
  const memLine = lines.find((l) => l.startsWith("Mem:"));
  if (!memLine)
    throw new Error("Could not parse free -h output");
  const parts = memLine.split(/\s+/);
  const available = parts[6];
  return { available };
}
async function getDiskMetrics() {
  const proc = Bun.spawn(["df", "-h", "-i", "/"], { stdout: "pipe" });
  const output = await new Response(proc.stdout).text();
  const lines = output.trim().split(`
`);
  const diskLine = lines[1];
  if (!diskLine)
    throw new Error("Could not parse df -h -i output");
  const parts = diskLine.split(/\s+/);
  const total = parts[1];
  const used = parts[2];
  const usePercent = parseInt(parts[5].replace("%", ""));
  const iProc = Bun.spawn(["df", "-h", "-i", "/"], { stdout: "pipe" });
  const iOutput = await new Response(iProc.stdout).text();
  const iLines = iOutput.trim().split(`
`);
  const iLine = iLines[1];
  if (!iLine)
    throw new Error("Could not parse df -h -i output for inodes");
  const iUsePercent = parseInt(iLine.split(/\s+/)[5].replace("%", ""));
  return { used, total, usePercent, iUsePercent };
}
async function getCpuMetrics() {
  const proc = Bun.spawn(["uptime"], { stdout: "pipe" });
  const output = await new Response(proc.stdout).text();
  const match = output.match(/load average:\s+([\d.]+),\s+([\d.]+),\s+([\d.]+)/);
  if (!match)
    throw new Error("Could not parse uptime output");
  return {
    load1: parseFloat(match[1]),
    load5: parseFloat(match[2]),
    load15: parseFloat(match[3])
  };
}

// src/client.ts
async function startClient(name, serverUrl) {
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
async function runLoop(name, ws) {
  while (ws.readyState === WebSocket.OPEN) {
    try {
      const [memory, disk, cpu] = await Promise.all([
        getMemoryMetrics(),
        getDiskMetrics(),
        getCpuMetrics()
      ]);
      const metrics = {
        name,
        memory,
        disk,
        cpu,
        timestamp: Date.now()
      };
      ws.send("stats:" + JSON.stringify(metrics));
    } catch (err) {
      console.error("Error collecting metrics:", err);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
}

// src/index.ts
var args = process.argv.slice(2);
if (args.length === 0) {
  console.log("MiniStats - Real-time system metrics dashboard");
  console.log("");
  console.log("Usage:");
  console.log("  ministats server --port <port>    Start the server (default: 9094)");
  console.log("  ministats client --name <name> --server <url>    Start a client");
  process.exit(1);
}
var command = args[0];
if (command === "server") {
  let port = 9094;
  for (let i = 1;i < args.length; i++) {
    if (args[i] === "--port" && args[i + 1]) {
      port = parseInt(args[i + 1]);
      i++;
    }
  }
  startServer(port);
} else if (command === "client") {
  let name;
  let server;
  for (let i = 1;i < args.length; i++) {
    if (args[i] === "--name" && args[i + 1]) {
      name = args[i + 1];
      i++;
    } else if (args[i] === "--server" && args[i + 1]) {
      server = args[i + 1];
      i++;
    }
  }
  if (!name || !server) {
    console.error("Error: --name and --server are required for client");
    process.exit(1);
  }
  startClient(name, server);
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
