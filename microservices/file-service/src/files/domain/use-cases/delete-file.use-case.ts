import { FileMetadata } from "../interfaces/file-metadata.interface";

export abstract class DeleteFileUseCase {
  abstract execute(fileCode: string): Promise<FileMetadata | null>;
}
