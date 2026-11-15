import { SessionDomainException } from "./session-domain.exception";

export class InvalidUsernameException extends SessionDomainException {
  constructor(minLength: number, maxLength: number) {
    super(
      "INVALID_USERNAME",
      `El usuario debe tener entre ${minLength} y ${maxLength} caracteres y solo puede contener letras, números, ".", "_", "-" y "@"`,
    );
  }
}
