import { appDatasource } from "../../../plugins/typorm/datasource.provider";
import { HealthStatus } from "../interfaces/health-status.interface";

export class HealthService {
  public async getStatus(): Promise<HealthStatus> {
    const database: HealthStatus["database"] = { connected: false };

    try {
      if (!appDatasource.isInitialized) {
        await appDatasource.initialize();
      }
      await appDatasource.query("SELECT 1");
      database.connected = true;
    } catch (error) {
      database.error = error instanceof Error ? error.message : String(error);
    }

    return {
      status: database.connected ? "ok" : "degraded",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database,
    };
  }
}
