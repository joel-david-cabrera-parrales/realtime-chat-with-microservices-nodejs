import { FileDataSource } from "../../domain/datasources/file.datasource";
import { FileCategory } from "../../domain/enums/file-category.enum";
import { FileMetadata } from "../../domain/interfaces/file-metadata.interface";
import { ListFilesUseCase } from "../../domain/use-cases/list-files.use-case";

export class ListFilesUseCaseImpl extends ListFilesUseCase {
  constructor(private readonly fileDataSource: FileDataSource) {
    super();
  }

  public execute(profileCode: string, category?: FileCategory): Promise<FileMetadata[]> {
    return this.fileDataSource.findByProfileCode(profileCode, category);
  }
}
