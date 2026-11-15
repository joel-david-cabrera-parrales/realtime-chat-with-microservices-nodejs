import { ChatDomainException } from "./chat-domain.exception";

export class InvalidConversationTypeException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_CONVERSATION_TYPE", `El tipo de conversación "${value}" no es válido`);
  }
}
