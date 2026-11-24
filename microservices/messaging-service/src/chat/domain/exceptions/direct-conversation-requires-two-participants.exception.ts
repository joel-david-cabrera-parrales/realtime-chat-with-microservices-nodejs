import { ChatDomainException } from "./chat-domain.exception";

export class DirectConversationRequiresTwoParticipantsException extends ChatDomainException {
  constructor(count: number) {
    super("DIRECT_CONVERSATION_REQUIRES_TWO_PARTICIPANTS", `Una conversación directa requiere exactamente 2 participantes (recibidos ${count})`);
  }
}
