import { FileNotFoundException } from "../../domain/exceptions/file-not-found.exception";
import { FileTooLargeException } from "../../domain/exceptions/file-too-large.exception";
import { InvalidFileTypeException } from "../../domain/exceptions/invalid-file-type.exception";
import { FileCategory } from "../../domain/enums/file-category.enum";
import { FileMetadata, FileOutput } from "../../domain/interfaces/file-metadata.interface";
import { DeleteFileUseCase } from "../../domain/use-cases/delete-file.use-case";
import { GetFileUseCase } from "../../domain/use-cases/get-file.use-case";
import { ListFilesUseCase } from "../../domain/use-cases/list-files.use-case";
import { UploadFileInput } from "../../domain/use-cases/dtos/upload-file.dto";
import { UploadFileUseCase } from "../../domain/use-cases/upload-file.use-case";
import { getFilePolicy, isAllowedMimeType, resolveMimeType } from "../../domain/value-objects/file-policy";
import { S3Object, S3StorageService } from "../../../shared/domain/s3.storage.service";

export interface FileStream {
  body: NodeJS.ReadableStream;
  contentType: string;
  contentLength?: number;
  originalName: string;
}

export class FileApplicationService {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getFileUseCase: GetFileUseCase,
    private readonly listFilesUseCase: ListFilesUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly storageService: S3StorageService,
    private readonly publicBaseUrl: string,
  ) {}

  public async upload(input: UploadFileInput): Promise<FileOutput> {
    const policy = getFilePolicy(input.category);
    const mimeType = resolveMimeType(input.originalName, input.mimeType);

    if (!isAllowedMimeType(input.category, mimeType)) {
      throw new InvalidFileTypeException(mimeType, policy.allowedMimeTypes);
    }

    if (input.sizeBytes > policy.maxSizeBytes) {
      throw new FileTooLargeException(policy.maxSizeBytes);
    }

    if (input.category === FileCategory.PROFILE_PHOTO) {
      await this.removePreviousProfilePhoto(input.profileCode);
    }

    const file = await this.uploadFileUseCase.execute({
      ...input,
      mimeType,
    });

    return this.toOutput(file);
  }

  public async list(profileCode: string, category?: FileCategory): Promise<FileOutput[]> {
    const files = await this.listFilesUseCase.execute(profileCode, category);
    return files.map((file) => this.toOutput(file));
  }

  public async getByCode(fileCode: string): Promise<FileOutput> {
    const file = await this.getFileUseCase.execute(fileCode);

    if (file === null) {
      throw new FileNotFoundException(fileCode);
    }

    return this.toOutput(file);
  }

  public async getStream(fileCode: string): Promise<FileStream> {
    const file = await this.getFileUseCase.execute(fileCode);

    if (file === null) {
      throw new FileNotFoundException(fileCode);
    }

    return this.toStream(file);
  }

  public async getPublicStream(fileCode: string): Promise<FileStream> {
    const file = await this.getFileUseCase.execute(fileCode);

    if (file === null || file.category !== FileCategory.PROFILE_PHOTO) {
      throw new FileNotFoundException(fileCode);
    }

    return this.toStream(file);
  }

  public async getProfilePhoto(profileCode: string): Promise<FileOutput | null> {
    const [photo] = await this.listFilesUseCase.execute(profileCode, FileCategory.PROFILE_PHOTO);
    return photo === undefined ? null : this.toOutput(photo);
  }

  public async deleteProfilePhoto(profileCode: string): Promise<FileOutput | null> {
    const [photo] = await this.listFilesUseCase.execute(profileCode, FileCategory.PROFILE_PHOTO);

    if (photo === undefined) {
      return null;
    }

    const deleted = await this.deleteFileUseCase.execute(photo.fileCode);
    return deleted === null ? null : this.toOutput(deleted);
  }

  public async remove(fileCode: string): Promise<FileOutput> {
    const file = await this.deleteFileUseCase.execute(fileCode);

    if (file === null) {
      throw new FileNotFoundException(fileCode);
    }

    return this.toOutput(file);
  }

  private async removePreviousProfilePhoto(profileCode: string): Promise<void> {
    const previous = await this.listFilesUseCase.execute(profileCode, FileCategory.PROFILE_PHOTO);

    for (const file of previous) {
      await this.deleteFileUseCase.execute(file.fileCode).catch(() => undefined);
    }
  }

  private async toStream(file: FileMetadata): Promise<FileStream> {
    const object: S3Object = await this.storageService.getObject(file.storedKey);

    return {
      body: object.body,
      contentType: object.contentType ?? file.mimeType,
      contentLength: object.contentLength ?? file.sizeBytes,
      originalName: file.originalName,
    };
  }

  private toOutput(file: FileMetadata): FileOutput {
    const base = this.publicBaseUrl.replace(/\/+$/, "");

    return {
      fileCode: file.fileCode,
      profileCode: file.profileCode,
      category: file.category,
      originalName: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      url: `${base}/api/file/${file.fileCode}/download`,
      publicUrl: file.category === FileCategory.PROFILE_PHOTO ? `${base}/api/file/public/${file.fileCode}` : null,
      createdAt: file.createdAt.toISOString(),
    };
  }
}
