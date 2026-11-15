import { envService } from "../env/env.provider";
import { JwtAdapter } from "./jwt.adapter";

export const jwtAdapter = new JwtAdapter({
  secret: envService.get("JWT_SECRET"),
  refreshSecret: envService.getOptional("JWT_REFRESH_SECRET"),
  expiresIn: envService.getInt("JWT_ACCESS_EXPIRES_IN", 900),
  refreshExpiresIn: envService.getInt("JWT_REFRESH_EXPIRES_IN", 604800),
});
