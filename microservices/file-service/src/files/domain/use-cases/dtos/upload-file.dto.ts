import { FileCategory } from "../../enums/file-category.enum";

export interface UploadFileInput {
  profileCode: string;
  category: FileCategory;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  sizeBytes: number;
}
