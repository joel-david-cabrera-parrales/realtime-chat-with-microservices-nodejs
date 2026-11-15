import { httpClient } from "../axios/axios.provider";
import { ProfileClientAdapter } from "./profile.client.adapter";

export const profileClient = new ProfileClientAdapter(httpClient);
