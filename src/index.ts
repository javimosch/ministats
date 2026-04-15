import { startServer } from "./server.ts";
import { startClient } from "./client.ts";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("MiniStats - Real-time system metrics dashboard");
  console.log("");
  console.log("Usage:");
  console.log("  ministats server --port <port>    Start the server (default: 9094)");
  console.log("  ministats client --name <name> --server <url>    Start a client");
  process.exit(1);
}

const command = args[0];

if (command === "server") {
  let port = 9094;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--port" && args[i + 1]) {
      port = parseInt(args[i + 1]);
      i++;
    }
  }
  startServer(port);
} else if (command === "client") {
  let name: string | undefined;
  let server: string | undefined;

  for (let i = 1; i < args.length; i++) {
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
