import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import multer from "multer";
import { param, ValidationChain } from "express-validator";
import { validateRequest } from "../../../shared/middlewares/validate.request.middleware";
import { sendError } from "../../../shared/http/api-response";
import { buildUploadMiddleware } from "../../../plugins/multer/multer.plugin";
import { uploadRateLimit } from "../../../plugins/rate-limit/rate.limit.plugin";
import { FilesController } from "../controllers/files.controller";

const fileCodeValidation: ValidationChain[] = [param("fileCode").isUUID().withMessage("El fileCode debe ser un UUID válido")];

export class FilesRouter {
  private readonly router: Router;

  constructor(
    private readonly controller: FilesController,
    private readonly validateToken: RequestHandler,
  ) {
    this.router = Router();
    this.configure();
  }

  public getRouter(): Router {
    return this.router;
  }

  private configure(): void {
    this.router.get("/public/:fileCode", fileCodeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.getPublicFile(req, res, next).catch(next);
    });

    this.router.use(this.validateToken);

    this.router.post("/profile-photo", uploadRateLimit, this.uploadHandler(), (req: Request, res: Response, next: NextFunction) => {
      this.controller.uploadProfilePhoto(req, res, next).catch(next);
    });

    this.router.post("/documents", uploadRateLimit, this.uploadHandler(), (req: Request, res: Response, next: NextFunction) => {
      this.controller.uploadDocument(req, res, next).catch(next);
    });

    this.router.get("/", (req: Request, res: Response, next: NextFunction) => {
      this.controller.list(req, res, next).catch(next);
    });

    this.router.get("/profile-photo", (req: Request, res: Response, next: NextFunction) => {
      this.controller.getProfilePhoto(req, res, next).catch(next);
    });

    this.router.delete("/profile-photo", (req: Request, res: Response, next: NextFunction) => {
      this.controller.deleteProfilePhoto(req, res, next).catch(next);
    });

    this.router.get("/:fileCode", fileCodeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.getByCode(req, res, next).catch(next);
    });

    this.router.get("/:fileCode/download", fileCodeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.download(req, res, next).catch(next);
    });

    this.router.delete("/:fileCode", fileCodeValidation, validateRequest, (req: Request, res: Response, next: NextFunction) => {
      this.controller.remove(req, res, next).catch(next);
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
