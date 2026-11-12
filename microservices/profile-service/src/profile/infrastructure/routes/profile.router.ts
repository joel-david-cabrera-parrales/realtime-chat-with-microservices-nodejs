import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import { body, param, ValidationChain } from "express-validator";
import { validateRequest } from "../../../shared/middlewares/validate.request.middleware";
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

function avatarUrlValidation(): ValidationChain {
  return body("avatarUrl")
    .isURL({ protocols: ["http", "https"] })
    .withMessage("La URL de avatar debe ser una URL http/https válida");
}

const createBodyValidation: ValidationChain[] = [
  fullNameValidation(),
  emailValidation(),
  phoneValidation().optional(),
  birthDateValidation().optional(),
  genderValidation().optional(),
  bioValidation().optional(),
  avatarUrlValidation().optional(),
];

const updateBodyValidation: ValidationChain[] = [
  fullNameValidation().optional(),
  phoneValidation().optional({ values: "null" }),
  birthDateValidation().optional({ values: "null" }),
  genderValidation().optional({ values: "null" }),
  bioValidation().optional({ values: "null" }),
  avatarUrlValidation().optional({ values: "null" }),
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

    this.router.post("/", createBodyValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.create(req, res, next).catch(next);
    });

    this.router.get("/:id", idValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.getById(req, res, next).catch(next);
    });

    this.router.patch("/:id", idValidation, updateBodyValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.update(req, res, next).catch(next);
    });

    this.router.delete("/:id", idValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.delete(req, res, next).catch(next);
    });
  }
}
