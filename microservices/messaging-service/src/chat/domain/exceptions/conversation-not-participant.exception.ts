import { ChatDomainException } from "./chat-domain.exception";

export class ConversationNotParticipantException extends ChatDomainException {
  constructor(credentialCode: string) {
    super("CONVERSATION_NOT_PARTICIPANT", `La credencial "${credentialCode}" no participa en la conversación`);
  }
}
