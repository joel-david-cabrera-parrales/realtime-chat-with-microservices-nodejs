import { ChatDomainException } from "./chat-domain.exception";

export class MessageNotEditableException extends ChatDomainException {
  constructor() {
    super("MESSAGE_NOT_EDITABLE", "El mensaje no puede editarse");
  }
}
