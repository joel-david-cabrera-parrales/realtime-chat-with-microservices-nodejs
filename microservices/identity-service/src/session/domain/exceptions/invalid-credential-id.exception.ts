import { SessionDomainException } from "./session-domain.exception";

export class InvalidCredentialIdException extends SessionDomainException {
  constructor() {
    super("INVALID_CREDENTIAL_ID", "El id de credencial debe ser un entero positivo");
  }
}
