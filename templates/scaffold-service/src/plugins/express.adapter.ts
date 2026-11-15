import { ServerProps } from "../shared/interfaces/server-props.interface";
import { Server } from "../shared/classes/server.class";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { buildHealthRouter } from "../health/infrastructure/routes/health.router";
import { errorHandler } from "../shared/middlewares/error-handler.middleware";
import { createRequestLoggerMiddleware } from "../shared/middlewares/request-logger.middleware";

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
    this.app.use(createRequestLoggerMiddleware("scaffold-template"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({ origin: allowedOrigins ?? "*" }));
    this.app.use(helmet());
  }

  protected configRoutes(): void {
    this.app.use("/api/health", buildHealthRouter());
    // Registra aqui los modulos del servicio:
    // this.app.use("/api/<recurso>", buildRouter());
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server on port ${this.port}`);
    });
  }
}
