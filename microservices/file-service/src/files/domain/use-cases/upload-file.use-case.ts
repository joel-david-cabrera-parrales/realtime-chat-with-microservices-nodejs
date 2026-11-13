import { FileMetadata } from "../interfaces/file-metadata.interface";
import { UploadFileInput } from "./dtos/upload-file.dto";

export abstract class UploadFileUseCase {
  abstract execute(input: UploadFileInput): Promise<FileMetadata>;
}
