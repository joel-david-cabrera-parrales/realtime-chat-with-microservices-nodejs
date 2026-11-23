import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import multer from "multer";
import { body, param, ValidationChain } from "express-validator";
import { sendError } from "../../../shared/http/api-response";
import { validateRequest } from "../../../shared/middlewares/validate.request.middleware";
import { buildAvatarUploadMiddleware } from "../../../plugins/multer/multer.plugin";
import { ProfileControllerContract } from "../controllers/contracts/profile.controller.contract";
import { GENDER_VALUES } from "../../domain/value-objects/gender.value-object";

const idValidation: ValidationChain[] = [param("id").isUUID().withMessage("El id debe ser un UUID válido")];
function phoneValidation(allowNull = false): ValidationChain {
  const validator = body("phone")
    .isString()
    .withMessage("El teléfono debe ser un texto")
    .isLength({ max: 20 })
    .withMessage("El teléfono no puede superar los 20 caracteres")
    .custom((value: string) => {
      const normalized = value.replace(/[\s()-]/g, "");
      if (!/^\+?[1-9]\d{6,14}$/.test(normalized)) {
        throw new Error("El teléfono no tiene un formato válido");
      }
      return true;
    });
  return allowNull ? validator.optional({ values: "null" }) : validator.optional();
}

const updateBodyValidation: ValidationChain[] = [
  body("fullName").optional().isString().trim().isLength({ min: 2, max: 120 }),
  phoneValidation(true),
  body("birthDate").optional({ values: "null" }).isISO8601(),
  body("gender").optional({ values: "null" }).isIn(GENDER_VALUES),
  body("bio").optional({ values: "null" }).isString().isLength({ max: 500 }),
];

export class ProfileRouter {
  private readonly router: Router;

  constructor(
    private readonly controller: ProfileControllerContract,
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

    this.router.get("/", (req, res, next) => this.controller.list(req, res, next).catch(next));

    this.router.post(
      "/",
      body("fullName").isString().trim().isLength({ min: 2, max: 120 }),
      body("email").isString().trim().isEmail().isLength({ max: 254 }).normalizeEmail(),
      phoneValidation(),
      body("birthDate").optional().isISO8601(),
      body("gender").optional().isIn(GENDER_VALUES),
      body("bio").optional().isString().isLength({ max: 500 }),
      validateRequest,
      this.requireInternalRequest,
      (req, res, next) => this.controller.create(req, res, next).catch(next),
    );

    this.router.get(
      "/:id",
      idValidation,
      validateRequest,
      this.requireOwnerOrInternalRequest,
      (req: Request, res: Response, next: NextFunction) => this.controller.getById(req, res, next).catch(next),
    );

    const updateRoute: RequestHandler[] = [
      ...idValidation,
      ...updateBodyValidation,
      validateRequest,
      this.requireOwnerOrInternalRequest,
      (req, res, next) => this.controller.update(req, res, next).catch(next),
    ];
    this.router.patch("/:id", ...updateRoute);
    this.router.put("/:id", ...updateRoute);

    this.router.post(
      "/:id/avatar",
      idValidation,
      validateRequest,
      this.requireOwnerOrInternalRequest,
      this.uploadHandler(),
      (req: Request, res: Response, next: NextFunction) => this.controller.uploadAvatar(req, res, next).catch(next),
    );

    this.router.delete(
      "/:id",
      idValidation,
      validateRequest,
      this.requireOwnerOrInternalRequest,
      (req: Request, res: Response, next: NextFunction) => this.controller.delete(req, res, next).catch(next),
    );
  }

  private readonly requireInternalRequest: RequestHandler = (_req, res, next) => {
    if (res.locals.isInternalRequest === true) {
      next();
      return;
    }
    sendError(res, { statusCode: 403, message: "Esta operación requiere autorización interna", error: "FORBIDDEN" });
  };

  private readonly requireOwnerOrInternalRequest: RequestHandler = (req, res, next) => {
    if (res.locals.isInternalRequest === true || res.locals.profileCode === req.params.id) {
      next();
      return;
    }
    sendError(res, { statusCode: 403, message: "No tienes permiso para acceder a este perfil", error: "FORBIDDEN" });
  };

  private uploadHandler(): RequestHandler {
    const upload = buildAvatarUploadMiddleware().single("file");
    return (req: Request, res: Response, next: NextFunction): void => {
      upload(req, res, (error: unknown) => {
        if (error instanceof multer.MulterError) {
          sendError(res, {
            statusCode: error.code === "LIMIT_FILE_SIZE" ? 413 : 400,
            message: error.message,
            error: error.code,
          });
          return;
        }
        if (error !== undefined && error !== null) {
          next(error);
          return;
        }
        next();
      });
    };
  }
}
