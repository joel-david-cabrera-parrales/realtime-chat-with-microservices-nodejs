import { NextFunction, Request, Response } from "express";
import { ProfileApplicationServiceContract } from "../../application/contracts/profile.application.service.contract";
import { sendSuccess, sendError } from "../../../../shared/http/api-response";
import { ProfileControllerContract } from "./contracts/profile.controller.contract";
import { CreateProfileInput } from "../../application/use-cases/dtos/create-profile.dto";
import { UpdateProfileInput } from "../../application/use-cases/dtos/update-profile.dto";
import { ProfileDomainException } from "../../domain/exceptions/profile-domain.exception";
import { ProfileNotFoundException } from "../../domain/exceptions/profile-not-found.exception";
import { EmailAlreadyExistsException } from "../../domain/exceptions/email-already-exists.exception";
import { QueryFailedError } from "typeorm";

export class ProfileController extends ProfileControllerContract {
  private readonly profileService: ProfileApplicationServiceContract;

  constructor(profileService: ProfileApplicationServiceContract) {
    super();
    this.profileService = profileService;
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateProfileInput;

      const profile = await this.profileService.create(input);

      sendSuccess(res, {
        statusCode: 201,
        message: "Perfil creado exitosamente",
        data: profile,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id ?? "");
      const profile = await this.profileService.getById(id);

      if (profile === null) {
        sendError(res, {
          statusCode: 404,
          message: "Perfil no encontrado",
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
      const id = String(req.params.id ?? "");
      const request = req.body as UpdateProfileInput;
      const changes: UpdateProfileInput = {};
      if (Object.prototype.hasOwnProperty.call(request, "fullName")) changes.fullName = request.fullName;
      if (Object.prototype.hasOwnProperty.call(request, "phone")) changes.phone = request.phone;
      if (Object.prototype.hasOwnProperty.call(request, "birthDate")) changes.birthDate = request.birthDate;
      if (Object.prototype.hasOwnProperty.call(request, "gender")) changes.gender = request.gender;
      if (Object.prototype.hasOwnProperty.call(request, "bio")) changes.bio = request.bio;
      const profile = await this.profileService.update(id, changes);

      sendSuccess(res, {
        statusCode: 200,
        message: "Perfil actualizado exitosamente",
        data: profile,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.file === undefined) {
        sendError(res, {
          statusCode: 400,
          message: 'No se recibió el archivo en el campo "file"',
          error: "FILE_REQUIRED",
        });
        return;
      }

      const profile = await this.profileService.uploadAvatar({
        id: String(req.params.id ?? ""),
        file: {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          buffer: req.file.buffer,
          sizeBytes: req.file.size,
        },
      });

      sendSuccess(res, { statusCode: 201, message: "Foto de perfil actualizada", data: profile });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id ?? "");
      await this.profileService.delete(id);

      sendSuccess(res, {
        statusCode: 200,
        message: "Perfil eliminado exitosamente",
        data: null,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profiles = await this.profileService.list();

      sendSuccess(res, {
        statusCode: 200,
        message: "Perfiles listados",
        data: profiles,
      });
    } catch (error) {
      next(error);
    }
  }

  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === "23505") {
      sendError(res, { statusCode: 409, message: "El email ya está registrado", error: "EMAIL_ALREADY_EXISTS" });
      return;
    }
    if (error instanceof ProfileNotFoundException) {
      sendError(res, { statusCode: 404, message: error.message, error: error.code });
      return;
    }
    if (error instanceof EmailAlreadyExistsException) {
      sendError(res, { statusCode: 409, message: error.message, error: error.code });
      return;
    }
    if (error instanceof ProfileDomainException) {
      sendError(res, { statusCode: 400, message: error.message, error: error.code });
      return;
    }
    next(error);
  }
}
