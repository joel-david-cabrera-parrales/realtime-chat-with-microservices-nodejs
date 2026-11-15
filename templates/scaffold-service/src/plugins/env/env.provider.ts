import dotenv from "dotenv";
import { EnvAdapter } from "./env.adapter";

dotenv.config();

export const envService = new EnvAdapter();
