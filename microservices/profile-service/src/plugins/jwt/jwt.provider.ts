import dotenv from "dotenv";
import * as env from "env-var";
import { JwtAdapter } from "./jwt.adapter";

dotenv.config();

export const jwtAdapter = new JwtAdapter({
  accessSecret: env.get("JWT_SECRET").required().asString(),
  refreshSecret: env.get("JWT_REFRESH_SECRET").required().asString(),
  accessExpiresIn: env.get("JWT_ACCESS_EXPIRES_IN").default(900).asInt(),
  refreshExpiresIn: env.get("JWT_REFRESH_EXPIRES_IN").default(604800).asInt(),
});
