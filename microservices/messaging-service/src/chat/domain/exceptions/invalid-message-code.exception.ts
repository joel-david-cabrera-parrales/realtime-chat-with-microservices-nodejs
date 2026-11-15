import { ChatDomainException } from "./chat-domain.exception";

export class InvalidMessageCodeException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_MESSAGE_CODE", `El código de mensaje "${value}" no es válido`);
  }
}
