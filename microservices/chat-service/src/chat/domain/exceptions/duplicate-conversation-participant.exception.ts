import { ChatDomainException } from "./chat-domain.exception";

export class DuplicateConversationParticipantException extends ChatDomainException {
  constructor(credentialCode: string) {
    super("DUPLICATE_CONVERSATION_PARTICIPANT", `La credencial "${credentialCode}" ya participa en la conversación`);
  }
}
