import { NextFunction, Request, Response } from "express";
import { sendError, sendSuccess } from "../../../shared/http/api-response";
import { ProfileApplicationServiceContract } from "../../application/contracts/profile.application.service.contract";
import { EmailAlreadyExistsException } from "../../domain/exceptions/email-already-exists.exception";
import { ProfileDomainException } from "../../domain/exceptions/profile-domain.exception";
import { ProfileNotFoundException } from "../../domain/exceptions/profile-not-found.exception";
import { CreateProfileInput } from "../../domain/use-cases/dtos/create-profile.dto";
import { UpdateProfileInput } from "../../domain/use-cases/dtos/update-profile.dto";
import { ProfileControllerContract } from "./contracts/profile.controller.contract";

export class ProfileController extends ProfileControllerContract {
  constructor(private readonly profileService: ProfileApplicationServiceContract) {
    super();
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateProfileInput;
      const profile = await this.profileService.create(input);

      sendSuccess(res, {
        statusCode: 201,
        message: "Perfil creado",
        data: profile,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.profileService.list();

      sendSuccess(res, {
        statusCode: 200,
        message: "Perfiles listados",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this.getId(req);
      const profile = await this.profileService.getById(id);

      if (profile === null) {
        sendError(res, {
          statusCode: 404,
          message: `No se encontró un perfil con id "${id}"`,
          error: "PROFILE_NOT_FOUND",
        });
        return;
      }

      sendSuccess(res, {
        statusCode: 200,
        message: "Perfil encontrado",
        data: profile,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: UpdateProfileInput = {
        ...(req.body as Omit<UpdateProfileInput, "id">),
        id: this.getId(req),
      };
      const profile = await this.profileService.update(input);

      sendSuccess(res, {
        statusCode: 200,
        message: "Perfil actualizado",
        data: profile,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        sendError(res, {
          statusCode: 400,
          message: 'No se recibió el archivo en el campo "file"',
          error: "FILE_REQUIRED",
        });
        return;
      }

      const profile = await this.profileService.uploadAvatar({
        id: this.getId(req),
        file: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          buffer: file.buffer,
          sizeBytes: file.size,
        },
      });

      sendSuccess(res, {
        statusCode: 201,
        message: "Foto de perfil actualizada",
        data: profile,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.profileService.delete(this.getId(req));

      sendSuccess(res, {
        statusCode: 200,
        message: "Perfil eliminado",
        data: null,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  private getId(req: Request): string {
    return String(req.params.id ?? "");
  }

  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof ProfileNotFoundException) {
      sendError(res, {
        statusCode: 404,
        message: error.message,
        error: error.code,
      });
      return;
    }

    if (error instanceof EmailAlreadyExistsException) {
      sendError(res, {
        statusCode: 409,
        message: error.message,
        error: error.code,
      });
      return;
    }

    if (error instanceof ProfileDomainException) {
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
