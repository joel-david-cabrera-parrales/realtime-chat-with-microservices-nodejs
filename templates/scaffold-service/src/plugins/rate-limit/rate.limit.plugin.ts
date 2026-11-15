import rateLimit from "express-rate-limit";
import { sendError } from "../../shared/http/api-response";

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  handler: (_req, res) => {
    sendError(res, {
      statusCode: 429,
      message: "Demasiados intentos. Intente nuevamente en 15 minutos.",
      error: "Too Many Requests",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
