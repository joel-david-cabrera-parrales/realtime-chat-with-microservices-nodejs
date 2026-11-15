import { ChatDomainException } from "./chat-domain.exception";

export class ConversationParticipantLimitReachedException extends ChatDomainException {
  constructor(limit: number) {
    super("CONVERSATION_PARTICIPANT_LIMIT_REACHED", `La conversación alcanzó el máximo de ${limit} participantes`);
  }
}
