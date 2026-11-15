import { SessionDomainException } from "./session-domain.exception";

export class UsernameAlreadyExistsException extends SessionDomainException {
  constructor(username: string) {
    super("USERNAME_ALREADY_EXISTS", `Ya existe una credencial para el usuario "${username}"`);
  }
}
