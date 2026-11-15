import { ChatDomainException } from "./chat-domain.exception";

export class MessageAlreadyDeletedException extends ChatDomainException {
  constructor() {
    super("MESSAGE_ALREADY_DELETED", "El mensaje ya fue eliminado");
  }
}
