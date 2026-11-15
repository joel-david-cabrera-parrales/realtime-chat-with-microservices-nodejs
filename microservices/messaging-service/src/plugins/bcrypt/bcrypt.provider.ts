import { envService } from "../env/env.provider";
import { BcryptAdapter } from "./bcrypt.adapter";

export const hashService = new BcryptAdapter({
  saltRounds: envService.getInt("BCRYPT_SALT_ROUNDS", 10),
});
