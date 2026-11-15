import { SessionDomainException } from "./session-domain.exception";

export class InvalidPasswordException extends SessionDomainException {
  constructor(minLength: number, maxLength: number) {
    super("INVALID_PASSWORD", `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres`);
  }
}
