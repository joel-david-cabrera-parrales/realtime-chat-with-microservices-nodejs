import dotenv from "dotenv";
import { EnvAdapter } from "../env/env.adapter";
import { AxiosFileClientAdapter } from "./axios-file.client.adapter";

dotenv.config();

const env = new EnvAdapter();

export const fileClient = new AxiosFileClientAdapter({
  baseUrl: env.getOptional("MEDIA_SERVICE_URL") ?? "http://media-service:3000/api/file",
  internalApiKey: env.getOptional("INTERNAL_API_KEY"),
  timeout: env.getInt("MEDIA_SERVICE_TIMEOUT_MS", 15000),
});
