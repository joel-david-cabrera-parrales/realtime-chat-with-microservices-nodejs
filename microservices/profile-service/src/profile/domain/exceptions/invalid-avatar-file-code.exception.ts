import { ProfileDomainException } from "./profile-domain.exception";

export class InvalidAvatarFileCodeException extends ProfileDomainException {
  constructor(value: string) {
    super("INVALID_AVATAR_FILE_CODE", `El file code de avatar "${value}" no es un UUID válido`);
  }
}
