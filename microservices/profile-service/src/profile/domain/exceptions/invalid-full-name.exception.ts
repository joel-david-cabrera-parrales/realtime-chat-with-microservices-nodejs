import { ProfileDomainException } from "./profile-domain.exception";

export class InvalidFullNameException extends ProfileDomainException {
  constructor(minLength: number, maxLength: number) {
    super(
      "INVALID_FULL_NAME",
      `El nombre completo debe tener entre ${minLength} y ${maxLength} caracteres y contener al menos una letra`,
    );
  }
}
