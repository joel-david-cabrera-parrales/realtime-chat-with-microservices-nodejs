import { ChatDomainException } from "./chat-domain.exception";

export class InvalidConversationCodeException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_CONVERSATION_CODE", `El código de conversación "${value}" no es válido`);
  }
}
