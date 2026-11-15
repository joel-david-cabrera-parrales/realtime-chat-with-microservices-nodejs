import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../../shared/http/api-response";
import { HealthService } from "../../domain/services/health.service";

export class HealthController {
  private readonly healthService: HealthService;

  constructor(healthService?: HealthService) {
    this.healthService = healthService ?? new HealthService();
  }

  public async check(_req: Request, res: Response): Promise<void> {
    const status = await this.healthService.getStatus();

    if (status.status === "ok") {
      sendSuccess(res, {
        statusCode: 200,
        message: "Service is healthy",
        data: status,
      });
      return;
    }

    sendError(res, {
      statusCode: 503,
      message: "Service is degraded",
      error: status.database.error ?? "Database connection failed",
    });
  }
}
