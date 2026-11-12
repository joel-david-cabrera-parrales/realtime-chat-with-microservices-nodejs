import dotenv from "dotenv";
import { AxiosProfileClientAdapter } from "./axios-profile.client.adapter";

dotenv.config();

const baseUrl = process.env.PROFILE_SERVICE_URL ?? "http://profile-service:3000/api/profile";

export const profileClient = new AxiosProfileClientAdapter({ baseUrl });
