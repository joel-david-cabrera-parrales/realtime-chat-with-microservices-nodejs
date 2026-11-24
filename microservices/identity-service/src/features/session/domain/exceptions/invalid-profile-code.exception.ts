import { SessionDomainException } from "./session-domain.exception";

export class InvalidProfileCodeException extends SessionDomainException {
  constructor(value: string) {
    super("INVALID_PROFILE_CODE", `El código de perfil "${value}" no es un UUID válido`);
  }
}
