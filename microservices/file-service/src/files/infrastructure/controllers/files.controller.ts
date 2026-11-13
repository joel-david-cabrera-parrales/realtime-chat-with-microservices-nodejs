import { NextFunction, Request, Response } from "express";
import { sendError, sendSuccess } from "../../../shared/http/api-response";
import { FileCategory } from "../../domain/enums/file-category.enum";
import { FileAccessDeniedException } from "../../domain/exceptions/file-access-denied.exception";
import { ProfileCodeRequiredException } from "../../domain/exceptions/profile-code-required.exception";
import { FileApplicationService } from "../../application/services/file.application.service";

export class FilesController {
  constructor(private readonly fileService: FileApplicationService) {}

  public async uploadProfilePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.upload(req, res, next, FileCategory.PROFILE_PHOTO);
  }

  public async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.upload(req, res, next, FileCategory.DOCUMENT);
  }

  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profileCode = this.getProfileCode(req);
      const category = this.getCategory(req);
      const files = await this.fileService.list(profileCode, category);

      sendSuccess(res, {
        statusCode: 200,
        message: "Archivos obtenidos",
        data: files,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await this.fileService.getByCode(this.getFileCode(req));
      this.assertOwner(req, file.profileCode);

      sendSuccess(res, {
        statusCode: 200,
        message: "Archivo encontrado",
        data: file,
      });
    } catch (error) {
      next(error);
    }
  }

  public async download(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileCode = this.getFileCode(req);
      const file = await this.fileService.getByCode(fileCode);
      this.assertOwner(req, file.profileCode);

      const stream = await this.fileService.getStream(fileCode);
      this.streamFile(res, req, stream);
    } catch (error) {
      next(error);
    }
  }

  public async downloadByKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = String(req.query.key ?? "");

      if (key === "") {
        sendError(res, {
          statusCode: 400,
          message: 'El query param "key" es obligatorio',
          error: "KEY_REQUIRED",
        });
        return;
      }

      const stream = await this.fileService.getStreamByKey(key);
      this.streamFile(res, req, stream);
    } catch (error) {
      next(error);
    }
  }

  public async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileCode = this.getFileCode(req);
      const file = await this.fileService.getByCode(fileCode);
      this.assertOwner(req, file.profileCode);

      const deleted = await this.fileService.remove(fileCode);

      sendSuccess(res, {
        statusCode: 200,
        message: "Archivo eliminado",
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  private async upload(req: Request, res: Response, next: NextFunction, category: FileCategory): Promise<void> {
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

      const uploaded = await this.fileService.upload({
        profileCode: this.getProfileCode(req),
        category,
        originalName: file.originalname,
        mimeType: file.mimetype,
        buffer: file.buffer,
        sizeBytes: file.size,
      });

      sendSuccess(res, {
        statusCode: 201,
        message: "Archivo subido",
        data: uploaded,
      });
    } catch (error) {
      next(error);
    }
  }

  private streamFile(
    res: Response,
    req: Request,
    stream: { body: NodeJS.ReadableStream; contentType: string; contentLength?: number; originalName: string },
  ): void {
    const disposition = req.query.disposition === "inline" ? "inline" : "attachment";

    res.setHeader("Content-Type", stream.contentType);
    if (stream.contentLength !== undefined) {
      res.setHeader("Content-Length", String(stream.contentLength));
    }
    res.setHeader("Content-Disposition", `${disposition}; filename="${encodeURIComponent(stream.originalName)}"`);

    stream.body.pipe(res);
  }

  private getProfileCode(req: Request): string {
    const fromToken = this.getProfileCodeFromToken(req);
    const fromHeader = req.headers["x-profile-code"];
    const profileCode = fromToken ?? (typeof fromHeader === "string" ? fromHeader : undefined);

    if (profileCode === undefined || profileCode === "") {
      throw new ProfileCodeRequiredException();
    }

    return profileCode;
  }

  private getProfileCodeFromToken(req: Request): string | undefined {
    const value = req.res?.locals?.profileCode;
    return typeof value === "string" ? value : undefined;
  }

  private getCategory(req: Request): FileCategory | undefined {
    const category = req.query.category;

    if (category === FileCategory.PROFILE_PHOTO || category === FileCategory.DOCUMENT) {
      return category;
    }

    return undefined;
  }

  private getFileCode(req: Request): string {
    return String(req.params.fileCode ?? "");
  }

  private assertOwner(req: Request, ownerProfileCode: string): void {
    const requester = this.getProfileCodeFromToken(req);

    if (requester !== undefined && requester !== ownerProfileCode) {
      throw new FileAccessDeniedException();
    }
  }
}
