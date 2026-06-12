import { writeFileSync, readFileSync, unlinkSync, existsSync, openSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const PID_DIR = "/tmp";
const PID_FILE = join(PID_DIR, "ministats-client.pid");
const LOG_FILE = join(PID_DIR, "ministats-client.log");

export function startDaemon(name: string, serverUrl: string): void {
  if (isDaemonRunning()) {
    console.log("Daemon is already running");
    return;
  }

  // Get the path to the current executable
  let execPath: string;
  try {
    execPath = process.execPath;
  } catch {
    execPath = process.argv[0];
  }
  
  const args = ["client", "--name", name, "--server", serverUrl];

  const logFd = openSync(LOG_FILE, "a");

  const childProcess = spawn(execPath, args, {
    detached: true,
    stdio: ["ignore", logFd, logFd]
  });

  childProcess.unref();

  const pid = childProcess.pid;
  writeFileSync(PID_FILE, pid.toString());

  console.log(`Daemon started with PID ${pid}`);
  console.log(`Logs: ${LOG_FILE}`);
}

export function stopDaemon(): void {
  if (!existsSync(PID_FILE)) {
    console.log("Daemon is not running");
    return;
  }

  const pidData = readFileSync(PID_FILE, "utf-8");
  const pid = parseInt(pidData.trim());

  try {
    process.kill(pid, "SIGTERM");
    unlinkSync(PID_FILE);
    console.log(`Daemon stopped (PID ${pid})`);
  } catch (err) {
    console.error(`Error stopping daemon: ${err}`);
    process.exit(1);
  }
}

export function checkDaemonStatus(): void {
  if (isDaemonRunning()) {
    const pidData = readFileSync(PID_FILE, "utf-8");
    console.log(`Daemon is running (PID ${pidData.trim()})`);
    console.log(`Logs: ${LOG_FILE}`);
  } else {
    console.log("Daemon is not running");
  }
}

export function isDaemonRunning(): boolean {
  if (!existsSync(PID_FILE)) {
    return false;
  }

  try {
    const pidData = readFileSync(PID_FILE, "utf-8");
    const pid = parseInt(pidData.trim());
    process.kill(pid, 0); // Check if process exists
    return true;
  } catch (err) {
    // Process doesn't exist, clean up PID file
    try {
      unlinkSync(PID_FILE);
    } catch {}
    return false;
  }
}