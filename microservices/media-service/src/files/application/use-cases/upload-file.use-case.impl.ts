import { FileDataSource } from "../../domain/datasources/file.datasource";
import { FileMetadata } from "../../domain/interfaces/file-metadata.interface";
import { UploadFileInput } from "../../domain/use-cases/dtos/upload-file.dto";
import { UploadFileUseCase } from "../../domain/use-cases/upload-file.use-case";
import { getExtension, getFilePolicy } from "../../domain/value-objects/file-policy";
import { CodeGeneratorService } from "../../../shared/domain/code.generator.service";
import { S3StorageService } from "../../../shared/domain/s3.storage.service";

export class UploadFileUseCaseImpl extends UploadFileUseCase {
  constructor(
    private readonly fileDataSource: FileDataSource,
    private readonly storageService: S3StorageService,
    private readonly codeGenerator: CodeGeneratorService,
  ) {
    super();
  }

  public async execute(input: UploadFileInput): Promise<FileMetadata> {
    const policy = getFilePolicy(input.category);
    const extension = getExtension(input.originalName);
    const fileCode = this.codeGenerator.generateCode();
    const storedKey = `${policy.storagePrefix}/${input.profileCode}/${fileCode}${extension !== "" ? `.${extension}` : ""}`;

    await this.storageService.putObject(storedKey, input.buffer, input.mimeType);

    const file: FileMetadata = {
      id: 0,
      fileCode,
      profileCode: input.profileCode,
      category: input.category,
      originalName: input.originalName,
      storedKey,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      bucket: this.storageService.getBucketName(),
      createdAt: new Date(),
    };

    try {
      await this.fileDataSource.save(file);
    } catch (error) {
      await this.storageService.deleteObject(storedKey).catch(() => undefined);
      throw error;
    }

    return file;
  }
}
