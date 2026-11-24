import { SessionDomainException } from "./session-domain.exception";

export class CredentialNotAuthenticatedException extends SessionDomainException {
  constructor() {
    super("CREDENTIAL_NOT_AUTHENTICATED", "La credencial no está autenticada");
  }
}
