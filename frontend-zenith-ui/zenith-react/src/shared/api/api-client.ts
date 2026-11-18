import { env } from "@/shared/env";
import { authStorage } from "@/shared/storage/auth.storage";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiClientOptions {
  baseURL?: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL ?? env.API_BASE_URL;
    this.defaultHeaders = options.headers ?? {};
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = this.baseURL + path;

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...customHeaders,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    // Inyectar token de acceso si existe
    const token = authStorage.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Si el token expiró (401), intentar refresh automático
    if (response.status === 401) {
      const refreshed = await this.attemptRefresh();
      if (refreshed) {
        // Reintentar la petición original con el nuevo token
        const newToken = authStorage.getToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
        }
        return this.request(method, path, body, customHeaders);
      }

      // Si el refresh falló, limpiar sesión
      authStorage.clear();
      throw new Error("Sesión expirada. Inicia sesión nuevamente.");
    }

    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ message: `Error ${response.status}` }));
      throw new Error(
        (errorBody as { message?: string }).message ?? `Error ${response.status}`
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private async attemptRefresh(): Promise<boolean> {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const tokens = data.data as {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };

      authStorage.setToken(tokens.accessToken);
      authStorage.setRefreshToken(tokens.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(path: string, customHeaders?: Record<string, string>) {
    return this.request<T>("GET", path, undefined, customHeaders);
  }

  post<T>(
    path: string,
    body?: unknown,
    customHeaders?: Record<string, string>
  ) {
    return this.request<T>("POST", path, body, customHeaders);
  }

  put<T>(
    path: string,
    body?: unknown,
    customHeaders?: Record<string, string>
  ) {
    return this.request<T>("PUT", path, body, customHeaders);
  }

  patch<T>(
    path: string,
    body?: unknown,
    customHeaders?: Record<string, string>
  ) {
    return this.request<T>("PATCH", path, body, customHeaders);
  }

  delete<T>(path: string, customHeaders?: Record<string, string>) {
    return this.request<T>("DELETE", path, undefined, customHeaders);
  }
}

export const apiClient = new ApiClient();
