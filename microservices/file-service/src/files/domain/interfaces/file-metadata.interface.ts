import { FileCategory } from "../enums/file-category.enum";

export interface FileMetadata {
  id: number;
  fileCode: string;
  profileCode: string;
  category: FileCategory;
  originalName: string;
  storedKey: string;
  mimeType: string;
  sizeBytes: number;
  bucket: string;
  createdAt: Date;
}

export interface FileOutput {
  fileCode: string;
  profileCode: string;
  category: FileCategory;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}
