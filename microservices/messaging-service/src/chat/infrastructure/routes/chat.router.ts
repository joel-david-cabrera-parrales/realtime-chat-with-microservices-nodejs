import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import { body, param, query, ValidationChain } from "express-validator";
import { validateRequest } from "../../../shared/middlewares/validate.request.middleware";
import { CONVERSATION_TYPES } from "../../domain/value-objects/conversation-type.value-object";
import { ChatControllerContract } from "../controllers/contracts/chat.controller.contract";

const codeValidation: ValidationChain[] = [param("code").isUUID().withMessage("El código debe ser un UUID válido")];

const credentialCodeValidation: ValidationChain[] = [param("credentialCode").isUUID().withMessage("El código de credencial debe ser un UUID válido")];

function createConversationValidation(): ValidationChain[] {
  return [
    body("type")
      .isString()
      .withMessage("El tipo de conversación debe ser un texto")
      .trim()
      .isIn(CONVERSATION_TYPES)
      .withMessage(`El tipo debe ser uno de: ${CONVERSATION_TYPES.join(", ")}`),
    body("participantCredentialCodes").isArray({ min: 2 }).withMessage("Debe indicarse al menos 2 participantes"),
    body("participantCredentialCodes.*").isUUID().withMessage("Cada participante debe ser un UUID válido"),
    body("title")
      .optional()
      .isString()
      .withMessage("El título debe ser un texto")
      .trim()
      .isLength({ min: 3, max: 80 })
      .withMessage("El título debe tener entre 3 y 80 caracteres"),
  ];
}

function addParticipantValidation(): ValidationChain[] {
  return [body("participantCredentialCode").isUUID().withMessage("El código de credencial debe ser un UUID válido")];
}

function renameConversationValidation(): ValidationChain[] {
  return [
    body("title")
      .isString()
      .withMessage("El título debe ser un texto")
      .trim()
      .isLength({ min: 3, max: 80 })
      .withMessage("El título debe tener entre 3 y 80 caracteres"),
  ];
}

function sendMessageValidation(): ValidationChain[] {
  return [
    body("content")
      .isString()
      .withMessage("El contenido debe ser un texto")
      .trim()
      .isLength({ min: 1, max: 4096 })
      .withMessage("El contenido debe tener entre 1 y 4096 caracteres"),
  ];
}

const paginationValidation: ValidationChain[] = [
  query("cursor").optional().isString().withMessage("El cursor debe ser un texto"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("El límite debe ser un entero entre 1 y 100"),
];

export class ChatRouter {
  private readonly router: Router;

  constructor(
    private readonly controller: ChatControllerContract,
    private readonly validateToken: RequestHandler,
  ) {
    this.router = Router();
    this.configure();
  }

  public getRouter(): Router {
    return this.router;
  }

  private configure(): void {
    this.router.use(this.validateToken);

    this.router.post("/conversations", createConversationValidation(), validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.createConversation(req, res, next).catch(next);
    });

    this.router.get("/conversations", paginationValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.listConversations(req, res, next).catch(next);
    });

    this.router.get("/conversations/:code", codeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.getConversation(req, res, next).catch(next);
    });

    this.router.post(
      "/conversations/:code/participants",
      codeValidation,
      addParticipantValidation(),
      validateRequest,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.addParticipant(req, res, next).catch(next);
      },
    );

    this.router.delete(
      "/conversations/:code/participants/:credentialCode",
      codeValidation,
      credentialCodeValidation,
      validateRequest,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.removeParticipant(req, res, next).catch(next);
      },
    );

    this.router.post("/conversations/:code/leave", codeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.leaveConversation(req, res, next).catch(next);
    });

    this.router.patch(
      "/conversations/:code",
      codeValidation,
      renameConversationValidation(),
      validateRequest,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.renameConversation(req, res, next).catch(next);
      },
    );

    this.router.delete("/conversations/:code", codeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.deleteConversation(req, res, next).catch(next);
    });

    this.router.post(
      "/conversations/:code/messages",
      codeValidation,
      sendMessageValidation(),
      validateRequest,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.sendMessage(req, res, next).catch(next);
      },
    );

    this.router.get(
      "/conversations/:code/messages",
      codeValidation,
      paginationValidation,
      validateRequest,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.listMessages(req, res, next).catch(next);
      },
    );

    this.router.get("/messages/:code", codeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.getMessage(req, res, next).catch(next);
    });

    this.router.patch(
      "/messages/:code",
      codeValidation,
      sendMessageValidation(),
      validateRequest,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.editMessage(req, res, next).catch(next);
      },
    );

    this.router.delete("/messages/:code", codeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.deleteMessage(req, res, next).catch(next);
    });

    this.router.post("/messages/:code/delivered", codeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.markMessageDelivered(req, res, next).catch(next);
    });

    this.router.post("/messages/:code/read", codeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.markMessageRead(req, res, next).catch(next);
    });
  }
}
