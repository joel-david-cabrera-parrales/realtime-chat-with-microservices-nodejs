import { SessionDomainException } from "./session-domain.exception";

export class InvalidUserAgentException extends SessionDomainException {
  constructor(maxLength: number) {
    super("INVALID_USER_AGENT", `El user agent no es válido o supera los ${maxLength} caracteres`);
  }
}
