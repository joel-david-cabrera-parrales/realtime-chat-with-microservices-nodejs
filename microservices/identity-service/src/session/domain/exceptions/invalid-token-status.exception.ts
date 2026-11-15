import { SessionDomainException } from "./session-domain.exception";

export class InvalidTokenStatusException extends SessionDomainException {
  constructor(value: string) {
    super("INVALID_TOKEN_STATUS", `El estado de token "${value}" no es válido`);
  }
}
