import { ChatDomainException } from "./chat-domain.exception";

export class InvalidMessageStatusException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_MESSAGE_STATUS", `El estado de mensaje "${value}" no es válido`);
  }
}
