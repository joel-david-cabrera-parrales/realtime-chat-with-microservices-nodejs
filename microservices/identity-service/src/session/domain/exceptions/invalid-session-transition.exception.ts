import { SessionDomainException } from "./session-domain.exception";

export class InvalidSessionTransitionException extends SessionDomainException {
  constructor(from: string, to: string) {
    super("INVALID_SESSION_TRANSITION", `No se puede cambiar el estado de la sesión de "${from}" a "${to}"`);
  }
}
