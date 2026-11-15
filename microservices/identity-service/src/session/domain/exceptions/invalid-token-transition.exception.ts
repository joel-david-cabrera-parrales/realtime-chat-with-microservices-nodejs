import { SessionDomainException } from "./session-domain.exception";

export class InvalidTokenTransitionException extends SessionDomainException {
  constructor(from: string, to: string) {
    super("INVALID_TOKEN_TRANSITION", `No se puede cambiar el estado del token de "${from}" a "${to}"`);
  }
}
