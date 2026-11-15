import { FileCategory } from "../enums/file-category.enum";
import { FileMetadata } from "../interfaces/file-metadata.interface";

export abstract class ListFilesUseCase {
  abstract execute(profileCode: string, category?: FileCategory): Promise<FileMetadata[]>;
}
