import { ChatDomainException } from "./chat-domain.exception";

export class InvalidMessageStatusTransitionException extends ChatDomainException {
  constructor(from: string, to: string) {
    super("INVALID_MESSAGE_STATUS_TRANSITION", `No se puede cambiar el estado del mensaje de "${from}" a "${to}"`);
  }
}
