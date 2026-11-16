import { NextFunction, Request, Response } from "express";

export abstract class OAuthControllerContract {
  public abstract google(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract googleCallback(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract microsoft(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract microsoftCallback(req: Request, res: Response, next: NextFunction): Promise<void>;
}
