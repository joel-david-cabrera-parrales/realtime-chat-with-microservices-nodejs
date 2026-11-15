import { ChatDomainException } from "./chat-domain.exception";

export class MessageNotFoundException extends ChatDomainException {
  constructor(code: string) {
    super("MESSAGE_NOT_FOUND", `El mensaje "${code}" no existe`);
  }
}
