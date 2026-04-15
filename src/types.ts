export interface MemoryMetrics {
  available: string;
}

export interface DiskMetrics {
  used: string;
  total: string;
  usePercent: number;
  iUsePercent: number;
}

export interface CpuMetrics {
  load1: number;
  load5: number;
  load15: number;
}

export interface ClientMetrics {
  name: string;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  cpu: CpuMetrics;
  timestamp: number;
}

export interface ServerBroadcast {
  clients: ClientMetrics[];
  timestamp: number;
}
