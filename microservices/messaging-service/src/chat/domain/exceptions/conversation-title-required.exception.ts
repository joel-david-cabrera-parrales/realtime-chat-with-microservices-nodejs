import { ChatDomainException } from "./chat-domain.exception";

export class ConversationTitleRequiredException extends ChatDomainException {
  constructor() {
    super("CONVERSATION_TITLE_REQUIRED", "Una conversación grupal requiere un título");
  }
}
