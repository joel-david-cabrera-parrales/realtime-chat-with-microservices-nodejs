import { ChatDomainException } from "./chat-domain.exception";

export class ConversationNotAdminException extends ChatDomainException {
  constructor(credentialCode: string) {
    super("CONVERSATION_NOT_ADMIN", `La credencial "${credentialCode}" no es administradora de la conversación`);
  }
}
