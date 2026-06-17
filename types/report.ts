export type NetworkStatus = "Connected" | "Disconnected";

export type WorkstationReport = {
  id?: string;
  hostname: string;
  os: string;
  cpu: string;
  ramGb: number;
  diskTotalGb: number;
  diskFreeGb: number;
  networkStatus: NetworkStatus;
  installedTools: string[];
  missingTools: string[];
  readinessScore: number;
  status: string;
  recommendations: string[];
  lastChecked: string;
};

export type StoredWorkstationReport = WorkstationReport & {
  id: string;
  filename: string;
};

export type FleetSummary = {
  totalWorkstations: number;
  averageReadinessScore: number;
  readyCount: number;
  needsAttentionCount: number;
  notReadyCount: number;
  staleCount: number;
  missingToolCounts: Record<string, number>;
};
