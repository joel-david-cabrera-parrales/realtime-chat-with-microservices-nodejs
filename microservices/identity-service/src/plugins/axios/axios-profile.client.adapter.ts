import axios, { AxiosInstance } from "axios";
import { ProfileClientService, ProfileCreationData, ProfileData } from "../../shared/domain/profile.client.service";

export interface AxiosProfileClientOptions {
  baseUrl: string;
  internalApiKey?: string | undefined;
  timeout?: number;
}

interface ApiEnvelope<T> {
  data: T;
}

export class AxiosProfileClientAdapter extends ProfileClientService {
  private readonly client: AxiosInstance;

  constructor(options: AxiosProfileClientOptions) {
    super();
    this.client = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeout ?? 5000,
      headers: {
        ...(options.internalApiKey === undefined ? {} : { "X-Internal-Api-Key": options.internalApiKey }),
      },
    });
  }

  public async createProfile(data: ProfileCreationData): Promise<ProfileData> {
    const response = await this.client.post<ApiEnvelope<ProfileData>>("", data);
    return response.data.data;
  }

  public async deleteProfile(profileCode: string): Promise<void> {
    await this.client.delete(`/${profileCode}`);
  }
}
