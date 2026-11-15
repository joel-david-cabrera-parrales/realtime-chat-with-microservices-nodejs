import { FileDataSource } from "../../domain/datasources/file.datasource";
import { FileMetadata } from "../../domain/interfaces/file-metadata.interface";
import { DeleteFileUseCase } from "../../domain/use-cases/delete-file.use-case";
import { S3StorageService } from "../../../shared/domain/s3.storage.service";

export class DeleteFileUseCaseImpl extends DeleteFileUseCase {
  constructor(
    private readonly fileDataSource: FileDataSource,
    private readonly storageService: S3StorageService,
  ) {
    super();
  }

  public async execute(fileCode: string): Promise<FileMetadata | null> {
    const file = await this.fileDataSource.findByCode(fileCode);

    if (file === null) {
      return null;
    }

    await this.storageService.deleteObject(file.storedKey);
    await this.fileDataSource.delete(fileCode);

    return file;
  }
}
