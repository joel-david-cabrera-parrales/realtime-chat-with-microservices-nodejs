import { ProfileDomainException } from "./profile-domain.exception";

export class EmailAlreadyExistsException extends ProfileDomainException {
  constructor(value: string) {
    super("EMAIL_ALREADY_EXISTS", `Ya existe un perfil con el email "${value}"`);
  }
}
