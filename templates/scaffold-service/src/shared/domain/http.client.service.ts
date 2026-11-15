export interface HttpRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export interface HttpBinaryResponse {
  statusCode: number;
  headers: Record<string, unknown>;
  data: Buffer;
}

export abstract class HttpClientService {
  public abstract get<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  public abstract post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  public abstract put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  public abstract patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  public abstract delete<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  public abstract getBinary(path: string, options?: HttpRequestOptions): Promise<HttpBinaryResponse>;
}
