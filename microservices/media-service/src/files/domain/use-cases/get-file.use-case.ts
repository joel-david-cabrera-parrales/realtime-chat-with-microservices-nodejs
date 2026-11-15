import { FileMetadata } from "../interfaces/file-metadata.interface";

export abstract class GetFileUseCase {
  abstract execute(fileCode: string): Promise<FileMetadata | null>;
}
