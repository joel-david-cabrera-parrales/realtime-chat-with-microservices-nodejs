import { ProfileDomainException } from "./profile-domain.exception";

export class InvalidBioException extends ProfileDomainException {
  constructor(maxLength: number) {
    super("INVALID_BIO", `La biografía no puede superar los ${maxLength} caracteres`);
  }
}
