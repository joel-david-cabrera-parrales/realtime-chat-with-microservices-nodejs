import { ServerProps } from "../shared/interfaces/server-props.interface";
import { Server } from "../shared/classes/server.class";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { buildHealthRouter } from "../health/infrastructure/routes/health.router";
import { filesFactory } from "../files/infrastructure/files.factory";
import { errorHandler } from "../shared/middlewares/error-handler.middleware";
import { appDatasource } from "./typorm/datasource.provider";

export class ExpressServer extends Server {
  private readonly app: Application;
  private readonly port: number;

  constructor(private readonly serverOptions: ServerProps) {
    super();
    this.app = express();
    this.port = serverOptions.port;

    this.configServer();
    this.configMiddlewares();
    this.configRoutes();
  }

  protected configServer(): void {
    this.app.set("port", this.port);
    this.app.set("json spaces", this.serverOptions.jsonSpaces);
  }

  protected configMiddlewares(): void {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({ origin: allowedOrigins ?? "*" }));
    this.app.use(helmet());
  }

  protected configRoutes(): void {
    this.app.use("/api/health", buildHealthRouter());
    this.app.use("/api/file/health", buildHealthRouter());
    this.app.use("/api/file", filesFactory.createRouter(appDatasource));
    this.app.use("/api/files", filesFactory.createRouter(appDatasource));
    // this.app.use("/api/projects", buildProjectRouter());
    // this.app.use("/api/analyses", buildAnalysisRouter());
    // this.app.use("/api/reports", buildReportRouter());
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server on port ${this.port}`);
    });
  }
}
