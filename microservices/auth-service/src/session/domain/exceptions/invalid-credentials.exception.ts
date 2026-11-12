import { SessionDomainException } from "./session-domain.exception";

export class InvalidCredentialsException extends SessionDomainException {
  constructor() {
    super("INVALID_CREDENTIALS", "Las credenciales son incorrectas");
  }
}
