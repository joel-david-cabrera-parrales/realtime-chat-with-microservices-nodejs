import { NextFunction, Request, Response } from "express";

export abstract class ChatControllerContract {
  public abstract createConversation(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract listConversations(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract getConversation(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract addParticipant(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract removeParticipant(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract leaveConversation(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract renameConversation(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract sendMessage(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract listMessages(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract getMessage(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract editMessage(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract markMessageDelivered(req: Request, res: Response, next: NextFunction): Promise<void>;

  public abstract markMessageRead(req: Request, res: Response, next: NextFunction): Promise<void>;
}
