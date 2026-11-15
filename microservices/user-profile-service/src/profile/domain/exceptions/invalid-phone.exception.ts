import { ProfileDomainException } from "./profile-domain.exception";

export class InvalidPhoneException extends ProfileDomainException {
  constructor(value: string) {
    super("INVALID_PHONE", `El teléfono "${value}" no tiene un formato válido (E.164, entre 7 y 15 dígitos)`);
  }
}
