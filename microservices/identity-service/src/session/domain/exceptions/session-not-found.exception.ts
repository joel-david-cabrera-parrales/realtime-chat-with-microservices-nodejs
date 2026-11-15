import { SessionDomainException } from "./session-domain.exception";

export class SessionNotFoundException extends SessionDomainException {
  constructor(id: string) {
    super("SESSION_NOT_FOUND", `No se encontró una sesión con id "${id}"`);
  }
}
