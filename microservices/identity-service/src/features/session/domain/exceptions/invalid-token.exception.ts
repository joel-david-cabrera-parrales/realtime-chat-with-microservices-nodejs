import { SessionDomainException } from "./session-domain.exception";

export class InvalidTokenException extends SessionDomainException {
  constructor() {
    super("INVALID_TOKEN", "El token no es válido");
  }
}
