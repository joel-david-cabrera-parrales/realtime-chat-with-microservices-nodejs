import { NextFunction, Request, Response } from "express";
import { sendError, sendSuccess } from "../../../shared/http/api-response";
import { ChatApplicationServiceContract } from "../../application/contracts/chat.application.service.contract";
import { ChatDomainException } from "../../domain/exceptions/chat-domain.exception";
import { ConversationAlreadyExistsException } from "../../domain/exceptions/conversation-already-exists.exception";
import { ConversationNotAdminException } from "../../domain/exceptions/conversation-not-admin.exception";
import { ConversationNotFoundException } from "../../domain/exceptions/conversation-not-found.exception";
import { ConversationNotParticipantException } from "../../domain/exceptions/conversation-not-participant.exception";
import { ConversationParticipantLimitReachedException } from "../../domain/exceptions/conversation-participant-limit-reached.exception";
import { DuplicateConversationParticipantException } from "../../domain/exceptions/duplicate-conversation-participant.exception";
import { LastAdminCannotBeRemovedException } from "../../domain/exceptions/last-admin-cannot-be-removed.exception";
import { MessageAlreadyDeletedException } from "../../domain/exceptions/message-already-deleted.exception";
import { MessageContentUnchangedException } from "../../domain/exceptions/message-content-unchanged.exception";
import { MessageNotEditableException } from "../../domain/exceptions/message-not-editable.exception";
import { MessageNotFoundException } from "../../domain/exceptions/message-not-found.exception";
import { ReceiptNotFoundException } from "../../domain/exceptions/receipt-not-found.exception";
import { CreateConversationInput } from "../../domain/use-cases/dtos/conversation.dto";
import { SendMessageInput } from "../../domain/use-cases/dtos/message.dto";
import { ChatControllerContract } from "./contracts/chat.controller.contract";

export class ChatController extends ChatControllerContract {
  constructor(private readonly chatService: ChatApplicationServiceContract) {
    super();
  }

  public async createConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { type?: string; title?: string; participantCredentialCodes?: string[] };
      const input: CreateConversationInput = {
        type: String(body.type ?? ""),
        title: body.title,
        participantCredentialCodes: body.participantCredentialCodes ?? [],
        createdBy: this.actor(req),
      };

      const conversation = await this.chatService.createConversation(input);

      sendSuccess(res, {
        statusCode: 201,
        message: "Conversación creada",
        data: conversation,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.chatService.listConversations({
        actorCredentialCode: this.actor(req),
        cursor: this.query(req, "cursor"),
        limit: this.queryLimit(req),
      });

      sendSuccess(res, {
        statusCode: 200,
        message: "Conversaciones listadas",
        data: result,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await this.chatService.getConversation({
        code: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
      });

      if (conversation === null) {
        sendError(res, {
          statusCode: 404,
          message: `No se encontró la conversación "${this.param(req, "code")}"`,
          error: "CONVERSATION_NOT_FOUND",
        });
        return;
      }

      sendSuccess(res, {
        statusCode: 200,
        message: "Conversación encontrada",
        data: conversation,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async addParticipant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { participantCredentialCode?: string };

      const conversation = await this.chatService.addParticipant({
        conversationCode: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
        participantCredentialCode: String(body.participantCredentialCode ?? ""),
      });

      sendSuccess(res, {
        statusCode: 201,
        message: "Participante añadido",
        data: conversation,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async removeParticipant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await this.chatService.removeParticipant({
        conversationCode: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
        participantCredentialCode: this.param(req, "credentialCode"),
      });

      sendSuccess(res, {
        statusCode: 200,
        message: "Participante eliminado",
        data: conversation,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async leaveConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await this.chatService.leaveConversation({
        conversationCode: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
      });

      sendSuccess(res, {
        statusCode: 200,
        message: "Has salido de la conversación",
        data: conversation,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async renameConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { title?: string };

      const conversation = await this.chatService.renameConversation({
        conversationCode: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
        title: String(body.title ?? ""),
      });

      sendSuccess(res, {
        statusCode: 200,
        message: "Conversación renombrada",
        data: conversation,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await this.chatService.deleteConversation({
        conversationCode: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
      });

      sendSuccess(res, {
        statusCode: 200,
        message: "Conversación eliminada",
        data: conversation,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { content?: string };
      const input: SendMessageInput = {
        conversationCode: this.param(req, "code"),
        senderCredentialCode: this.actor(req),
        content: String(body.content ?? ""),
      };

      const message = await this.chatService.sendMessage(input);

      sendSuccess(res, {
        statusCode: 201,
        message: "Mensaje enviado",
        data: message,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async listMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.chatService.listMessages({
        conversationCode: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
        cursor: this.query(req, "cursor"),
        limit: this.queryLimit(req),
      });

      sendSuccess(res, {
        statusCode: 200,
        message: "Mensajes listados",
        data: result,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async getMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await this.chatService.getMessage({
        code: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
      });

      if (message === null) {
        sendError(res, {
          statusCode: 404,
          message: `No se encontró el mensaje "${this.param(req, "code")}"`,
          error: "MESSAGE_NOT_FOUND",
        });
        return;
      }

      sendSuccess(res, {
        statusCode: 200,
        message: "Mensaje encontrado",
        data: message,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async editMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { content?: string };

      const message = await this.chatService.editMessage({
        code: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
        content: String(body.content ?? ""),
      });

      sendSuccess(res, {
        statusCode: 200,
        message: "Mensaje editado",
        data: message,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await this.chatService.deleteMessage({
        code: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
      });

      sendSuccess(res, {
        statusCode: 200,
        message: "Mensaje eliminado",
        data: message,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async markMessageDelivered(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await this.chatService.markMessageDelivered({
        code: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
      });

      sendSuccess(res, {
        statusCode: 200,
        message: "Mensaje marcado como entregado",
        data: message,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async markMessageRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await this.chatService.markMessageRead({
        code: this.param(req, "code"),
        actorCredentialCode: this.actor(req),
      });

      sendSuccess(res, {
        statusCode: 200,
        message: "Mensaje marcado como leído",
        data: message,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  private actor(req: Request): string {
    return String(req.res?.locals?.credentialCode ?? "");
  }

  private param(req: Request, name: string): string {
    return String(req.params[name] ?? "");
  }

  private query(req: Request, name: string): string | undefined {
    const value = req.query[name];

    if (typeof value !== "string" || value.trim().length === 0) {
      return undefined;
    }

    return value.trim();
  }

  private queryLimit(req: Request): number | undefined {
    const value = this.query(req, "limit");

    if (value === undefined) {
      return undefined;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof ConversationNotFoundException || error instanceof MessageNotFoundException || error instanceof ReceiptNotFoundException) {
      sendError(res, {
        statusCode: 404,
        message: error.message,
        error: error.code,
      });
      return;
    }

    if (
      error instanceof ConversationNotParticipantException ||
      error instanceof ConversationNotAdminException ||
      error instanceof LastAdminCannotBeRemovedException ||
      error instanceof MessageNotEditableException
    ) {
      sendError(res, {
        statusCode: 403,
        message: error.message,
        error: error.code,
      });
      return;
    }

    if (
      error instanceof ConversationAlreadyExistsException ||
      error instanceof DuplicateConversationParticipantException ||
      error instanceof ConversationParticipantLimitReachedException ||
      error instanceof MessageAlreadyDeletedException ||
      error instanceof MessageContentUnchangedException
    ) {
      sendError(res, {
        statusCode: 409,
        message: error.message,
        error: error.code,
      });
      return;
    }

    if (error instanceof ChatDomainException) {
      sendError(res, {
        statusCode: 400,
        message: error.message,
        error: error.code,
      });
      return;
    }

    next(error);
  }
}
