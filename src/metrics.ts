import { MemoryMetrics, DiskMetrics, CpuMetrics } from "./types.ts";

export async function getMemoryMetrics(): Promise<MemoryMetrics> {
  const proc = Bun.spawn(["free", "-h"], { stdout: "pipe" });
  const output = await new Response(proc.stdout).text();
  const lines = output.trim().split("\n");
  const memLine = lines.find((l) => l.startsWith("Mem:"));
  if (!memLine) throw new Error("Could not parse free -h output");
  const parts = memLine.split(/\s+/);
  const available = parts[6];
  return { available };
}

export async function getDiskMetrics(): Promise<DiskMetrics> {
  const proc = Bun.spawn(["df", "-h", "/"], { stdout: "pipe" });
  const output = await new Response(proc.stdout).text();
  const lines = output.trim().split("\n");
  const diskLine = lines[1];
  if (!diskLine) throw new Error("Could not parse df output");
  const parts = diskLine.split(/\s+/);
  const total = parts[1];
  const used = parts[2];
  const usePercent = parseInt(parts[4].replace("%", ""));

  const iProc = Bun.spawn(["df", "-i", "/"], { stdout: "pipe" });
  const iOutput = await new Response(iProc.stdout).text();
  const iLines = iOutput.trim().split("\n");
  const iLine = iLines[1];
  if (!iLine) throw new Error("Could not parse df -i output for inodes");
  const iUsePercent = parseInt(iLine.split(/\s+/)[4].replace("%", ""));

  return { used, total, usePercent, iUsePercent };
}

export async function getCpuMetrics(): Promise<CpuMetrics> {
  const proc = Bun.spawn(["uptime"], { stdout: "pipe" });
  const output = await new Response(proc.stdout).text();
  const match = output.match(/load average:\s+([\d.]+),\s+([\d.]+),\s+([\d.]+)/);
  if (!match) throw new Error("Could not parse uptime output");
  return {
    load1: parseFloat(match[1]),
    load5: parseFloat(match[2]),
    load15: parseFloat(match[3]),
  };
}
