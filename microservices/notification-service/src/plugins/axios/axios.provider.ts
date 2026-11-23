import { envService } from "../env/env.provider";
import { AxiosHttpClientAdapter } from "./axios-http.client.adapter";

export const httpClient = new AxiosHttpClientAdapter({
  baseUrl: envService.getOptional("HTTP_CLIENT_BASE_URL") ?? "http://identity-service:3000/api/profile",
  internalApiKey: envService.getOptional("INTERNAL_API_KEY"),
  timeout: envService.getInt("HTTP_CLIENT_TIMEOUT_MS", 15000),
});
