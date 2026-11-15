import { SessionDomainException } from "./session-domain.exception";

export class SessionAccessDeniedException extends SessionDomainException {
  constructor() {
    super("SESSION_ACCESS_DENIED", "No tienes permiso para acceder a esta sesión");
  }
}
