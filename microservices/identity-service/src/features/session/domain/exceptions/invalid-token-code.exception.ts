import { SessionDomainException } from "./session-domain.exception";

export class InvalidTokenCodeException extends SessionDomainException {
  constructor(value: string) {
    super("INVALID_TOKEN_CODE", `El código de token "${value}" no es un UUID válido`);
  }
}
