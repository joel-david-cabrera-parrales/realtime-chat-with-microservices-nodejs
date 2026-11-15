import { SessionDomainException } from "./session-domain.exception";

export class InvalidCredentialCodeException extends SessionDomainException {
  constructor(value: string) {
    super("INVALID_CREDENTIAL_CODE", `El código de credencial "${value}" no es un UUID válido`);
  }
}
