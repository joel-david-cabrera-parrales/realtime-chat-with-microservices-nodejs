import { ChatDomainException } from "./chat-domain.exception";

export class DirectConversationParticipantsImmutableException extends ChatDomainException {
  constructor() {
    super("DIRECT_CONVERSATION_PARTICIPANTS_IMMUTABLE", "Los participantes de una conversación directa no se pueden modificar");
  }
}
