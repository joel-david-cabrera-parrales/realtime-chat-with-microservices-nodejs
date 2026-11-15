import { SessionDomainException } from "./session-domain.exception";

export class InvalidSessionIdException extends SessionDomainException {
  constructor(value: string) {
    super("INVALID_SESSION_ID", `El id de sesión "${value}" no es un UUID válido`);
  }
}
