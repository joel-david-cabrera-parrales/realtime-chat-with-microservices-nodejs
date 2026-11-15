import { SessionDomainException } from "./session-domain.exception";

export class TokenExpiredException extends SessionDomainException {
  constructor() {
    super("TOKEN_EXPIRED", "El token ha expirado");
  }
}
