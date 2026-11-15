export interface FileUploadData {
  fileCode: string;
  profileCode: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  publicUrl: string | null;
}

export interface FileUpload {
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  sizeBytes: number;
}

export abstract class FileClientService {
  public abstract uploadProfilePhoto(profileCode: string, file: FileUpload): Promise<FileUploadData>;
  public abstract deleteProfilePhoto(profileCode: string): Promise<void>;
}
