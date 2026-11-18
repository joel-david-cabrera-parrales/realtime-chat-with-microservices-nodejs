import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import multer from "multer";
import { body, param, ValidationChain } from "express-validator";
import { validateRequest } from "../../../shared/middlewares/validate.request.middleware";
import { sendError } from "../../../shared/http/api-response";
import { buildUploadMiddleware } from "../../../plugins/multer/multer.plugin";
import { GENDER_VALUES } from "../../domain/value-objects/gender.value-object";
import { ProfileControllerContract } from "../controllers/contracts/profile.controller.contract";

const idValidation: ValidationChain[] = [param("id").isUUID().withMessage("El id debe ser un UUID válido")];

function fullNameValidation(): ValidationChain {
  return body("fullName")
    .isString()
    .withMessage("El nombre completo debe ser un texto")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("El nombre completo debe tener entre 2 y 120 caracteres");
}

function emailValidation(): ValidationChain {
  return body("email")
    .isString()
    .withMessage("El email debe ser un texto")
    .trim()
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .isLength({ max: 254 })
    .withMessage("El email no puede superar los 254 caracteres");
}

function phoneValidation(): ValidationChain {
  return body("phone")
    .isString()
    .withMessage("El teléfono debe ser un texto")
    .custom((value: string) => {
      const normalized = value.replace(/[\s()-]/g, "");
      if (!/^\+?[1-9]\d{6,14}$/.test(normalized)) {
        throw new Error("El teléfono no tiene un formato válido");
      }
      return true;
    });
}

function birthDateValidation(): ValidationChain {
  return body("birthDate").isISO8601().withMessage("La fecha de nacimiento debe tener formato ISO 8601");
}

function genderValidation(): ValidationChain {
  return body("gender")
    .isIn(GENDER_VALUES)
    .withMessage(`El género debe ser uno de: ${GENDER_VALUES.join(", ")}`);
}

function bioValidation(): ValidationChain {
  return body("bio")
    .isString()
    .withMessage("La biografía debe ser un texto")
    .isLength({ max: 500 })
    .withMessage("La biografía no puede superar los 500 caracteres");
}

const createBodyValidation: ValidationChain[] = [
  fullNameValidation(),
  emailValidation(),
  phoneValidation().optional(),
  birthDateValidation().optional(),
  genderValidation().optional(),
  bioValidation().optional(),
];

const updateBodyValidation: ValidationChain[] = [
  fullNameValidation().optional(),
  phoneValidation().optional({ values: "null" }),
  birthDateValidation().optional({ values: "null" }),
  genderValidation().optional({ values: "null" }),
  bioValidation().optional({ values: "null" }),
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

    this.router.get("/", validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.list(req, res, next).catch(next);
    });

    this.router.post("/", createBodyValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.create(req, res, next).catch(next);
    });

    this.router.get("/:id", idValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.getById(req, res, next).catch(next);
    });

    this.router.patch("/:id", idValidation, updateBodyValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.update(req, res, next).catch(next);
    });

    this.router.post("/:id/avatar", idValidation, validateRequest, this.uploadHandler(), (req: Request, res: Response, next: NextFunction) => {
      this.controller.uploadAvatar(req, res, next).catch(next);
    });

    this.router.delete("/:id", idValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.delete(req, res, next).catch(next);
    });
  }

  private uploadHandler(): RequestHandler {
    const upload = buildUploadMiddleware().single("file");

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
