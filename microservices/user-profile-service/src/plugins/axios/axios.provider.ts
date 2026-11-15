import { envService } from "../env/env.provider";
import { AxiosFileClientAdapter } from "./axios-file.client.adapter";

export const fileClient = new AxiosFileClientAdapter({
  baseUrl: envService.getOptional("FILE_SERVICE_URL") ?? "http://media-service:3000/api/file",
  internalApiKey: envService.getOptional("INTERNAL_API_KEY"),
});
