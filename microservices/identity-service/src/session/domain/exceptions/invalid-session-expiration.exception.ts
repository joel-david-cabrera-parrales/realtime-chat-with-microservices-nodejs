import { SessionDomainException } from "./session-domain.exception";

export class InvalidSessionExpirationException extends SessionDomainException {
  constructor() {
    super("INVALID_SESSION_EXPIRATION", "La fecha de expiración de la sesión debe ser futura");
  }
}
