import { SessionDomainException } from "./session-domain.exception";

export class InvalidPasswordHashException extends SessionDomainException {
  constructor() {
    super("INVALID_PASSWORD_HASH", "El hash de la contraseña no es válido");
  }
}
