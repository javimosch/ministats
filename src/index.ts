import { startServer } from "./server.ts";
import { startClient } from "./client.ts";
import { writeFileSync, chmodSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { version } from "./version.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "-v" || args[0] === "--version") {
  console.log(`ministats ${version}`);
  process.exit(0);
}

if (args[0] === "help" || args[0] === "--help") {
  console.log("MiniStats - Real-time system metrics dashboard");
  console.log("");
  console.log("Usage:");
  console.log("  ministats server --port <port>    Start the server (default: 9094)");
  console.log("  ministats client --name <name> --server <url>    Start a client");
  console.log("  ministats update                   Update to latest version");
  console.log("  ministats -v, --version           Show version");
  process.exit(0);
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
} else if (command === "update") {
  console.log("Checking for updates...");

  (async () => {
    try {
      const releaseUrl = "https://api.github.com/repos/javimosch/ministats/releases/latest";
      const releaseRes = await fetch(releaseUrl, {
        headers: { "Accept": "application/vnd.github+json" }
      });
      if (!releaseRes.ok) throw new Error(`GitHub API error: ${releaseRes.status}`);
      const release = await releaseRes.json();

      const asset = release.assets?.find((a: any) => a.name === "ministats.xz");
      if (!asset) throw new Error("No binary asset found in release");

      const downloadUrl = asset.browser_download_url;
      console.log(`Downloading ${downloadUrl}...`);
      const binRes = await fetch(downloadUrl);
      if (!binRes.ok) throw new Error(`Download failed: ${binRes.status}`);
      const binData = await binRes.arrayBuffer();

      const tmpPath = "/tmp/ministats.new";
      writeFileSync(tmpPath, Buffer.from(binData));
      chmodSync(tmpPath, 0o755);

      const homeDir = process.env.HOME || "/root";
      const installPath = join(homeDir, ".local", "bin", "ministats");
      execSync(`cp ${tmpPath} ${installPath}`);
      chmodSync(installPath, 0o755);
      console.log(`Updated to ${release.tag_name}. Installed to ${installPath}`);
    } catch (err) {
      console.error(`Update failed: ${err}`);
      process.exit(1);
    }
  })();
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
