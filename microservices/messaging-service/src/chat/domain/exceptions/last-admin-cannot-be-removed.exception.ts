import { ChatDomainException } from "./chat-domain.exception";

export class LastAdminCannotBeRemovedException extends ChatDomainException {
  constructor() {
    super("LAST_ADMIN_CANNOT_BE_REMOVED", "No se puede eliminar al último administrador de la conversación");
  }
}
