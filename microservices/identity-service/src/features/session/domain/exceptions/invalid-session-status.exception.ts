import { SessionDomainException } from "./session-domain.exception";

export class InvalidSessionStatusException extends SessionDomainException {
  constructor(value: string) {
    super("INVALID_SESSION_STATUS", `El estado de sesión "${value}" no es válido`);
  }
}
