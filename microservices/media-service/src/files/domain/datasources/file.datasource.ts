import { FileCategory } from "../enums/file-category.enum";
import { FileMetadata } from "../interfaces/file-metadata.interface";

export abstract class FileDataSource {
  abstract save(file: FileMetadata): Promise<void>;
  abstract findByCode(fileCode: string): Promise<FileMetadata | null>;
  abstract findByProfileCode(profileCode: string, category?: FileCategory): Promise<FileMetadata[]>;
  abstract delete(fileCode: string): Promise<void>;
}
