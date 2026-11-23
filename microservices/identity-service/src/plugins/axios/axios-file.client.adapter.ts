import axios, { AxiosInstance } from "axios";
import { FileClientService, FileUpload, FileUploadData } from "../../shared/domain/services/file.client.service";

export interface AxiosFileClientOptions {
  baseUrl: string;
  internalApiKey?: string | undefined;
  timeout?: number;
}

interface ApiEnvelope<T> {
  data: T;
}

export class AxiosFileClientAdapter extends FileClientService {
  private readonly client: AxiosInstance;

  constructor(options: AxiosFileClientOptions) {
    super();
    this.client = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeout ?? 15000,
      headers: options.internalApiKey === undefined ? {} : { "X-Internal-Api-Key": options.internalApiKey },
    });
  }

  public async uploadProfilePhoto(profileCode: string, file: FileUpload): Promise<FileUploadData> {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(file.buffer)], { type: file.mimeType }), file.originalName);
    const response = await this.client.post<ApiEnvelope<FileUploadData>>("/profile-photo", form, {
      headers: { "x-profile-code": profileCode },
    });
    return response.data.data;
  }

  public async deleteProfilePhoto(profileCode: string): Promise<void> {
    await this.client.delete("/profile-photo", {
      headers: { "x-profile-code": profileCode },
    });
  }
}
