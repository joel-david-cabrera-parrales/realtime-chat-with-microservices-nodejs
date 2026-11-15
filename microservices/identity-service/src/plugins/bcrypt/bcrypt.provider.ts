import dotenv from "dotenv";
import { BcryptAdapter } from "./bcrypt.adapter";

dotenv.config();

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

export const bcryptAdapter = new BcryptAdapter(saltRounds);
