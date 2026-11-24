import { ProfileDomainException } from "./profile-domain.exception";

export class EmailAlreadyExistsException extends ProfileDomainException {
  constructor(email: string) {
    super("EMAIL_ALREADY_EXISTS", `El email "${email}" ya está registrado`);
  }
}
