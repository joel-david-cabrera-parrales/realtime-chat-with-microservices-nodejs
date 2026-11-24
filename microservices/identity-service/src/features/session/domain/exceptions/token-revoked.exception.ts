import { SessionDomainException } from "./session-domain.exception";

export class TokenRevokedException extends SessionDomainException {
  constructor() {
    super("TOKEN_REVOKED", "El token ha sido revocado");
  }
}
