import { ChatDomainException } from "./chat-domain.exception";

export class InvalidConversationTitleException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_CONVERSATION_TITLE", `El título "${value}" no es válido`);
  }
}
