import { ProfileDomainException } from "./profile-domain.exception";

export class ProfileNotFoundException extends ProfileDomainException {
  constructor(id: string) {
    super("PROFILE_NOT_FOUND", `No se encontró un perfil con id "${id}"`);
  }
}
