import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import { body, param, query, ValidationChain } from "express-validator";
import { validateRequest } from "../../../../shared/middlewares/validate.request.middleware";
import { SessionControllerContract } from "../controllers/contracts/session.controller.contract";

const PUBLIC_PATHS = new Set<string>(["/signin", "/signup", "/refresh"]);

const idValidation: ValidationChain[] = [param("id").isUUID().withMessage("El id debe ser un UUID válido")];

const signinBodyValidation: ValidationChain[] = [
  body("username")
    .isString()
    .withMessage("El username debe ser un texto")
    .trim()
    .isLength({ min: 3, max: 254 })
    .withMessage("El username debe tener entre 3 y 254 caracteres"),
  body("password").isString().withMessage("La contraseña debe ser un texto").isLength({ min: 1 }).withMessage("La contraseña es obligatoria"),
  body("ipAddress").optional().isIP().withMessage("La dirección IP no es válida"),
  body("userAgent").optional().isString().withMessage("El user agent debe ser un texto").isLength({ max: 512 }),
];

const signupBodyValidation: ValidationChain[] = [
  ...signinBodyValidation,
  body("profile.fullName")
    .isString()
    .withMessage("El nombre completo debe ser un texto")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("El nombre completo debe tener entre 2 y 120 caracteres"),
  body("profile.email")
    .isString()
    .withMessage("El email debe ser un texto")
    .trim()
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .isLength({ max: 254 })
    .withMessage("El email no puede superar los 254 caracteres"),
  body("profile.phone").optional().isString().withMessage("El teléfono debe ser un texto"),
  body("profile.birthDate").optional().isISO8601().withMessage("La fecha de nacimiento debe tener formato ISO 8601"),
  body("profile.gender").optional().isString().withMessage("El género debe ser un texto"),
];

const listQueryValidation: ValidationChain[] = [query("credentialId").isInt({ min: 1 }).withMessage("credentialId debe ser un entero positivo")];

const contactsQueryValidation: ValidationChain[] = [
  query("search").optional().isString().trim().isLength({ max: 254 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const refreshBodyValidation: ValidationChain[] = [
  body("refreshToken")
    .isString()
    .withMessage("El refresh token debe ser un texto")
    .isLength({ min: 1 })
    .withMessage("El refresh token es obligatorio"),
];

export class SessionRouter {
  private readonly router: Router;

  constructor(
    private readonly controller: SessionControllerContract,
    private readonly validateToken: RequestHandler,
  ) {
    this.router = Router();
    this.configure();
  }

  public getRouter(): Router {
    return this.router;
  }

  private configure(): void {
    this.router.use((req: Request, res: Response, next: NextFunction) => {
      if (PUBLIC_PATHS.has(req.path)) {
        next();
        return;
      }

      this.validateToken(req, res, next);
    });

    this.router.post("/signin", signinBodyValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.signin(req, res, next).catch(next);
    });

    this.router.post("/signup", signupBodyValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.signup(req, res, next).catch(next);
    });

    this.router.get("/sessions", listQueryValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.list(req, res, next).catch(next);
    });

    this.router.get("/contacts", contactsQueryValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.listContacts(req, res, next).catch(next);
    });

    this.router.get("/sessions/:id", idValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.getById(req, res, next).catch(next);
    });

    this.router.post("/refresh", refreshBodyValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.refresh(req, res, next).catch(next);
    });

    this.router.post("/sessions/:id/revoke", idValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.revoke(req, res, next).catch(next);
    });

    this.router.post("/sessions/:id/activity", idValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.updateActivity(req, res, next).catch(next);
    });
  }
}
