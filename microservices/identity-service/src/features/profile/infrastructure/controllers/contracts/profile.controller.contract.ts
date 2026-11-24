import { NextFunction, Request, Response } from "express";

export abstract class ProfileControllerContract {
  public abstract create(req: Request, res: Response, next: NextFunction): Promise<void>;
  public abstract getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  public abstract update(req: Request, res: Response, next: NextFunction): Promise<void>;
  public abstract uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void>;
  public abstract delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  public abstract list(req: Request, res: Response, next: NextFunction): Promise<void>;
}
