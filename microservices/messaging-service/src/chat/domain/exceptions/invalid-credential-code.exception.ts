import { ChatDomainException } from "./chat-domain.exception";

export class InvalidCredentialCodeException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_CREDENTIAL_CODE", `El código de credencial "${value}" no es válido`);
  }
}
