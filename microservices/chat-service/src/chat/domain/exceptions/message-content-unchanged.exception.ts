import { ChatDomainException } from "./chat-domain.exception";

export class MessageContentUnchangedException extends ChatDomainException {
  constructor() {
    super("MESSAGE_CONTENT_UNCHANGED", "El nuevo contenido del mensaje es idéntico al actual");
  }
}
