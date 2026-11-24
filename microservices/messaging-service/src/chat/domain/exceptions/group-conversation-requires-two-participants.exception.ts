import { ChatDomainException } from "./chat-domain.exception";

export class GroupConversationRequiresTwoParticipantsException extends ChatDomainException {
  constructor(count: number) {
    super("GROUP_CONVERSATION_REQUIRES_TWO_PARTICIPANTS", `Una conversación grupal requiere al menos 2 participantes (recibidos ${count})`);
  }
}
