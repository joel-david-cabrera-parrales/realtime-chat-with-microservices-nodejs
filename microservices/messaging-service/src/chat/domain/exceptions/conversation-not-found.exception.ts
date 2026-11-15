import { ChatDomainException } from "./chat-domain.exception";

export class ConversationNotFoundException extends ChatDomainException {
  constructor(code: string) {
    super("CONVERSATION_NOT_FOUND", `La conversación "${code}" no existe`);
  }
}
