import { ChatDomainException } from "./chat-domain.exception";

export class ConversationDeletedException extends ChatDomainException {
  constructor(code: string) {
    super("CONVERSATION_DELETED", `La conversación "${code}" fue eliminada y no admite cambios`);
  }
}
