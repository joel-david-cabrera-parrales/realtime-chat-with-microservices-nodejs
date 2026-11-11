import { ProfileDomainException } from "./profile-domain.exception";

export class InvalidAvatarUrlException extends ProfileDomainException {
  constructor(value: string) {
    super(
      "INVALID_AVATAR_URL",
      `La URL de avatar "${value}" no es válida o no utiliza http/https`,
    );
  }
}
