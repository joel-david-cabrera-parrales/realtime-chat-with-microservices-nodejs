import { ProfileDomainException } from "./profile-domain.exception";

export class InvalidProfileIdException extends ProfileDomainException {
  constructor(value: string) {
    super(
      "INVALID_PROFILE_ID",
      `El identificador de perfil "${value}" no es un UUID válido`,
    );
  }
}
