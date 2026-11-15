import { SessionDomainException } from "./session-domain.exception";

export class CredentialNotFoundException extends SessionDomainException {
  constructor(username: string) {
    super("CREDENTIAL_NOT_FOUND", `No se encontró una credencial para el usuario "${username}"`);
  }
}
