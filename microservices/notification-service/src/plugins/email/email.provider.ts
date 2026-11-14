import { envService } from "../env/env.provider";
import { NodemailerEmailAdapter } from "./nodemailer-email.adapter";

const mailerUser = envService.getOptional("MAILER_USER");

export const emailService = new NodemailerEmailAdapter({
  host: envService.getString("MAILER_HOST", "smtp.gmail.com"),
  port: envService.getInt("MAILER_PORT", 465),
  secure: envService.getBool("MAILER_SECURE", true),
  user: mailerUser,
  password: envService.getOptional("MAILER_SECRET"),
  from: envService.getString("MAILER_FROM", mailerUser ?? "no-reply@chat.local"),
  timeoutMs: envService.getInt("MAILER_TIMEOUT_MS", 10000),
});
