import { ServerProps } from "../shared/interfaces/server-props.interface";
import { Server } from "../shared/classes/server.class";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import session from "express-session";
import { buildHealthRouter } from "../features/health/infrastructure/routes/health.router";
import { sessionFactory } from "../features/session/infrastructure/session.factory";
import { errorHandler } from "../shared/middlewares/error-handler.middleware";
import { createRequestLoggerMiddleware } from "../shared/middlewares/request-logger.middleware";
import { appDatasource } from "./typorm/datasource.provider";
import { profileFactory } from "../features/profile/infrastructure/profile.factory";

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
    this.app.use(createRequestLoggerMiddleware("identity-service"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({ origin: allowedOrigins ?? "*" }));
    this.app.use(helmet());

    this.app.use(
      session({
        secret: process.env.SESSION_SECRET ?? "change-me-insecure-session-secret",
        resave: false,
        saveUninitialized: true,
        cookie: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        },
      }),
    );
    this.app.use(passport.initialize());
  }

  protected configRoutes(): void {
    const profileRouter = profileFactory.createRouter(appDatasource);

    this.app.use("/api/health", buildHealthRouter());
    this.app.use("/api/auth/health", buildHealthRouter());
    this.app.use("/api/profile/health", buildHealthRouter());

    this.app.use("/api/auth", sessionFactory.createRouter(appDatasource));
    this.app.use("/api/v1/auth", sessionFactory.createOAuthRouter(appDatasource));
    this.app.use("/api/profile", profileRouter);
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server on port ${this.port}`);
    });
  }
}
