import { SessionDomainException } from "./session-domain.exception";

export class SessionExpiredException extends SessionDomainException {
  constructor() {
    super("SESSION_EXPIRED", "La sesión ha expirado");
  }
}
