import { SessionDomainException } from "./session-domain.exception";

export class TokenNotFoundException extends SessionDomainException {
  constructor(id: string) {
    super("TOKEN_NOT_FOUND", `No se encontró un token con id "${id}"`);
  }
}
