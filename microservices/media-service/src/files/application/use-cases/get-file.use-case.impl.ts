import { FileDataSource } from "../../domain/datasources/file.datasource";
import { FileMetadata } from "../../domain/interfaces/file-metadata.interface";
import { GetFileUseCase } from "../../domain/use-cases/get-file.use-case";

export class GetFileUseCaseImpl extends GetFileUseCase {
  constructor(private readonly fileDataSource: FileDataSource) {
    super();
  }

  public execute(fileCode: string): Promise<FileMetadata | null> {
    return this.fileDataSource.findByCode(fileCode);
  }
}
