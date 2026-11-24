import { NextFunction, Request, Response } from "express";

export abstract class SessionControllerContract {
  public abstract signin(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract signup(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract getById(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract list(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract listContacts(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract refresh(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract revoke(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract updateActivity(req: Request, res: Response, next: NextFunction): Promise<void>;
}
