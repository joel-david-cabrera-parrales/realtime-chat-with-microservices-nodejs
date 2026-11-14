import axios, { AxiosInstance, AxiosResponse } from "axios";
import { HttpBinaryResponse, HttpClientService, HttpRequestOptions } from "../../shared/domain/http.client.service";

export interface AxiosHttpClientOptions {
  baseUrl: string;
  internalApiKey?: string | undefined;
  timeout?: number;
}

interface ApiEnvelope<T> {
  data: T;
}

export class AxiosHttpClientAdapter extends HttpClientService {
  private readonly client: AxiosInstance;

  constructor(options: AxiosHttpClientOptions) {
    super();
    this.client = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeout ?? 15000,
      headers: {
        ...(options.internalApiKey === undefined ? {} : { "X-Internal-Api-Key": options.internalApiKey }),
      },
    });
  }

  public async get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    const response = await this.client.get(path, this.buildConfig(options));
    return this.unwrap<T>(response);
  }

  public async post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    const response = await this.client.post(path, body, this.buildConfig(options));
    return this.unwrap<T>(response);
  }

  public async put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    const response = await this.client.put(path, body, this.buildConfig(options));
    return this.unwrap<T>(response);
  }

  public async patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    const response = await this.client.patch(path, body, this.buildConfig(options));
    return this.unwrap<T>(response);
  }

  public async delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    const response = await this.client.delete(path, this.buildConfig(options));
    return this.unwrap<T>(response);
  }

  public async getBinary(path: string, options?: HttpRequestOptions): Promise<HttpBinaryResponse> {
    const response = await this.client.get(path, {
      ...this.buildConfig(options),
      responseType: "arraybuffer",
    });

    return {
      statusCode: response.status,
      headers: response.headers as Record<string, unknown>,
      data: Buffer.from(response.data as ArrayBuffer),
    };
  }

  private buildConfig(options?: HttpRequestOptions) {
    return {
      ...(options?.headers === undefined ? {} : { headers: options.headers }),
      ...(options?.params === undefined ? {} : { params: options.params }),
      ...(options?.timeout === undefined ? {} : { timeout: options.timeout }),
    };
  }

  private unwrap<T>(response: AxiosResponse): T {
    const payload = response.data as ApiEnvelope<T> | T;

    if (payload !== null && typeof payload === "object" && "data" in payload) {
      return (payload as ApiEnvelope<T>).data;
    }

    return payload as T;
  }
}
