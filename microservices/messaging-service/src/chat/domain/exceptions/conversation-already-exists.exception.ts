import { ChatDomainException } from "./chat-domain.exception";

export class ConversationAlreadyExistsException extends ChatDomainException {
  constructor(directKey: string) {
    super("CONVERSATION_ALREADY_EXISTS", `Ya existe una conversación directa con la clave "${directKey}"`);
  }
}
