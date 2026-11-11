import { ProfileDomainException } from "./profile-domain.exception";

export class InvalidBirthDateException extends ProfileDomainException {
  constructor(reason: string) {
    super(
      "INVALID_BIRTH_DATE",
      `La fecha de nacimiento no es válida: ${reason}`,
    );
  }
}
