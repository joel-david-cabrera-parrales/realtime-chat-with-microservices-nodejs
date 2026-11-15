import { SessionDomainException } from "./session-domain.exception";

export class InvalidTokenExpirationException extends SessionDomainException {
  constructor() {
    super("INVALID_TOKEN_EXPIRATION", "La fecha de expiración del token debe ser futura");
  }
}
