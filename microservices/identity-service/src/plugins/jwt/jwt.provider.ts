import dotenv from "dotenv";
import { EnvAdapter } from "../env/env.adapter";
import { JwtAdapter } from "./jwt.adapter";

dotenv.config();

const env = new EnvAdapter();

export const jwtAdapter = new JwtAdapter({
  accessSecret: env.get("JWT_SECRET"),
  refreshSecret: env.get("JWT_REFRESH_SECRET"),
  accessExpiresIn: env.getInt("JWT_ACCESS_EXPIRES_IN", 900),
  refreshExpiresIn: env.getInt("JWT_REFRESH_EXPIRES_IN", 604800),
});
