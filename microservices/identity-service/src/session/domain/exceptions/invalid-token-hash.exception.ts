import { SessionDomainException } from "./session-domain.exception";

export class InvalidTokenHashException extends SessionDomainException {
  constructor() {
    super("INVALID_TOKEN_HASH", "El hash del token no es válido");
  }
}
