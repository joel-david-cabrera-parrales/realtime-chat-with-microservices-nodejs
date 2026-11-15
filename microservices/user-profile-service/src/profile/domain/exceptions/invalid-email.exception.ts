import { ProfileDomainException } from "./profile-domain.exception";

export class InvalidEmailException extends ProfileDomainException {
  constructor(value: string) {
    super("INVALID_EMAIL", `El email "${value}" no es válido`);
  }
}
