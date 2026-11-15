export interface DatabaseHealth {
  connected: boolean;
  error?: string;
}

export interface HealthStatus {
  status: "ok" | "degraded";
  uptime: number;
  timestamp: string;
  database: DatabaseHealth;
}
