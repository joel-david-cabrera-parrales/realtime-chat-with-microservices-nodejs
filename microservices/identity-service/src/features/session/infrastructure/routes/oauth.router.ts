import { NextFunction, Request, Response, Router } from "express";
import { OAuthControllerContract } from "../controllers/contracts/oauth.controller.contract";

export class OAuthRouter {
  private readonly router: Router;

  constructor(private readonly controller: OAuthControllerContract) {
    this.router = Router();
    this.configure();
  }

  public getRouter(): Router {
    return this.router;
  }

  private configure(): void {
    this.router.get("/google", (req: Request, res: Response, next: NextFunction) => {
      void this.controller.google(req, res, next);
    });

    this.router.get("/google/callback", (req: Request, res: Response, next: NextFunction) => {
      void this.controller.googleCallback(req, res, next);
    });

    this.router.get("/microsoft", (req: Request, res: Response, next: NextFunction) => {
      void this.controller.microsoft(req, res, next);
    });

    this.router.get("/microsoft/callback", (req: Request, res: Response, next: NextFunction) => {
      void this.controller.microsoftCallback(req, res, next);
    });
  }
}
